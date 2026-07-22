import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

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
 * 2. Waktu isi minimum. Manusia butuh beberapa detik menulis; skrip mengirim
 *    seketika.
 * 3. Pembatasan laju per alamat IP.
 *
 * Ini menahan bot serampangan, bukan penyerang yang serius. Kalau kelak
 * situsnya jadi sasaran, tambahkan CAPTCHA atau pembatasan di tingkat Nginx.
 */

const BATAS_KIRIM = 5
const JENDELA_MS = 10 * 60 * 1000
const WAKTU_ISI_MINIMUM_MS = 3000
const PANJANG_MAKSIMUM = 2000

/**
 * Catatan laju disimpan di memori proses. Cukup untuk satu proses Node seperti
 * yang dipakai di VPS kampus. Kalau nanti dijalankan multi-proses lewat PM2
 * cluster, tiap proses punya hitungannya sendiri sehingga batas efektifnya
 * berlipat; pindahkan ke Redis atau batasi di Nginx bila itu terjadi.
 */
const catatan = new Map<string, { jumlah: number; resetPada: number }>()

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
  let body: { isi?: unknown; website?: unknown; dibuka?: unknown }

  try {
    body = await request.json()
  } catch {
    return Response.json({ pesan: 'Format kiriman tidak dikenali.' }, { status: 400 })
  }

  // Lapis 1: honeypot. Balas seolah berhasil, tapi tidak menyimpan apa pun.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return Response.json({ pesan: 'Aspirasi terkirim.' }, { status: 200 })
  }

  // Lapis 2: waktu pengisian.
  const dibuka = Number(body.dibuka)
  if (!Number.isFinite(dibuka) || Date.now() - dibuka < WAKTU_ISI_MINIMUM_MS) {
    return Response.json(
      { pesan: 'Kiriman terlalu cepat. Coba kirim ulang sebentar lagi.' },
      { status: 429 },
    )
  }

  // Lapis 3: batas laju per IP.
  const h = await headers()
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip')?.trim() || 'tanpa-ip'

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
  if (isi.length > PANJANG_MAKSIMUM) {
    return Response.json(
      { pesan: `Aspirasi terlalu panjang, maksimal ${PANJANG_MAKSIMUM} karakter.` },
      { status: 400 },
    )
  }

  try {
    const payload = await getPayload({ config: configPromise })
    await payload.create({
      collection: 'aspirasi',
      // Hanya `isi` yang diteruskan. Field moderasi tidak pernah diambil dari
      // kiriman publik, apa pun yang dikirim di body.
      data: { isi },
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
