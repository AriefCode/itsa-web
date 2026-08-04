import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Regresi untuk QLT-02: seedUser menulis akun admin ke database yang
 * DATABASE_URL-nya sedang berlaku.
 *
 * playwright.config.ts memuat `.env` biasa lewat dotenv, bukan berkas env
 * khusus uji. Sebelum perbaikan, `npm run test:e2e` di mesin yang `.env`-nya
 * menunjuk database berisi data asli akan menanam akun `dev@payloadcms.com`
 * berkata sandi `test` ke sana — akun yang, karena tidak ada sistem peran,
 * merupakan admin penuh.
 *
 * Test ini memverifikasi ketiga pagar penolakannya, dan bahwa kredensial
 * tetapnya sudah tidak ada lagi di kode.
 */

const buat = vi.fn()
const hapus = vi.fn()

vi.mock('@/payload.config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({ create: buat, delete: hapus })),
}))

const NODE_ENV_ASLI = process.env.NODE_ENV
const DATABASE_URL_ASLI = process.env.DATABASE_URL

type Lingkungan = { nodeEnv?: string; databaseUrl?: string }

const muatSeed = async ({ nodeEnv = 'test', databaseUrl }: Lingkungan) => {
  ;(process.env as Record<string, string>).NODE_ENV = nodeEnv
  // DATABASE_URL dideklarasikan wajib di src/environment.d.ts, jadi `delete`
  // hanya bisa lewat bentuk yang opsional.
  const env = process.env as Record<string, string | undefined>
  if (databaseUrl === undefined) delete env.DATABASE_URL
  else env.DATABASE_URL = databaseUrl
  vi.resetModules()
  return await import('../helpers/seedUser')
}

beforeEach(() => {
  buat.mockReset()
  hapus.mockReset()
  buat.mockResolvedValue({ id: 1 })
  hapus.mockResolvedValue({ docs: [] })
})

afterAll(() => {
  const env = process.env as Record<string, string | undefined>
  env.NODE_ENV = NODE_ENV_ASLI ?? 'test'
  if (DATABASE_URL_ASLI === undefined) delete env.DATABASE_URL
  else env.DATABASE_URL = DATABASE_URL_ASLI
})

describe('QLT-02 — pagar 1: NODE_ENV', () => {
  it('menolak berjalan saat NODE_ENV=production', async () => {
    const { seedTestUser } = await muatSeed({
      nodeEnv: 'production',
      databaseUrl: 'file:./test.db', // sengaja database uji yang sah
    })

    await expect(seedTestUser()).rejects.toThrow(/NODE_ENV=production/)
    expect(buat).not.toHaveBeenCalled()
    expect(hapus).not.toHaveBeenCalled()
  })
})

describe('QLT-02 — pagar 2: DATABASE_URL harus berkas lokal', () => {
  it('menolak saat DATABASE_URL kosong', async () => {
    const { seedTestUser } = await muatSeed({ databaseUrl: undefined })
    await expect(seedTestUser()).rejects.toThrow(/DATABASE_URL kosong/)
    expect(buat).not.toHaveBeenCalled()
  })

  it.each([
    ['postgres', 'postgres://pengguna:sandi@db.kampus.ac.id:5432/itsa_test'],
    ['mysql', 'mysql://root@10.0.0.5:3306/test'],
    ['libsql', 'libsql://itsa-test.turso.io'],
    ['https', 'https://contoh.test/db'],
  ])('menolak basis data berjaringan berskema %s', async (_nama, url) => {
    // Perhatikan: seluruh URL di atas mengandung kata "test" pada namanya.
    // Kalau pagar skema tidak ada, pagar nama berkas akan MELOLOSKANNYA.
    const { seedTestUser } = await muatSeed({ databaseUrl: url })
    await expect(seedTestUser()).rejects.toThrow(/bukan berkas lokal/)
    expect(buat).not.toHaveBeenCalled()
  })

  it('menolak berkas di host lain (file://host/...)', async () => {
    const { seedTestUser } = await muatSeed({ databaseUrl: 'file://server-lain/test.db' })
    await expect(seedTestUser()).rejects.toThrow(/menunjuk host "server-lain"/)
    expect(buat).not.toHaveBeenCalled()
  })

  it('menerima jalur absolut lokal (file:///...)', async () => {
    const { seedTestUser } = await muatSeed({ databaseUrl: 'file:///tmp/itsa-test.db' })
    await expect(seedTestUser()).resolves.toBeUndefined()
    expect(buat).toHaveBeenCalledTimes(1)
  })
})

describe('QLT-02 — pagar 3: nama berkas harus database uji', () => {
  it('menolak database pengembangan yang sedang dipakai', async () => {
    const { seedTestUser } = await muatSeed({ databaseUrl: 'file:./itsa-web.db' })
    await expect(seedTestUser()).rejects.toThrow(/"itsa-web\.db" bukan database uji/)
    expect(buat).not.toHaveBeenCalled()
  })

  it.each([
    ['test.db', 'file:./test.db'],
    ['itsa-uji.db', 'file:./itsa-uji.db'],
    ['dengan query', 'file:./test.db?mode=rwc'],
  ])('menerima %s', async (_nama, url) => {
    const { seedTestUser } = await muatSeed({ databaseUrl: url })
    await expect(seedTestUser()).resolves.toBeUndefined()
    expect(buat).toHaveBeenCalledTimes(1)
  })
})

describe('QLT-02 — cleanupTestUser dijaga pagar yang sama', () => {
  it('menolak menghapus dari database non-uji', async () => {
    const { cleanupTestUser } = await muatSeed({ databaseUrl: 'file:./itsa-web.db' })
    await expect(cleanupTestUser()).rejects.toThrow(/bukan database uji/)
    expect(hapus).not.toHaveBeenCalled()
  })

  it('berjalan normal di database uji', async () => {
    const { cleanupTestUser } = await muatSeed({ databaseUrl: 'file:./test.db' })
    await expect(cleanupTestUser()).resolves.toBeUndefined()
    expect(hapus).toHaveBeenCalledTimes(1)
  })
})

describe('QLT-02 — kredensial uji', () => {
  it('tidak lagi memakai kata sandi tetap "test"', async () => {
    const { testUser } = await muatSeed({ databaseUrl: 'file:./test.db' })
    expect(testUser.password).not.toBe('test')
    expect(testUser.password.length).toBeGreaterThanOrEqual(20)
  })

  it('memakai domain .invalid yang tidak mungkin nyata', async () => {
    const { testUser } = await muatSeed({ databaseUrl: 'file:./test.db' })
    expect(testUser.email).toMatch(/\.invalid$/)
    expect(testUser.email).not.toMatch(/payloadcms\.com/)
  })

  it('mengacak kata sandi tiap proses, bukan nilai tetap di kode', async () => {
    const a = (await muatSeed({ databaseUrl: 'file:./test.db' })).testUser.password
    const b = (await muatSeed({ databaseUrl: 'file:./test.db' })).testUser.password
    expect(a).not.toBe(b)
  })
})
