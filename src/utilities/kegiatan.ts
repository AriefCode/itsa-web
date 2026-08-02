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

export type StatusEvent = 'berlangsung' | 'selesai' | 'akan-datang'

/**
 * Status sebuah kegiatan untuk badge: sudah `selesai`, sedang `berlangsung`
 * (waktu sekarang di antara mulai & akhir), atau masih `akan-datang`.
 *
 * Satu-satunya penentu status supaya badge di semua kartu memakai pemetaan
 * yang sama (lihat komponen BadgeStatus).
 */
export const statusEvent = (
  event: Pick<Event, 'tanggal_mulai' | 'tanggal_selesai'>,
  acuan: Date = new Date(),
): StatusEvent => {
  if (sudahSelesai(event, acuan)) return 'selesai'
  return acuan.getTime() >= new Date(event.tanggal_mulai).getTime() ? 'berlangsung' : 'akan-datang'
}

/**
 * Waktu tutup pendaftaran sebuah kegiatan: pakai `pendaftaran_tutup` kalau
 * diisi, kalau tidak dianggap tutup saat kegiatan mulai.
 */
export const tutupPendaftaran = (
  event: Pick<Event, 'tanggal_mulai' | 'pendaftaran_tutup'>,
): Date => new Date(event.pendaftaran_tutup || event.tanggal_mulai)

/**
 * Pendaftaran masih dibuka: ada link pendaftaran DAN belum melewati waktu
 * tutupnya. Dipakai untuk memunculkan tombol "Daftar Sekarang".
 */
export const pendaftaranBuka = (
  event: Pick<Event, 'tanggal_mulai' | 'pendaftaran_tutup' | 'link_pendaftaran'>,
  acuan: Date = new Date(),
): boolean =>
  Boolean(event.link_pendaftaran) && tutupPendaftaran(event).getTime() >= acuan.getTime()

export type Saringan = 'semua' | 'mendatang' | 'selesai'

export const saring = (events: Event[], filter: Saringan, acuan: Date = new Date()) => {
  if (filter === 'semua') return events
  const selesai = filter === 'selesai'
  return events.filter((e) => sudahSelesai(e, acuan) === selesai)
}

/** Id divisi sebuah kegiatan, entah relasinya sudah ter-populate atau masih id. */
export const idDivisi = (event: Pick<Event, 'divisi'>): number | null =>
  event.divisi == null ? null : typeof event.divisi === 'object' ? event.divisi.id : event.divisi

export type FilterKategori = 'semua' | 'gratis' | 'berbayar'

export type FilterKegiatan = {
  q?: string
  status?: Saringan
  kategori?: FilterKategori
  divisi?: number | 'semua'
}

/**
 * Saringan gabungan untuk halaman Kegiatan: kata kunci, status (akan
 * datang/selesai), kategori biaya, dan divisi. Dipakai bersama oleh ketiga
 * mode (timeline, kalender, gallery) supaya hasilnya selalu konsisten.
 */
