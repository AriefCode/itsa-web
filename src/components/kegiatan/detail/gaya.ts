/**
 * Kelas tombol yang dipakai bersama oleh hero dan sidebar halaman detail
 * kegiatan. Ditaruh di satu tempat supaya tombol "Buka Dokumentasi" di hero
 * dan yang di "Aksi Cepat" tidak pernah berbeda gayanya.
 *
 * Keduanya dirancang untuk latar hijau (hero dan kartu sidebar sama-sama
 * forest), jadi jangan dipakai di atas band cream tanpa disesuaikan.
 */

const DASAR =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 active:scale-[0.98] motion-reduce:active:scale-100'

/** Tombol aksi utama: isian gold, teks forest (DESIGN.md §4). */
export const TOMBOL_UTAMA = `${DASAR} bg-gold text-forest shadow-sm hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold`

/** Tombol sekunder: garis tepi terang di atas hijau. */
export const TOMBOL_GARIS = `${DASAR} border border-cream/35 text-cream hover:border-cream/70 hover:bg-cream/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold`

/** Kartu di atas band cream: sudut membulat, bayangan tipis, garis halus. */
export const KARTU_TERANG =
  'rounded-2xl border border-olive/15 bg-cream-elevated shadow-[0_1px_3px_rgb(20_58_40/0.06),0_8px_24px_-12px_rgb(20_58_40/0.12)]'
