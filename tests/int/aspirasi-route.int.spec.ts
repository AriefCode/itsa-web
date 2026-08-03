import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Regresi untuk ASP-01: pengaman anti-spam rute pengiriman aspirasi.
 *
 * Sebelum perbaikan, dua lapis di rute ini mengambil keputusan dari data yang
 * dikendalikan pengirim:
 *
 * - `dibuka` dibaca mentah dari badan permintaan, sehingga `dibuka: 0` selalu
 *   lolos pemeriksaan "sudah cukup lama mengisi".
 * - Kunci pembatasan laju diambil dari entri terdepan `X-Forwarded-For`, yang
 *   dikarang pengirim, sehingga jatah bisa direset dengan mengganti headernya.
 *
 * Dua test pertama di bawah gagal pada kode sebelum perbaikan.
 */

// Secret dipasang sebelum modul mana pun diimpor: tokenAspirasi.ts membacanya
// saat dimuat dan sengaja melempar kalau kosong.
process.env.PAYLOAD_SECRET = 'rahasia-uji-jangan-dipakai-di-produksi'

/**
 * Menyetel TRUSTED_IP_HEADER lalu memuat ulang modul rute, karena nilainya
 * dibaca sekali saat modul dimuat.
 */
const denganHeaderTepercaya = async (nama: string | undefined) => {
  if (nama === undefined) delete process.env.TRUSTED_IP_HEADER
  else process.env.TRUSTED_IP_HEADER = nama
  vi.resetModules()
  return await import('@/app/(frontend)/next/aspirasi/route')
}

const buat = vi.fn()

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({ create: buat })),
}))

/** Header yang dikembalikan `headers()` diatur per test. */
let headerSaatIni = new Headers()
vi.mock('next/headers', () => ({
  headers: vi.fn(async () => headerSaatIni),
}))

const ISI_SAH = 'AC di lab TI lantai 2 sudah lama tidak dingin, mohon dicek.'
const JUDUL_SAH = 'AC lab TI mati'

type BadanKiriman = Record<string, unknown>

const permintaan = (badan: BadanKiriman) =>
  new Request('http://localhost:3000/next/aspirasi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(badan),
  })

/**
 * Modul rute menyimpan catatan laju di Map tingkat modul, jadi tiap test
 * memuatnya ulang supaya hitungannya tidak bocor antar test.
 */
const muatRute = async () => {
  // Bawaan test: topologi Nginx yang sudah dikonfigurasi benar.
  process.env.TRUSTED_IP_HEADER = 'x-real-ip'
  vi.resetModules()
  return await import('@/app/(frontend)/next/aspirasi/route')
}

const kirim = async (badan: BadanKiriman, header: Record<string, string> = {}) => {
  headerSaatIni = new Headers(header)
  const { POST } = await muatRute()
  return POST(permintaan(badan))
}

/** Token asli, diterbitkan dengan usia tertentu. */
const tokenBerusia = async (usiaMs: number) => {
  const { buatToken } = await import('@/utilities/tokenAspirasi')
  return buatToken(Date.now() - usiaMs)
}

const kirimanSah = async (tambahan: BadanKiriman = {}) => ({
  judul: JUDUL_SAH,
  kategori: 'sarpras',
  isi: ISI_SAH,
  token: await tokenBerusia(5_000),
  ...tambahan,
})

/**
 * Badan kiriman yang lolos lapis 2 pada kode LAMA maupun BARU: `dibuka: 0`
 * untuk yang lama, `token` sah untuk yang baru. Masing-masing mengabaikan
 * field milik yang lain.
 *
 * Dipakai khusus oleh test pembatasan laju, supaya kegagalannya pada kode
 * pra-perbaikan benar-benar disebabkan kunci IP yang bisa dikarang — bukan
 * tertahan lebih dulu oleh lapis token.
 */
const kirimanLolosLapisDua = async () => ({
  ...(await kirimanSah()),
  dibuka: 0,
})

beforeEach(() => {
  buat.mockClear()
  buat.mockResolvedValue({ id: 1 })
})

describe('POST /next/aspirasi — keaslian token (ASP-01 lapis 2)', () => {
  it('menolak kiriman yang memakai timestamp karangan alih-alih token', async () => {
    // Bentuk persis yang dulu lolos: tanpa token, dengan `dibuka: 0`.
    const res = await kirim({
      judul: JUDUL_SAH,
      kategori: 'sarpras',
      isi: ISI_SAH,
      dibuka: 0,
    })

    expect(res.status).toBe(400)
    expect(buat).not.toHaveBeenCalled()
  })

  it('menolak token yang tanda tangannya dipalsukan', async () => {
    const res = await kirim(
      await kirimanSah({ token: `${Date.now() - 5_000}.${'a'.repeat(64)}` }),
    )

    expect(res.status).toBe(400)
    expect(buat).not.toHaveBeenCalled()
  })

  it('menolak token yang baru saja diterbitkan (terlalu cepat untuk ditulis manusia)', async () => {
    const res = await kirim(await kirimanSah({ token: await tokenBerusia(0) }))

    expect(res.status).toBe(429)
    expect(buat).not.toHaveBeenCalled()
  })

  it('menolak token yang sudah melewati masa berlaku 30 menit', async () => {
    const res = await kirim(await kirimanSah({ token: await tokenBerusia(31 * 60 * 1000) }))

    expect(res.status).toBe(400)
    expect(buat).not.toHaveBeenCalled()
  })

  it('menerima token sah yang usianya memadai', async () => {
    const res = await kirim(await kirimanSah())

    expect(res.status).toBe(201)
    expect(buat).toHaveBeenCalledTimes(1)
    // Hanya field pengirim yang diteruskan; field moderasi tidak pernah ikut.
    expect(buat.mock.calls[0]![0].data).toEqual({
      judul: JUDUL_SAH,
      kategori: 'sarpras',
      isi: ISI_SAH,
    })
  })
})

