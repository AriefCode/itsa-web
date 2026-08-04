// Dipasang SEBELUM modul apa pun diimpor. Node membaca TZ saat pertama kali
// menyentuh Date/Intl, jadi urutannya penting.
process.env.TZ = 'UTC'

import { beforeAll, describe, expect, it } from 'vitest'

import {
  bagianTanggal,
  formatJam,
  formatRentang,
  formatTanggal,
  formatWaktu,
  hariTerpakai,
  kunciDari,
  kunciHari,
  statusEvent,
  sudahSelesai,
} from '@/utilities/kegiatan'

/**
 * Regresi untuk KEG-01: tanggal & jam berlabel "WIB" tapi dihitung di zona
 * mesin yang merender.
 *
 * Test ini HANYA bermakna kalau zona ambient-nya bukan WIB. Mesin pengembang
 * ada di Asia/Jakarta, jadi tanpa pemaksaan zona seluruh berkas ini akan lulus
 * tanpa membuktikan apa pun — hijau palsu. Karena itu ada penjaga di bawah yang
 * menggagalkan seluruh berkas kalau zonanya ternyata bukan UTC.
 *
 * Jalankan juga lewat baris perintah untuk memastikan:
 *   TZ=UTC npx vitest run --config ./vitest.config.mts tests/int/kegiatan-zona.int.spec.ts
 */

/** Instant asli dari database: Car Free Day, 23 Nov 2025 06.00 WIB. */
const CFD = '2025-11-22T23:00:00.000Z'
/** Kegiatan pagi biasa: 15 Okt 2025 09.00 WIB. */
const PAGI = '2025-10-15T02:00:00.000Z'
/** Bentuk lain yang juga ada di database: offset +07:00 eksplisit. */
const BER_OFFSET = '2025-10-01T09:00:00.000+07:00'

describe('penjaga: zona ambient harus BUKAN WIB', () => {
  it('proses benar-benar berjalan di UTC', () => {
    const patokan = new Date('2025-01-01T00:00:00.000Z')

    // Kalau V8 sudah terlanjur menyimpan zona sebelum process.env.TZ disetel,
    // nilai-nilai ini akan mengikuti WIB dan seluruh berkas jadi tidak sahih.
    expect(patokan.getHours()).toBe(0)
    expect(patokan.getDate()).toBe(1)
    expect(new Date().getTimezoneOffset()).toBe(0)
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toMatch(/^(UTC|Etc\/UTC)$/)
  })
})

