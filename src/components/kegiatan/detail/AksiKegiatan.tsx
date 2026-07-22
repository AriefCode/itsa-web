import React from 'react'
import { Download, ExternalLink } from 'lucide-react'

import { TombolBagikan } from './TombolBagikan'
import { TOMBOL_GARIS, TOMBOL_UTAMA } from './gaya'

export type Poster = { href: string; namaBerkas: string } | null

type Props = {
  judul: string
  linkDokumentasi?: string | null
  poster: Poster
  /**
   * 'hero' menyusun tombol berjajar dengan Bagikan lebih dulu; 'sidebar'
   * menumpuknya dan mendahulukan aksi utama. Isi tombolnya sama persis —
   * yang berbeda hanya susunannya.
   */
  varian: 'hero' | 'sidebar'
}

/**
 * Kelompok tombol aksi kegiatan: Bagikan, Buka Dokumentasi, Download Poster.
 *
 * Satu komponen dipakai di dua tempat supaya tidak ada versi yang ketinggalan
 * saat salah satu tombol berubah.
 */
export const AksiKegiatan: React.FC<Props> = ({ judul, linkDokumentasi, poster, varian }) => {
  const sidebar = varian === 'sidebar'
  const lebar = sidebar ? 'w-full' : ''

  const bagikan = (
    <TombolBagikan
      key="bagikan"
      judul={judul}
      className={`${TOMBOL_GARIS} ${lebar}`}
      label={sidebar ? 'Bagikan Kegiatan' : 'Bagikan'}
    />
  )

  const dokumentasi = linkDokumentasi ? (
    <a
      key="dokumentasi"
      href={linkDokumentasi}
      target="_blank"
      rel="noopener noreferrer"
      className={`${TOMBOL_UTAMA} ${lebar}`}
    >
      Buka Dokumentasi
      <ExternalLink className="size-4 shrink-0" aria-hidden />
      <span className="sr-only">(membuka tab baru)</span>
    </a>
  ) : null

  const unduhPoster = poster ? (
    <a
      key="poster"
      href={poster.href}
      download={poster.namaBerkas}
      className={`${TOMBOL_GARIS} ${lebar}`}
    >
      <Download className="size-4 shrink-0" aria-hidden />
      Download Poster
    </a>
  ) : null

  const tombol = sidebar
    ? [dokumentasi, bagikan, unduhPoster]
    : [bagikan, dokumentasi, unduhPoster]

  return (
    <div className={sidebar ? 'flex flex-col gap-2.5' : 'flex flex-wrap gap-3'}>
      {tombol.filter(Boolean)}
    </div>
  )
}