describe('POST /next/aspirasi — kunci pembatasan laju (ASP-01 lapis 3)', () => {
  it('mengabaikan X-Forwarded-For yang dikarang pengirim', async () => {
    headerSaatIni = new Headers()
    const { POST } = await muatRute()

    const hasil: number[] = []
    // Enam kiriman berturut-turut. Entri terdepan XFF diganti tiap kali —
    // dulu itu cukup untuk mereset jatah. X-Real-IP dari proxy tetap sama.
    for (let i = 0; i < 6; i++) {
      headerSaatIni = new Headers({
        'x-forwarded-for': `203.0.113.${i}, 10.0.0.9`,
        'x-real-ip': '10.0.0.9',
      })
      const res = await POST(permintaan(await kirimanLolosLapisDua()))
      hasil.push(res.status)
    }

    // Lima pertama diterima, yang keenam melewati batas.
    expect(hasil.slice(0, 5)).toEqual([201, 201, 201, 201, 201])
    expect(hasil[5]).toBe(429)
    expect(buat).toHaveBeenCalledTimes(5)
  })

  it('memisahkan jatah antar alamat yang benar-benar berbeda menurut proxy', async () => {
    headerSaatIni = new Headers()
    const { POST } = await muatRute()

    for (let i = 0; i < 5; i++) {
      await POST(permintaan(await kirimanLolosLapisDua()))
    }
    // Kelima kiriman di atas memakai ember 'tanpa-proxy' (tidak ada header).
    headerSaatIni = new Headers({ 'x-real-ip': '10.0.0.9' })
    const res = await POST(permintaan(await kirimanLolosLapisDua()))

    expect(res.status).toBe(201)
  })

  it('menyatukan pengirim tanpa header proxy ke satu ember (gagal ke arah ketat)', async () => {
    headerSaatIni = new Headers()
    const { POST } = await muatRute()

    const hasil: number[] = []
    for (let i = 0; i < 6; i++) {
      // Tanpa X-Real-IP sama sekali, XFF pun berputar-putar.
      headerSaatIni = new Headers({ 'x-forwarded-for': `198.51.100.${i}` })
      const res = await POST(permintaan(await kirimanLolosLapisDua()))
      hasil.push(res.status)
    }

    expect(hasil[5]).toBe(429)
  })

  it('tidak membaca header apa pun saat TRUSTED_IP_HEADER kosong', async () => {
    // Deploy yang belum dikonfigurasi. Pengirim mencoba mengarang X-Real-IP
    // sendiri — persis bypass yang dulu cuma berpindah header. Nilainya harus
    // diabaikan, sehingga semua kiriman jatuh ke ember yang sama.
    const { POST } = await denganHeaderTepercaya(undefined)

    const hasil: number[] = []
    for (let i = 0; i < 6; i++) {
      headerSaatIni = new Headers({
        'x-real-ip': `203.0.113.${i}`,
        'x-forwarded-for': `198.51.100.${i}`,
      })
      const res = await POST(permintaan(await kirimanLolosLapisDua()))
      hasil.push(res.status)
    }

    expect(hasil.slice(0, 5)).toEqual([201, 201, 201, 201, 201])
    expect(hasil[5]).toBe(429)
  })

  it('memakai cf-connecting-ip saat itu yang dikonfigurasi, bukan x-real-ip', async () => {
    // Cloudflare di depan Nginx: x-real-ip berisi IP edge, jadi tidak boleh
    // dipakai. Di sini x-real-ip sengaja berputar dan harus diabaikan.
    const { POST } = await denganHeaderTepercaya('cf-connecting-ip')

    const hasil: number[] = []
    for (let i = 0; i < 6; i++) {
      headerSaatIni = new Headers({
        'cf-connecting-ip': '203.0.113.7',
        'x-real-ip': `10.0.0.${i}`,
      })
      const res = await POST(permintaan(await kirimanLolosLapisDua()))
      hasil.push(res.status)
    }

    expect(hasil.slice(0, 5)).toEqual([201, 201, 201, 201, 201])
    expect(hasil[5]).toBe(429)
  })
})

describe('POST /next/aspirasi — pengaman yang sudah ada tetap berjalan', () => {
  it('membuang kiriman yang mengisi honeypot, dengan balasan sukses palsu', async () => {
    const res = await kirim(await kirimanSah({ website: 'https://spam.example' }))

    expect(res.status).toBe(200)
    expect(buat).not.toHaveBeenCalled()
  })

  it('menolak kategori di luar daftar resmi', async () => {
    const res = await kirim(await kirimanSah({ kategori: 'kategori-karangan' }))

    expect(res.status).toBe(400)
    expect(buat).not.toHaveBeenCalled()
  })

  it('menolak isi yang terlalu pendek', async () => {
    const res = await kirim(await kirimanSah({ isi: 'pendek' }))

    expect(res.status).toBe(400)
    expect(buat).not.toHaveBeenCalled()
  })
})
