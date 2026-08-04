import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { generatePayloadCookie } from 'payload/shared'

/**
 * Regresi untuk AUTH-03: cookie sesi admin tanpa flag Secure.
 *
 * Payload memakai `secure: false` sebagai bawaan
 * (collections/config/defaults.js:118-122), dan `Users` sebelumnya hanya
 * menulis `auth: true` sehingga bawaan itu terpakai apa adanya. Akibatnya
 * peramban bersedia mengirim cookie sesi lewat HTTP polos.
 *
 * Diuji dua lapis:
 *
 * 1. Config yang kita tulis ikut berubah mengikuti NODE_ENV — bukan dipatok.
 * 2. Payload benar-benar memasang atribut `Secure` pada string cookie ketika
 *    nilainya true. Lapis kedua memakai fungsi milik Payload sendiri, jadi
 *    yang diperiksa bukan cuma niat kita melainkan keluarannya.
 */

const NODE_ENV_ASLI = process.env.NODE_ENV

/** Memuat ulang config Users dengan NODE_ENV tertentu. */
const muatUsers = async (env: string) => {
  // NODE_ENV bertipe read-only di beberapa setelan TS; ditulis lewat indeks.
  ;(process.env as Record<string, string>).NODE_ENV = env
  vi.resetModules()
  return (await import('@/collections/Users')).Users
}

const cookiesDari = (users: Awaited<ReturnType<typeof muatUsers>>) =>
  typeof users.auth === 'object' ? users.auth.cookies : undefined

beforeEach(() => {
  vi.resetModules()
})

afterAll(() => {
  ;(process.env as Record<string, string>).NODE_ENV = NODE_ENV_ASLI ?? 'test'
})

describe('AUTH-03 — flag Secure pada cookie sesi admin', () => {
  it('aktif saat produksi', async () => {
    const users = await muatUsers('production')
    expect(cookiesDari(users)?.secure).toBe(true)
  })

  it('mati saat pengembangan, supaya login di localhost tetap bisa', async () => {
    const users = await muatUsers('development')
    expect(cookiesDari(users)?.secure).toBe(false)
  })

  it('nilainya benar-benar bergantung environment, bukan dipatok', async () => {
    // Menangkap kalau kelak ada yang menggantinya jadi `true`/`false` mati.
    const produksi = cookiesDari(await muatUsers('production'))?.secure
    const pengembangan = cookiesDari(await muatUsers('development'))?.secure
    expect(produksi).not.toBe(pengembangan)
  })
})

describe('AUTH-03 — atribut pada string cookie yang benar-benar diterbitkan', () => {
  /**
   * Bentuk config setelah Payload memerge bawaannya
   * (collections/config/sanitize.js:218 memanggil addDefaultsToAuthConfig
   * untuk `auth` berbentuk boolean maupun objek).
   */
  const authConfig = (secure: boolean) => ({
    cookies: { sameSite: 'Lax' as const, secure, domain: undefined },
    tokenExpiration: 7200,
  })

  const cookie = (secure: boolean) =>
    generatePayloadCookie({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collectionAuthConfig: authConfig(secure) as any,
      cookiePrefix: 'payload',
      token: 'token-uji',
    }) as string

  it('memasang Secure ketika dikonfigurasi true', () => {
    expect(cookie(true)).toMatch(/;\s*Secure/i)
  })

  it('tidak memasang Secure ketika false — inilah keadaan sebelum perbaikan', () => {
    expect(cookie(false)).not.toMatch(/;\s*Secure/i)
  })

  it('HttpOnly dan SameSite tetap terpasang di kedua keadaan', () => {
    // Keduanya sudah ada sebelum perbaikan ini; test menjaganya jangan sampai
    // ikut hilang saat `auth: true` diubah menjadi objek.
    for (const secure of [true, false]) {
      expect(cookie(secure)).toMatch(/;\s*HttpOnly/i)
      expect(cookie(secure)).toMatch(/;\s*SameSite=Lax/i)
    }
  })
})
