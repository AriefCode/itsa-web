'use client'

import React, { useMemo } from 'react'

import type { Event } from '@/payload-types'
import { KalenderKegiatan } from './KalenderKegiatan'
import { DaftarHari } from './DaftarHari'
import { hariTerpakai, labelHari } from '@/utilities/kegiatan'

/**
 * Mode Kalender: kalender besar di kiri, kegiatan pada tanggal terpilih di
 * kanan. Tanggal terpilih dibagi dengan mode Timeline lewat props, jadi
 * berpindah mode tidak menghilangkan konteks tanggal yang sedang dilihat.
 */
export const KalenderMode: React.FC<{
  events: Event[]
  selected: string | null
  onSelect: (kunci: string) => void
}> = ({ events, selected, onSelect }) => {
  const kegiatanHari = useMemo(
    () => (selected ? events.filter((e) => hariTerpakai(e).includes(selected)) : []),
    [events, selected],
  )

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
      <div className="rounded-2xl border border-forest-line bg-forest-elevated/60 p-4 sm:p-6">
        <KalenderKegiatan events={events} value={selected} onSelect={onSelect} size="besar" />
      </div>

      <div className="rounded-2xl border border-forest-line bg-forest-elevated/60 p-5">
        <h3 className="font-heading text-base font-bold text-cream">Kegiatan pada</h3>
        {selected && <p className="mt-0.5 font-aksen text-sm text-gold">{labelHari(selected)}</p>}
        <div className="mt-4">
          <DaftarHari
            events={kegiatanHari}
            kosong="Pilih tanggal bertitik gold untuk melihat kegiatannya."
          />
        </div>
      </div>
    </div>
  )
}
