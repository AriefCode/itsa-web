import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

import {
  kategoriSah,
  PANJANG_ISI_MAKSIMUM,
  PANJANG_JUDUL_MAKSIMUM,
} from '@/utilities/aspirasi'
import { verifikasiToken } from '@/utilities/tokenAspirasi'

/**
 * Penerimaan aspirasi anonim.
 *
 * Semua pengiriman publik lewat sini, BUKAN langsung ke /api/aspirasi.
 * Collection-nya sendiri menutup `create` untuk publik, jadi rute ini satu-
 * satunya pintu masuk dan pengaman di bawah tidak bisa dilewati dengan
 * menembak endpoint Payload secara langsung.
 *
 * Tiga lapis pengaman, sengaja yang murah dan tanpa dependensi baru:
 *
 * 1. Honeypot. Ada field yang disembunyikan dari manusia; bot pengisi-semua-
 *    kolom akan mengisinya. Kalau terisi, kiriman dibuang diam-diam dengan
 *    balasan sukses palsu supaya pembuat bot tidak belajar apa yang menahannya.
 * 2. Token terbitan server. Manusia butuh beberapa detik menulis; skrip
 *    mengirim seketika. Waktu buka form ikut ditandatangani di dalam token
 *    (lihat utilities/tokenAspirasi.ts), jadi tidak bisa dikarang pengirim.
 * 3. Pembatasan laju per alamat IP.
 *
 * Ini menahan bot serampangan, bukan penyerang yang serius. Kalau kelak
 * situsnya jadi sasaran, tambahkan CAPTCHA atau pembatasan di tingkat Nginx.
 */

const BATAS_KIRIM = 5
const JENDELA_MS = 10 * 60 * 1000
const WAKTU_ISI_MINIMUM_MS = 3000

/**
 * Catatan laju disimpan di memori proses. Cukup untuk satu proses Node seperti
 * yang dipakai di VPS kampus. Kalau nanti dijalankan multi-proses lewat PM2
 * cluster, tiap proses punya hitungannya sendiri sehingga batas efektifnya
 * berlipat; pindahkan ke Redis atau batasi di Nginx bila itu terjadi.
 */
const catatan = new Map<string, { jumlah: number; resetPada: number }>()

/** Ember bersama untuk pengirim yang alamatnya tidak bisa dipastikan. */
const EMBER_BERSAMA = 'tanpa-proxy'

/**
 * Nama header yang boleh dipercaya sebagai alamat pengirim.
 *
 * SENGAJA TANPA NILAI BAWAAN. Header apa pun bisa dikirim langsung oleh klien;
 * ia hanya tepercaya kalau ada proxy di depan yang MENIMPANYA. Karena aplikasi
 * tidak bisa tahu sendiri apakah proxy itu ada, satu-satunya jawaban aman saat
 * variabel ini kosong adalah tidak membaca header apa pun.
 *
 * Memberi nilai bawaan (mis. 'x-real-ip') akan membuat deploy yang belum
 * dikonfigurasi memercayai header karangan penyerang — pembatasan lajunya
 * lolos begitu saja, hanya berpindah header. Itu gagal ke arah longgar.
 *
 * Isi sesuai topologi yang BENAR-BENAR berjalan:
 *   x-real-ip        → Nginx dengan `proxy_set_header X-Real-IP $remote_addr;`
 *   cf-connecting-ip → ada Cloudflare di depan Nginx
 *
 * Lihat README bagian "Deploy" untuk konfigurasi lengkap dan konsekuensinya.
 */

/**
 * Header yang TIDAK PERNAH boleh dipakai sebagai kunci, walau dikonfigurasi.
 *
 * Keduanya berisi daftar beruas koma yang boleh ditambahi klien. Memakai
 * nilai mentahnya sebagai kunci Map berarti pengirim bisa mengarang kunci
 * sebanyak yang ia mau — pembatasan lajunya lolos, dan `catatan` membengkak
 * satu entri per permintaan. Menolaknya di sini menutup kedua akibat itu
 * sekaligus, terlepas dari apa yang tertulis di environment.
 */
const HEADER_TERLARANG = new Set(['x-forwarded-for', 'forwarded'])

/**
 * Kunci yang lebih panjang dari ini ditolak. Alamat IPv6 terpanjang 45
 * karakter, jadi 64 memberi kelonggaran wajar sambil tetap membatasi memori
 * per entri.
 */
const PANJANG_KUNCI_MAKSIMUM = 64

/**
 * Nama header tepercaya setelah disaring. `undefined` berarti tidak ada header
 * yang dibaca sama sekali.
 */
export const headerIpTepercaya = ((): string | undefined => {
  const nama = process.env.TRUSTED_IP_HEADER?.trim().toLowerCase()
  if (!nama) return undefined
  // Konfigurasi yang tidak aman diabaikan, bukan dituruti. Peringatannya
  // diterbitkan saat start oleh src/instrumentation.ts.
  if (HEADER_TERLARANG.has(nama)) return undefined
  return nama
})()

