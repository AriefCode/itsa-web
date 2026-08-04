import { randomBytes } from 'crypto'
import path from 'path'

import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

/**
 * Akun uji untuk e2e panel admin.
 *
 * Berkas ini menulis ke database yang ditunjuk DATABASE_URL yang SEDANG
 * BERLAKU — playwright.config.ts memuat `.env` biasa lewat dotenv, bukan
 * berkas env khusus uji. Tanpa penjagaan, menjalankan `npm run test:e2e` di
 * mesin yang `.env`-nya menunjuk produksi akan menanam akun admin ke sana.
 * Dan karena setiap akun yang bisa login adalah admin penuh, itu setara
 * menyerahkan kendali penuh atas situs.
 *
 * Karena itu ada tiga pagar keras di bawah, plus kata sandi acak.
 */

/** Domain `.invalid` dicadangkan RFC 2606 — tidak akan pernah jadi alamat nyata. */
const EMAIL_UJI = 'e2e-otomatis@itsa.invalid'

/**
 * Kata sandi diacak tiap proses, bukan 'test' yang tetap. Kalau suatu saat
 * pagar di bawah tertembus, yang mendarat bukan kredensial yang bisa ditebak
 * siapa pun yang pernah membaca repo ini.
 */
const KATA_SANDI_UJI = randomBytes(24).toString('base64url')

export const testUser = { email: EMAIL_UJI, password: KATA_SANDI_UJI }

const PETUNJUK =
  'Siapkan database uji terpisah lebih dulu. Salin .env.test.example menjadi ' +
  '.env.test, lalu jalankan test dengan berkas env tersebut.'

/**
 * Menolak berjalan kalau sasarannya bukan database uji lokal.
 *
 * Tiga pagar, semuanya gagal KERAS — melempar, bukan memperingatkan — supaya
 * tidak ada jalur diam-diam menuju database sungguhan:
 *
 * 1. NODE_ENV tidak boleh production.
 * 2. DATABASE_URL harus menunjuk berkas LOKAL (skema `file:`). Basis data
 *    berjaringan (postgres://, mysql://, libsql://, dan sejenisnya) ditolak
 *    tanpa memandang namanya — kalau proyek ini kelak pindah dari SQLite,
 *    nama berkas tidak lagi bisa dijadikan penanda aman.
 * 3. Nama berkasnya harus mengandung "test" atau "uji".
 */
const pastikanDatabaseUji = (): void => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'seedUser menolak berjalan: NODE_ENV=production. Akun uji tidak boleh ' +
        'ditanam ke lingkungan produksi.',
    )
  }

  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(`seedUser menolak berjalan: DATABASE_URL kosong.\n\n${PETUNJUK}`)
  }

  // Pagar 2a: skema harus `file:`. Apa pun yang lain berarti basis data
  // berjaringan, dan itu tidak pernah boleh jadi sasaran seed.
  if (!/^file:/i.test(url)) {
    const skema = url.split(':')[0]
    throw new Error(
      `seedUser menolak berjalan: DATABASE_URL memakai skema "${skema}:", ` +
        'bukan berkas lokal. Seed hanya boleh menyasar database uji lokal.\n\n' +
        PETUNJUK,
    )
  }

  // Pagar 2b: `file://host/...` menunjuk berkas di mesin lain. Bentuk lokal
  // adalah `file:./nama.db` atau `file:///jalur/absolut`, yang otoritasnya
  // kosong.
  const otoritas = url.match(/^file:\/\/([^/]*)/i)?.[1]
  if (otoritas) {
    throw new Error(
      `seedUser menolak berjalan: DATABASE_URL menunjuk host "${otoritas}", ` +
        `bukan berkas lokal.\n\n${PETUNJUK}`,
    )
  }

  const berkas = path.basename(url.replace(/^file:/i, '').split(/[?#]/)[0]!)
  if (!/test|uji/i.test(berkas)) {
    throw new Error(
      `seedUser menolak berjalan: "${berkas}" bukan database uji.\n\n` +
        `Test e2e menulis akun sungguhan ke database. ${PETUNJUK}`,
    )
  }
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  pastikanDatabaseUji()

  const payload = await getPayload({ config })

  // Delete existing test user if any
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  // Create fresh test user
  await payload.create({
    collection: 'users',
    data: testUser,
  })
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  // Dijaga juga: menghapus baris dari database produksi tetap tidak diinginkan.
  pastikanDatabaseUji()

  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}
