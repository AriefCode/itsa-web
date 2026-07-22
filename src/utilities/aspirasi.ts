/**
 * Kategori aspirasi — satu sumber kebenaran.
 *
 * Dipakai bertiga sekaligus: pilihan field di Payload, validasi di rute
 * pengiriman publik, dan label di halaman. Kalau daftarnya ditaruh di tiga
 * tempat, cepat atau lambat ada yang ketinggalan dan aspirasi masuk dengan
 * kategori yang tidak dikenali tampilan.
 *
 * Kategorinya sengaja bertema TOPIK, bukan nama divisi. Pengirim anonim
 * biasanya tahu apa keluhannya, tapi belum tentu tahu divisi mana yang
 * mengurusnya — memaksa memilih divisi bikin isian jadi tebak-tebakan.
 */

export const KATEGORI_ASPIRASI = [
  { nilai: 'akademik', label: 'Akademik & Pembelajaran' },
  { nilai: 'kegiatan', label: 'Kegiatan & Program Kerja' },
  { nilai: 'sarpras', label: 'Sarana & Prasarana' },
  { nilai: 'keuangan', label: 'Keuangan & Iuran' },
  { nilai: 'informasi', label: 'Informasi & Publikasi' },
  { nilai: 'organisasi', label: 'Organisasi & Pengurus' },
  { nilai: 'lainnya', label: 'Lainnya' },
] as const

export type NilaiKategori = (typeof KATEGORI_ASPIRASI)[number]['nilai']

/** Bentuk yang diminta field `select` Payload. */
export const OPSI_KATEGORI_PAYLOAD = KATEGORI_ASPIRASI.map(({ nilai, label }) => ({
  value: nilai,
  label,
}))

const NILAI_SAH = new Set<string>(KATEGORI_ASPIRASI.map((k) => k.nilai))

export const kategoriSah = (nilai: unknown): nilai is NilaiKategori =>
  typeof nilai === 'string' && NILAI_SAH.has(nilai)

/**
 * Label kategori untuk ditampilkan.
 *
 * Aspirasi lama (dikirim sebelum field kategori ada) tidak punya nilai apa
 * pun, jadi jatuh ke "Lainnya" ketimbang menampilkan kolom kosong.
 */
export const labelKategori = (nilai?: string | null): string =>
  KATEGORI_ASPIRASI.find((k) => k.nilai === nilai)?.label ?? 'Lainnya'

export const PANJANG_JUDUL_MAKSIMUM = 120
export const PANJANG_ISI_MAKSIMUM = 2000

/**
 * Judul yang bisa ditampilkan untuk sebuah aspirasi.
 *
 * Aspirasi lama belum punya judul. Daripada kartunya tampil tanpa kepala,
 * kalimat pertama isinya dipakai sebagai gantinya.
 */
export const judulTampil = (aspirasi: { judul?: string | null; isi: string }): string => {
  const judul = aspirasi.judul?.trim()
  if (judul) return judul

  const bersih = aspirasi.isi.replace(/\s+/g, ' ').trim()
  const akhirKalimat = bersih.search(/[.!?]/)
  const kalimat = akhirKalimat > 0 ? bersih.slice(0, akhirKalimat) : bersih
  return kalimat.length > 80 ? `${kalimat.slice(0, 77).trimEnd()}...` : kalimat
}

/** Jarak waktu yang enak dibaca: "2 hari lalu", "3 minggu lalu". */
export const waktuRelatif = (iso: string, acuan: Date = new Date()): string => {
  const selisih = acuan.getTime() - new Date(iso).getTime()
  if (!Number.isFinite(selisih) || selisih < 0) return 'baru saja'

  const menit = Math.floor(selisih / 60_000)
  if (menit < 1) return 'baru saja'
  if (menit < 60) return `${menit} menit lalu`

  const jam = Math.floor(menit / 60)
  if (jam < 24) return `${jam} jam lalu`

  const hari = Math.floor(jam / 24)
  if (hari < 7) return `${hari} hari lalu`

  const minggu = Math.floor(hari / 7)
  if (hari < 30) return `${minggu} minggu lalu`

  const bulan = Math.floor(hari / 30)
  if (bulan < 12) return `${bulan} bulan lalu`

  return `${Math.floor(bulan / 12)} tahun lalu`
}
