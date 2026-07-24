'use client'

import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { Event } from '@/payload-types'
import { hariTerpakai, kunciHari, namaBulan } from '@/utilities/kegiatan'

const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const pecahKunci = (k: string) => {
  const [y, m] = k.split('-').map(Number)
  return { tahun: y, bulan: m - 1 }
}

/**
 * Kalender kegiatan yang dipakai bersama mode Timeline (ringkas) dan mode
 * Kalender (besar). Tanggal terpilih dikendalikan dari luar (`value` +
 * `onSelect`) supaya kedua mode tetap sinkron. Bulan yang tampil diurus
 * sendiri di sini, mengikuti tanggal terpilih saat pertama render.
 */
export const KalenderKegiatan: React.FC<{
  events: Event[]
  value: string | null
  onSelect: (kunci: string) => void
  size?: 'ringkas' | 'besar'
}> = ({ events, value, onSelect, size = 'ringkas' }) => {
  const besar = size === 'besar'
  const hariIni = new Date()

  const [view, setView] = useState(() =>
    value ? pecahKunci(value) : { tahun: hariIni.getFullYear(), bulan: hariIni.getMonth() },
  )

  const peta = useMemo(() => {
    const m = new Map<string, Event[]>()
    for (const e of events) for (const h of hariTerpakai(e)) m.set(h, [...(m.get(h) ?? []), e])
    return m
  }, [events])

  const kotak = useMemo(() => {
    const pertama = new Date(view.tahun, view.bulan, 1)
    const geser = (pertama.getDay() + 6) % 7
    const jumlah = new Date(view.tahun, view.bulan + 1, 0).getDate()
    const sel: (Date | null)[] = Array.from({ length: geser }, () => null)
    for (let d = 1; d <= jumlah; d++) sel.push(new Date(view.tahun, view.bulan, d))
    return sel
  }, [view])

  const pindah = (arah: number) => {
    const d = new Date(view.tahun, view.bulan + arah, 1)
    setView({ tahun: d.getFullYear(), bulan: d.getMonth() })
  }

  const tombolNav =
    'inline-flex size-9 items-center justify-center rounded-full border border-forest-line text-cream transition-colors hover:border-gold hover:bg-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={() => pindah(-1)} className={tombolNav}>
          <span className="sr-only">Bulan sebelumnya</span>
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <p aria-live="polite" className="font-heading text-base font-bold text-cream sm:text-lg">
          {namaBulan(view.bulan)} {view.tahun}
        </p>
        <button type="button" onClick={() => pindah(1)} className={tombolNav}>
          <span className="sr-only">Bulan berikutnya</span>
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      <div className={`mt-4 grid grid-cols-7 text-center font-aksen text-[11px] uppercase tracking-wide text-mist ${besar ? 'gap-2' : 'gap-1'}`}>
        {HARI.map((h) => (
          <div key={h} className="py-1">
            {h}
          </div>
        ))}
      </div>

      <div className={`mt-1 grid grid-cols-7 ${besar ? 'gap-2' : 'gap-1'}`}>
        {kotak.map((tgl, i) => {
          if (!tgl) return <div key={`kosong-${i}`} />
          const kunci = kunciHari(tgl)
          const punya = peta.has(kunci)
          const iniHariIni = kunci === kunciHari(hariIni)
          const aktif = kunci === value

          return (
            <button
              key={kunci}
              type="button"
              disabled={!punya}
              onClick={() => onSelect(kunci)}
              aria-pressed={aktif}
              aria-label={`${tgl.getDate()} ${namaBulan(view.bulan)} ${view.tahun}${punya ? `, ada kegiatan` : ''}`}
              className={[
                'relative flex flex-col items-center justify-center rounded-lg font-aksen tabular-nums transition-colors',
                besar ? 'h-16 text-sm sm:h-20' : 'h-11 text-sm',
                aktif
                  ? 'bg-gold font-bold text-forest'
                  : punya
                    ? 'cursor-pointer text-cream hover:bg-forest'
                    : 'cursor-default text-mist/35',
                !aktif && iniHariIni ? 'ring-1 ring-gold/50' : '',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
              ].join(' ')}
            >
              {tgl.getDate()}
              {punya && (
                <span
                  aria-hidden
                  className={`mt-1 size-1.5 rounded-full ${aktif ? 'bg-forest' : 'bg-gold'}`}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
