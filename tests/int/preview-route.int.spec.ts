import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Regresi untuk AUTH-01: pemeriksaan login di rute pratinjau tidak pernah
 * menolak siapa pun.
 *
 * `payload.auth()` mengembalikan AuthResult — sebuah OBJEK yang selalu ada,
 * bahkan untuk pengunjung anonim (yang anonim adalah `.user` di dalamnya).
 * Kode lama menampung hasilnya utuh lalu memeriksa `if (!user)`, yang tidak
 * pernah bernilai benar. Akibatnya draft mode menyala untuk siapa pun yang
 * memegang PREVIEW_SECRET, tanpa perlu login — dan draft mode mematikan
 * access control di tiga halaman detail lewat `overrideAccess: draft`.
 *
 * Sekalian menutup open redirect: `//evil.com` dan `/\evil.com` lolos
 * pemeriksaan "diawali garis miring" tapi diperlakukan peramban sebagai
 * alamat eksternal.
 */

const RAHASIA = 'rahasia-preview-uji'

const auth = vi.fn()
const enable = vi.fn()
const disable = vi.fn()
const redirect = vi.fn()
const logError = vi.fn()

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({ auth, logger: { error: logError } })),
}))
vi.mock('next/headers', () => ({
  draftMode: vi.fn(async () => ({ enable, disable })),
}))
vi.mock('next/navigation', () => ({ redirect }))

const muatRute = async () => {
  vi.resetModules()
  return await import('@/app/(frontend)/next/preview/route')
}

const minta = (query: string) =>
  ({ url: `http://localhost:3000/next/preview${query}`, headers: new Headers() }) as never

/** Menjalankan rute dengan PREVIEW_SECRET tertentu. */
const jalankan = async (query: string, rahasia: string | undefined = RAHASIA) => {
  if (rahasia === undefined) delete process.env.PREVIEW_SECRET
  else process.env.PREVIEW_SECRET = rahasia
  const { GET } = await muatRute()
  return GET(minta(query))
}

/** Sesi yang sudah login. */
const sudahLogin = () => auth.mockResolvedValue({ user: { id: 1 }, permissions: {} })
/** Pengunjung anonim — bentuk yang dulu lolos. */
const belumLogin = () => auth.mockResolvedValue({ user: null, permissions: {} })

beforeEach(() => {
  auth.mockReset()
  enable.mockClear()
  disable.mockClear()
  redirect.mockClear()
  logError.mockClear()
})

describe('GET /next/preview — gerbang rahasia', () => {
  it('menolak rahasia yang salah', async () => {
    sudahLogin()
    const res = await jalankan('?path=/posts/uji&previewSecret=salah')

    expect(res.status).toBe(403)
    expect(enable).not.toHaveBeenCalled()
  })

  it('menolak saat PREVIEW_SECRET bernilai string kosong', async () => {
    // '' !== '' bernilai salah, jadi tanpa penjagaan khusus ini akan lolos.
    sudahLogin()
    const res = await jalankan('?path=/posts/uji&previewSecret=', '')

    expect(res.status).toBe(403)
    expect(enable).not.toHaveBeenCalled()
  })

  it('menolak saat PREVIEW_SECRET tidak diset sama sekali', async () => {
    sudahLogin()
    const res = await jalankan('?path=/posts/uji&previewSecret=apa-saja', undefined)

    expect(res.status).toBe(403)
    expect(enable).not.toHaveBeenCalled()
  })
})

describe('GET /next/preview — gerbang login (AUTH-01)', () => {
  it('menolak pengunjung yang belum login meski rahasianya benar', async () => {
    belumLogin()
    const res = await jalankan(`?path=/posts/uji&previewSecret=${RAHASIA}`)

    expect(res.status).toBe(403)
    expect(disable).toHaveBeenCalled()
    expect(enable).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('menyalakan draft mode untuk sesi yang sudah login', async () => {
    sudahLogin()
    await jalankan(`?path=/posts/uji&previewSecret=${RAHASIA}`)

    expect(enable).toHaveBeenCalled()
    expect(disable).not.toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/posts/uji')
  })

  it('menolak dan mencatat log kalau verifikasi token melempar', async () => {
    auth.mockRejectedValue(new Error('token rusak'))
    const res = await jalankan(`?path=/posts/uji&previewSecret=${RAHASIA}`)

    expect(res.status).toBe(403)
    expect(enable).not.toHaveBeenCalled()
    expect(logError).toHaveBeenCalled()
  })
})

describe('GET /next/preview — validasi path (open redirect)', () => {
  it('menerima path relatif biasa', async () => {
    sudahLogin()
    await jalankan(`?path=/kegiatan/mubes-2026&previewSecret=${RAHASIA}`)
    expect(redirect).toHaveBeenCalledWith('/kegiatan/mubes-2026')
  })

  it('menerima garis miring tunggal', async () => {
    sudahLogin()
    await jalankan(`?path=/&previewSecret=${RAHASIA}`)
    expect(redirect).toHaveBeenCalledWith('/')
  })

  it.each([
    ['protokol-relatif', '//evil.example'],
    ['garis miring terbalik', '/\\evil.example'],
    ['protokol-relatif ber-path', '//evil.example/posts/uji'],
    ['miring terbalik ganda', '/\\\\evil.example'],
  ])('menolak path %s: %s', async (_nama, path) => {
    sudahLogin()
    const res = await jalankan(
      `?path=${encodeURIComponent(path)}&previewSecret=${RAHASIA}`,
    )

    expect(res.status).toBe(500)
    expect(redirect).not.toHaveBeenCalled()
    expect(enable).not.toHaveBeenCalled()
  })

  it('menolak path yang tidak diawali garis miring', async () => {
    sudahLogin()
    const res = await jalankan(`?path=https://evil.example&previewSecret=${RAHASIA}`)

    expect(res.status).toBe(500)
    expect(redirect).not.toHaveBeenCalled()
  })

  it('membalas 404 kalau path tidak ada', async () => {
    sudahLogin()
    const res = await jalankan(`?previewSecret=${RAHASIA}`)

    expect(res.status).toBe(404)
  })
})
