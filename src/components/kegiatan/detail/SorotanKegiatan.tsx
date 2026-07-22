import React from 'react'
import { Clock, MapPin, Tag, Users } from 'lucide-react'

import type { Event } from '@/payload-types'
import { formatBiaya, formatDurasi } from '@/utilities/kegiatan'
import { KARTU_TERANG } from './gaya'

type Sorotan = {
  Icon: typeof Clock
  nilai: string
  label: string
  /** Angka pakai font aksen; teks biasa pakai font heading. */
  angka?: boolean
}

/**
 * Kartu sorotan kegiatan.
 *
 * Hanya menampilkan yang benar-benar ada datanya di Payload. Angka seperti
 * jumlah peserta atau mentor sengaja TIDAK ditampilkan selama collection
 * Events belum punya field-nya — lebih baik kartunya tidak ada daripada
 * halaman publik memuat angka karangan.
 */
export const SorotanKegiatan: React.FC<{ event: Event }> = ({ event }) => {
  const durasi = formatDurasi(event)
  const divisi = event.divisi && typeof event.divisi === 'object' ? event.divisi : null

  const sorotan: Sorotan[] = [
    durasi && { Icon: Clock, nilai: durasi, label: 'Durasi', angka: true },
    { Icon: Tag, nilai: formatBiaya(event), label: 'Biaya', angka: true },
    divisi && { Icon: Users, nilai: divisi.nama, label: 'Penyelenggara' },
    event.lokasi && { Icon: MapPin, nilai: event.lokasi, label: 'Lokasi' },
  ].filter(Boolean) as Sorotan[]

  if (sorotan.length === 0) return null

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {sorotan.map(({ Icon, nilai, label, angka }) => (
        <li key={label} className={`${KARTU_TERANG} flex flex-col items-center px-4 py-6 text-center`}>
          <Icon className="size-7 text-forest" aria-hidden strokeWidth={1.75} />
          <p
            className={`mt-3 text-balance leading-tight text-forest ${
              angka ? 'font-aksen text-xl font-bold' : 'font-heading text-base font-bold'
            }`}
          >
            {nilai}
          </p>
          <p className="mt-1.5 font-aksen text-[11px] uppercase tracking-[0.14em] text-olive">
            {label}
          </p>
        </li>
      ))}
    </ul>
  )
}