const ipPengirim = (h: Headers): string => {
  // Tanpa konfigurasi eksplisit, tidak ada header yang dibaca sama sekali:
  // seluruh pengirim berbagi satu ember. Batasnya jadi terlalu ketat, dan itu
  // memang pilihan yang dikehendaki — salah konfigurasi tidak boleh berujung
  // pada pembatasan laju yang bisa dilewati.
  if (!headerIpTepercaya) return EMBER_BERSAMA

  const nilai = h.get(headerIpTepercaya)?.trim()
  if (!nilai) return EMBER_BERSAMA

  // Sabuk pengaman kedua, kalau-kalau header yang dikonfigurasi ternyata tetap
  // membawa daftar beruas koma (mis. proxy yang meneruskan apa adanya). Satu
  // permintaan hanya boleh menghasilkan satu alamat.
  if (nilai.includes(',')) return EMBER_BERSAMA
  if (nilai.length > PANJANG_KUNCI_MAKSIMUM) return EMBER_BERSAMA

  return nilai
}

const lewatBatas = (ip: string): boolean => {
  const sekarang = Date.now()
  const rekam = catatan.get(ip)

  if (!rekam || sekarang > rekam.resetPada) {
    catatan.set(ip, { jumlah: 1, resetPada: sekarang + JENDELA_MS })
    // Bersihkan entri kedaluwarsa sekalian, supaya Map tidak tumbuh selamanya.
    if (catatan.size > 500) {
      for (const [k, v] of catatan) if (sekarang > v.resetPada) catatan.delete(k)
    }
    return false
  }

  rekam.jumlah += 1
  return rekam.jumlah > BATAS_KIRIM
}

export async function POST(request: Request): Promise<Response> {
  let body: {
    judul?: unknown
    kategori?: unknown
    isi?: unknown
    website?: unknown
    token?: unknown
  }

  try {
    body = await request.json()
  } catch {
    return Response.json({ pesan: 'Format kiriman tidak dikenali.' }, { status: 400 })
  }

  // Lapis 1: honeypot. Balas seolah berhasil, tapi tidak menyimpan apa pun.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return Response.json({ pesan: 'Aspirasi terkirim.' }, { status: 200 })
  }

  // Lapis 2: token terbitan server. Waktu buka form ada di dalam token dan
  // ikut ditandatangani, jadi pengirim tidak bisa mengarangnya.
  const hasilToken = verifikasiToken(body.token, WAKTU_ISI_MINIMUM_MS)
  if (!hasilToken.sah) {
    return Response.json({ pesan: hasilToken.pesan }, { status: hasilToken.status })
  }

  // Lapis 3: batas laju per IP.
  const h = await headers()
  const ip = ipPengirim(h)

  if (lewatBatas(ip)) {
    return Response.json(
      { pesan: 'Terlalu banyak kiriman dari perangkat ini. Coba lagi nanti.' },
      { status: 429 },
    )
  }

  const isi = typeof body.isi === 'string' ? body.isi.trim() : ''
  if (isi.length < 10) {
    return Response.json({ pesan: 'Aspirasi terlalu pendek, minimal 10 karakter.' }, { status: 400 })
  }
  if (isi.length > PANJANG_ISI_MAKSIMUM) {
    return Response.json(
      { pesan: `Aspirasi terlalu panjang, maksimal ${PANJANG_ISI_MAKSIMUM} karakter.` },
      { status: 400 },
    )
  }

  const judul = typeof body.judul === 'string' ? body.judul.trim() : ''
  if (judul.length < 4) {
    return Response.json({ pesan: 'Judul terlalu pendek, minimal 4 karakter.' }, { status: 400 })
  }
  if (judul.length > PANJANG_JUDUL_MAKSIMUM) {
    return Response.json(
      { pesan: `Judul terlalu panjang, maksimal ${PANJANG_JUDUL_MAKSIMUM} karakter.` },
      { status: 400 },
    )
  }

  // Kategori dicocokkan ke daftar resmi, bukan sekadar dicek "ada isinya".
  // Tanpa ini kiriman bisa menaruh nilai apa pun dan lolos ke database, lalu
  // muncul sebagai kategori asing yang tidak bisa disaring di halaman publik.
  if (!kategoriSah(body.kategori)) {
    return Response.json({ pesan: 'Pilih salah satu kategori yang tersedia.' }, { status: 400 })
  }
  const kategori = body.kategori

  try {
    const payload = await getPayload({ config: configPromise })
    await payload.create({
      collection: 'aspirasi',
      // Hanya field yang memang diisi pengirim yang diteruskan. Field moderasi
      // tidak pernah diambil dari kiriman publik, apa pun yang dikirim di body.
      data: { judul, kategori, isi },
      overrideAccess: true,
    })
    return Response.json({ pesan: 'Aspirasi terkirim.' }, { status: 201 })
  } catch {
    return Response.json(
      { pesan: 'Gagal menyimpan aspirasi. Coba lagi beberapa saat lagi.' },
      { status: 500 },
    )
  }
}
