import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  /** Tampilkan nama panjang di samping wordmark. Dipakai di footer. */
  withSubtitle?: boolean
  /** Diterima demi kompatibilitas pemanggil lama; wordmark tidak memuat gambar. */
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

/**
 * Wordmark ITSA.
 *
 * SEMENTARA: ini wordmark tipografi, bukan logo resmi. File logo ITSA belum
 * ada di repo (DESIGN.md §8 mencatat versi terang untuk latar hijau masih
 * perlu dibuat). Sebelumnya komponen ini menarik logo Payload dari
 * raw.githubusercontent.com — logo pihak lain, dan permintaan jaringan ke
 * domain luar di setiap halaman.
 *
 * Begitu file logo ITSA tersedia, ganti isi komponen ini dengan <Image>.
 * Seluruh situs memanggil komponen ini, jadi cukup diubah di satu tempat.
 *
 * Wordmark memakai `currentColor` supaya otomatis mengikuti warna teks
 * induknya, baik di navbar hijau maupun di area cream.
 */
export const Logo = ({ className, withSubtitle = false }: Props) => {
  return (
    <span className={clsx('inline-flex items-baseline gap-2 text-current', className)}>
      <span className="font-heading text-2xl font-extrabold leading-none tracking-tight">ITSA</span>
      {withSubtitle && (
        <span className="hidden text-xs leading-none text-mist sm:inline">
          Politeknik Caltex Riau
        </span>
      )}
    </span>
  )
}