export const saringLengkap = (
  events: Event[],
  filter: FilterKegiatan,
  acuan: Date = new Date(),
): Event[] => {
  const q = (filter.q ?? '').trim().toLowerCase()
  return events.filter((e) => {
    if (filter.status && filter.status !== 'semua') {
      if (sudahSelesai(e, acuan) !== (filter.status === 'selesai')) return false
    }
    if (filter.kategori && filter.kategori !== 'semua') {
      if (Boolean(e.gratis) !== (filter.kategori === 'gratis')) return false
    }
    if (filter.divisi && filter.divisi !== 'semua') {
      if (idDivisi(e) !== filter.divisi) return false
    }
    if (q) {
      const namaDivisi = e.divisi && typeof e.divisi === 'object' ? e.divisi.nama : ''
      const teks = `${e.judul} ${e.lokasi ?? ''} ${namaDivisi}`.toLowerCase()
      if (!teks.includes(q)) return false
    }
    return true
  })
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

/** Dua tanggal jatuh pada hari kalender yang sama. */
const hariSama = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

/**
 * Jam kegiatan yang enak dibaca: "08.00 - 14.00 WIB".
 *
 * Jam selesai hanya ikut ditampilkan kalau kegiatannya masih di hari yang
 * sama; untuk kegiatan berhari-hari, "08.00 - 14.00" justru menyesatkan
 * karena kesannya cuma sesi sehari.
 */
export const formatWaktu = (event: Pick<Event, 'tanggal_mulai' | 'tanggal_selesai'>) => {
  const mulai = formatJam(event.tanggal_mulai)
  if (!mulai) return null
  if (!event.tanggal_selesai) return `${mulai} WIB`

  const a = new Date(event.tanggal_mulai)
  const b = new Date(event.tanggal_selesai)
  if (!hariSama(a, b)) return `Mulai ${mulai} WIB`

  const selesai = formatJam(event.tanggal_selesai)
  return selesai && selesai !== mulai ? `${mulai} - ${selesai} WIB` : `${mulai} WIB`
}

/**
 * Lama kegiatan sebagai teks pendek: "6 Jam" atau "3 Hari".
 *
 * Mengembalikan null kalau tanggal selesai belum diisi — lebih baik kartunya
 * tidak muncul sama sekali ketimbang menampilkan durasi tebak-tebakan.
 */
export const formatDurasi = (event: Pick<Event, 'tanggal_mulai' | 'tanggal_selesai'>) => {
  if (!event.tanggal_selesai) return null
  const a = new Date(event.tanggal_mulai)
  const b = new Date(event.tanggal_selesai)
  const selisih = b.getTime() - a.getTime()
  if (!Number.isFinite(selisih) || selisih <= 0) return null

  // Lintas hari dihitung per hari kalender, bukan per 24 jam: kegiatan
  // 08.00 hari pertama sampai 14.00 hari ketiga lebih wajar disebut
  // "3 Hari" daripada "2 Hari".
  if (!hariSama(a, b)) return `${hariTerpakai(event).length} Hari`

  const jam = Math.round(selisih / 3_600_000)
  if (jam >= 1) return `${jam} Jam`
  return `${Math.max(1, Math.round(selisih / 60_000))} Menit`
}

/** Biaya masuk sebagai teks siap tampil. */
export const formatBiaya = (event: Pick<Event, 'gratis' | 'htm'>) =>
  event.gratis || typeof event.htm !== 'number' ? 'Gratis' : `Rp${event.htm.toLocaleString('id-ID')}`

/** Kunci hari lokal (YYYY-MM-DD), dipakai kalender untuk mencocokkan tanggal. */
export const kunciHari = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Ubah kunci hari (YYYY-MM-DD) jadi label baca "23 Juli 2026". */
export const labelHari = (kunci: string): string => {
  const [y, m, d] = kunci.split('-').map(Number)
  return `${d} ${namaBulan(m - 1)} ${y}`
}

/**
 * Tanggal awal yang paling relevan untuk kalender: hari ini kalau ada
 * kegiatannya, kalau tidak hari berkegiatan terdekat ke depan, kalau tidak yang
 * terdekat ke belakang. Dipakai sebagai tanggal terpilih pembuka.
 */
export const tanggalAwal = (events: Event[], acuan: Date = new Date()): string | null => {
  const hariIni = kunciHari(acuan)
  const semua = new Set<string>()
  for (const e of events) for (const h of hariTerpakai(e)) semua.add(h)
  if (semua.size === 0) return null
  if (semua.has(hariIni)) return hariIni

  const urut = [...semua].sort()
  const kedepan = urut.find((k) => k >= hariIni)
  return kedepan ?? urut[urut.length - 1]
}

/**
 * Semua hari yang ditempati sebuah kegiatan, dari mulai sampai selesai.
 * Kegiatan multi-hari akan bertitik di setiap harinya pada kalender.
 */
export const hariTerpakai = (
  event: Pick<Event, 'tanggal_mulai' | 'tanggal_selesai'>,
): string[] => {
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
