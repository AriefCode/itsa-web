import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Token anti-spam untuk form aspirasi.
 *
 * Menggantikan timestamp `dibuka` yang dulu dikirim klien di badan permintaan.
 * Nilai itu tidak bertanda tangan, jadi pengirim bisa mengarangnya bebas
 * (termasuk `0`, yang selalu lolos pemeriksaan "sudah cukup lama") dan lapis
 * waktu-isi minimum praktis tidak menahan apa pun.
 *
 * Token ini diterbitkan server saat halaman form dirender, lalu diverifikasi
 * kembali saat kiriman masuk. Dua sifat yang didapat:
 *
 * 1. Waktu buka form tidak lagi bisa dipalsukan — `iat` ikut ditandatangani.
 * 2. Pengirim wajib mengambil halaman formnya dulu, sehingga POST buta
 *    langsung ke endpoint tanpa memuat halaman akan gagal.
 *
 * BUKAN sekali pakai: dalam masa berlakunya, token yang sama bisa dipakai
 * beberapa kali. Membuatnya sekali pakai butuh state server (Set/Redis).
 * Kendali kuantitatifnya tetap pembatasan laju per IP di rute pengiriman.
 */

/**
 * Sengaja dibaca saat modul dimuat dan TANPA nilai cadangan. Kalau di-fallback
 * ke string kosong, HMAC tetap terhitung dengan kunci kosong dan token bisa
 * ditempa siapa pun yang tahu skemanya — gagal diam-diam ke keadaan tidak aman.
 * Lebih baik berhenti keras di sini.
 */
const RAHASIA = process.env.PAYLOAD_SECRET
if (!RAHASIA) {
  throw new Error(
    'PAYLOAD_SECRET wajib diisi — token anti-spam aspirasi tidak bisa ditandatangani tanpanya.',
  )
}

/** Umur maksimum token. Membatasi jendela pemakaian ulang. */
const UMUR_MAKSIMUM_MS = 30 * 60 * 1000

/** Panjang digest sha256 dalam heksadesimal. */
const PANJANG_TANDA_TANGAN = 64

const tandaTangan = (iat: string): string =>
  createHmac('sha256', RAHASIA).update(iat).digest('hex')

/** Diterbitkan saat halaman form dirender. */
export const buatToken = (sekarang: number = Date.now()): string => {
  const iat = String(sekarang)
  return `${iat}.${tandaTangan(iat)}`
}

export type HasilVerifikasi = { sah: true } | { sah: false; status: number; pesan: string }

/**
 * Memeriksa keaslian token dan memastikan usianya masuk akal.
 *
 * `waktuIsiMinimumMs` datang dari pemanggil supaya ambangnya tetap berada di
 * satu tempat bersama pengaman lain di rute pengiriman.
 */
export const verifikasiToken = (
  nilai: unknown,
  waktuIsiMinimumMs: number,
  sekarang: number = Date.now(),
): HasilVerifikasi => {
  const tolak = {
    sah: false as const,
    status: 400,
    pesan: 'Sesi form tidak dikenali. Muat ulang halaman lalu kirim lagi.',
  }

  if (typeof nilai !== 'string') return tolak

  const [iat, sig] = nilai.split('.')
  if (!iat || !sig || sig.length !== PANJANG_TANDA_TANGAN) return tolak

  const waktu = Number(iat)
  if (!Number.isFinite(waktu)) return tolak

  // Dibandingkan sebagai buffer dengan timingSafeEqual, bukan `===`, supaya
  // lama perbandingannya tidak bergantung berapa karakter awal yang cocok.
  const diharapkan = Buffer.from(tandaTangan(iat), 'hex')
  const diterima = Buffer.from(sig, 'hex')
  if (diterima.length !== diharapkan.length) return tolak
  if (!timingSafeEqual(diterima, diharapkan)) return tolak

  const usia = sekarang - waktu
  // Usia negatif (token bertanggal masa depan) ikut tertangkap di sini.
  if (usia < waktuIsiMinimumMs) {
    return {
      sah: false,
      status: 429,
      pesan: 'Kiriman terlalu cepat. Coba kirim ulang sebentar lagi.',
    }
  }
  if (usia > UMUR_MAKSIMUM_MS) {
    return {
      sah: false,
      status: 400,
      pesan: 'Halaman sudah terlalu lama dibuka. Muat ulang lalu kirim lagi.',
    }
  }

  return { sah: true }
}
