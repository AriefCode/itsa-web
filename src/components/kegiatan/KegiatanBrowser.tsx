'use client'

import React, { useMemo, useState } from 'react'
import { CalendarRange, ListOrdered } from 'lucide-react'

import type { Event } from '@/payload-types'
import { Timeline } from './Timeline'
import { Kalender } from './Kalender'
import { saring, type Saringan } from '@/utilities/kegiatan'

const CHIP: { nilai: Saringan; label: string }[] = [
  { nilai: 'semua', label: 'Semua' },
  { nilai: 'mendatang', label: 'Akan Datang' },
  { nilai: 'selesai', label: 'Selesai' },
]

/**
 * Penjelajah kegiatan: chip saringan plus pilihan tampilan timeline atau
 * kalender (DESIGN.md §6).
 *
 * Seluruh kegiatan diambil sekali di server lalu disaring di sini, jadi
 * berganti chip atau bulan tidak memicu permintaan jaringan baru. Untuk skala
 * himpunan (puluhan kegiatan per tahun) ini jauh lebih responsif ketimbang
 * memuat ulang tiap kali.
 */
export const KegiatanBrowser: React.FC<{ events: Event[] }> = ({ events }) => {
  const [filter, setFilter] = useState<Saringan>('semua')
  const [tampilan, setTampilan] = useState<'timeline' | 'kalender'>('timeline')

  const tersaring = useMemo(() => saring(events, filter), [events, filter])

  // Selalu urut maju: sebuah timeline dibaca dari atas ke bawah mengikuti
  // waktu, bukan terbalik. Supaya pengunjung tetap gampang menemukan posisi
  // "sekarang" di antara kegiatan lama, Timeline menyisipkan penanda pemisah.
  const urut = useMemo(
    () =>
      [...tersaring].sort(
        (a, b) => new Date(a.tanggal_mulai).getTime() - new Date(b.tanggal_mulai).getTime(),
      ),
    [tersaring],
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Saring kegiatan">
          {CHIP.map((c) => {
            const aktif = filter === c.nilai
            return (
              <button
                key={c.nilai}
                type="button"
                onClick={() => setFilter(c.nilai)}
                aria-pressed={aktif}
                className={[
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                  aktif
                    ? 'bg-gold text-forest'
                    : 'border border-forest-line text-cream hover:bg-forest-elevated',
                ].join(' ')}
              >
                {c.label}
              </button>
            )
          })}
        </div>

        <div className="flex gap-2" role="group" aria-label="Pilih tampilan">
          {(
            [
              { nilai: 'timeline', label: 'Timeline', Icon: ListOrdered },
              { nilai: 'kalender', label: 'Kalender', Icon: CalendarRange },
            ] as const
          ).map(({ nilai, label, Icon }) => {
            const aktif = tampilan === nilai
            return (
              <button
                key={nilai}
                type="button"
                onClick={() => setTampilan(nilai)}
                aria-pressed={aktif}
                className={[
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                  aktif
                    ? 'border border-gold text-cream'
                    : 'border border-forest-line text-mist hover:bg-forest-elevated hover:text-cream',
                ].join(' ')}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <p className="mt-4 text-sm text-mist" aria-live="polite">
        {urut.length} kegiatan
      </p>

      <div className="mt-6">
        {tampilan === 'timeline' ? <Timeline events={urut} /> : <Kalender events={tersaring} />}
      </div>
    </div>
  )
}