describe('KEG-01 — tanggal & jam selalu WIB, apa pun zona mesin', () => {
  beforeAll(() => {
    // Kalau penjaga di atas gagal, hentikan supaya tidak ada yang lulus palsu.
    if (new Date().getTimezoneOffset() !== 0) {
      throw new Error('Zona ambient bukan UTC — test KEG-01 tidak sahih.')
    }
  })

  it('Car Free Day: instant di UTC jatuh pada tanggal berikutnya menurut WIB', () => {
    // Di UTC ini "22 Nov 23.00". Menurut WIB, "23 Nov 06.00" — dan yang benar
    // adalah WIB, karena CFD memang Minggu pagi 23 November 2025.
    expect(formatTanggal(CFD)).toBe('23 November 2025')
    expect(kunciHari(new Date(CFD))).toBe('2025-11-23')
    expect(formatJam(CFD)).toBe('06.00')
  })

  it('kegiatan pagi ditampilkan 09.00, bukan 02.00', () => {
    expect(formatTanggal(PAGI)).toBe('15 Oktober 2025')
    expect(formatJam(PAGI)).toBe('09.00')
  })

  it('bentuk ber-offset +07:00 dan bentuk Z memberi hasil yang setara', () => {
    expect(formatTanggal(BER_OFFSET)).toBe('1 Oktober 2025')
    expect(formatJam(BER_OFFSET)).toBe('09.00')
    // 2025-10-01T09:00+07:00 dan 2025-10-01T02:00Z adalah instant yang sama.
    expect(kunciHari(new Date(BER_OFFSET))).toBe(kunciHari(new Date('2025-10-01T02:00:00.000Z')))
  })

  it('formatWaktu memberi label WIB pada jam yang memang WIB', () => {
    expect(formatWaktu({ tanggal_mulai: CFD, tanggal_selesai: null })).toBe('06.00 WIB')
  })

  it('hariSama mengelompokkan dua instant yang melintasi tengah malam UTC', () => {
    // 22 Nov 23.00 UTC dan 23 Nov 05.00 UTC = 23 Nov 06.00 dan 12.00 WIB.
    // Hari yang sama menurut WIB, hari berbeda menurut UTC.
    const rentang = formatRentang(CFD, '2025-11-23T05:00:00.000Z')
    expect(rentang).toBe('23 November 2025')
  })

  it('bagianTanggal membaca komponen kalender dalam WIB', () => {
    expect(bagianTanggal(new Date(CFD))).toEqual({ tahun: 2025, bulan: 10, hari: 23 })
  })

  it('kunciDari membangun kunci dari angka tanpa melewati Date', () => {
    expect(kunciDari(2025, 10, 23)).toBe('2025-11-23')
    expect(kunciDari(2025, 0, 5)).toBe('2025-01-05')
  })

  describe('hariTerpakai', () => {
    it('kegiatan sehari menempati tepat satu hari WIB', () => {
      expect(hariTerpakai({ tanggal_mulai: CFD, tanggal_selesai: null })).toEqual(['2025-11-23'])
    })

    it('kegiatan lintas hari berurutan tanpa bolong maupun dobel', () => {
      // 23 Nov 06.00 WIB sampai 25 Nov 17.00 WIB.
      const hari = hariTerpakai({
        tanggal_mulai: CFD,
        tanggal_selesai: '2025-11-25T10:00:00.000Z',
      })
      expect(hari).toEqual(['2025-11-23', '2025-11-24', '2025-11-25'])
    })

    it('lintas pergantian bulan', () => {
      const hari = hariTerpakai({
        tanggal_mulai: '2025-10-30T23:00:00.000Z', // 31 Okt 06.00 WIB
        tanggal_selesai: '2025-11-01T05:00:00.000Z', // 1 Nov 12.00 WIB
      })
      expect(hari).toEqual(['2025-10-31', '2025-11-01'])
    })

    it('tanggal terbalik tidak menghasilkan hari apa pun', () => {
      expect(
        hariTerpakai({
          tanggal_mulai: '2025-11-25T00:00:00.000Z',
          tanggal_selesai: '2025-11-20T00:00:00.000Z',
        }),
      ).toEqual([])
    })
  })

  describe('kontrol negatif: perbandingan instant TIDAK boleh ikut berubah', () => {
    // sudahSelesai/statusEvent membandingkan getTime(), yang tidak bergantung
    // zona. Kalau suatu saat keduanya "diperbaiki" ikut-ikutan, justru bug baru
    // yang masuk — test ini menjaganya.
    const lampau = { tanggal_mulai: '2020-01-01T00:00:00.000Z', tanggal_selesai: null }
    const depan = { tanggal_mulai: '2099-01-01T00:00:00.000Z', tanggal_selesai: null }

    it('kegiatan lampau tetap dinilai selesai', () => {
      expect(sudahSelesai(lampau)).toBe(true)
      expect(statusEvent(lampau)).toBe('selesai')
    })

    it('kegiatan mendatang tetap dinilai akan datang', () => {
      expect(sudahSelesai(depan)).toBe(false)
      expect(statusEvent(depan)).toBe('akan-datang')
    })

    it('hasilnya ditentukan instant, bukan tanggal kalender', () => {
      // Acuan eksplisit menghilangkan ketergantungan pada jam mesin.
      // Sengaja dipilih 22 Nov 12.00 UTC: itu SEBELUM CFD dimulai
      // (22 Nov 23.00 UTC) meski menurut WIB keduanya sudah "23 November".
      // Perbandingan harus mengikuti instant, bukan label tanggalnya.
      const sebelumCfd = new Date('2025-11-22T12:00:00.000Z')
      expect(statusEvent({ tanggal_mulai: CFD, tanggal_selesai: null }, sebelumCfd)).toBe(
        'akan-datang',
      )
      expect(statusEvent({ tanggal_mulai: PAGI, tanggal_selesai: null }, sebelumCfd)).toBe(
        'selesai',
      )

      // Satu detik setelah CFD dimulai, statusnya berubah — tanpa menunggu
      // pergantian tanggal kalender.
      const setelahCfd = new Date('2025-11-22T23:00:01.000Z')
      expect(statusEvent({ tanggal_mulai: CFD, tanggal_selesai: null }, setelahCfd)).toBe('selesai')
    })
  })
})
