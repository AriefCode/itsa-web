import type { Event } from '@/payload-types'

/**
 * Helper tanggal untuk Kegiatan.
 *
 * Status kegiatan TIDAK disimpan di database (lihat catatan di
 * collections/Events.ts). Semua penentuan "akan datang" vs "selesai"
 * dihitung dari tanggal di sini, supaya logikanya cuma ada di satu tempat.
 */

/** Akhir kegiatan: tanggal_selesai kalau ada, kalau tidak tanggal_mulai. */
export const akhirKegiatan = (event: Pick<Event, 'tanggal_mulai' | 'tanggal_selesai'>) =>
  new Date(event.tanggal_selesai || event.tanggal_mulai)

export const sudahSelesai = (
  event: Pick<Event, 'tanggal_mulai' | 'tanggal_selesai'>,
  acuan: Date = new Date(),
) => akhirKegiatan(event).getTime() < acuan.getTime()

export type Saringan = 'semua' | 'mendatang' | 'selesai'

export const saring = (events: Event[], filter: Saringan, acuan: Date = new Date()) => {
  if (filter === 'semua') return events
  const selesai = filter === 'selesai'
  return events.filter((e) => sudahSelesai(e, acuan) === selesai)
}

const BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

export const namaBulan = (index: number) => BULAN[index] ?? ''

export const formatTanggal = (nilai?: string | null) => {
  if (!nilai) return null
  const d = new Date(nilai)
  return `${d.getDate()} ${namaBulan(d.getMonth())} ${d.getFullYear()}`
}

export const formatJam = (nilai?: string | null) => {
  if (!nilai) return null
  const d = new Date(nilai)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Rentang tanggal yang enak dibaca.
 * Contoh: "10 - 12 Juni 2026", "30 Juni - 2 Juli 2026", atau "10 Juni 2026".
 */
export const formatRentang = (mulai: string, selesai?: string | null) => {
  const a = new Date(mulai)
  if (!selesai) return formatTanggal(mulai)
  const b = new Date(selesai)

  const hariSama =
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  if (hariSama) return formatTanggal(mulai)

  if (a.getFullYear() === b.getFullYear()) {
    if (a.getMonth() === b.getMonth()) {
      return `${a.getDate()} - ${b.getDate()} ${namaBulan(a.getMonth())} ${a.getFullYear()}`
    }
    return `${a.getDate()} ${namaBulan(a.getMonth())} - ${b.getDate()} ${namaBulan(b.getMonth())} ${a.getFullYear()}`
  }
  return `${formatTanggal(mulai)} - ${formatTanggal(selesai)}`
}

/** Kunci hari lokal (YYYY-MM-DD), dipakai kalender untuk mencocokkan tanggal. */
export const kunciHari = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/**
 * Semua hari yang ditempati sebuah kegiatan, dari mulai sampai selesai.
 * Kegiatan multi-hari akan bertitik di setiap harinya pada kalender.
 */
export const hariTerpakai = (event: Event): string[] => {
  const mulai = new Date(event.tanggal_mulai)
  const selesai = event.tanggal_selesai ? new Date(event.tanggal_selesai) : mulai
  const hasil: string[] = []
  const kursor = new Date(mulai.getFullYear(), mulai.getMonth(), mulai.getDate())
  const batas = new Date(selesai.getFullYear(), selesai.getMonth(), selesai.getDate())
  // Batas wajar supaya data tanggal yang keliru tidak bikin loop panjang.
  let pengaman = 0
  while (kursor <= batas && pengaman < 400) {
    hasil.push(kunciHari(kursor))
    kursor.setDate(kursor.getDate() + 1)
    pengaman++
  }
  return hasil
}
