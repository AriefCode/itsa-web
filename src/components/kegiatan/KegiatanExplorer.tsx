'use client'

import React, { useMemo, useState } from 'react'
import { CalendarRange, ChevronDown, LayoutGrid, ListOrdered, Search } from 'lucide-react'

import type { Event } from '@/payload-types'
import { FeaturedEvent } from './FeaturedEvent'
import { TimelineMode } from './TimelineMode'
import { KalenderMode } from './KalenderMode'
import { GalleryMode } from './GalleryMode'
import {
  saringLengkap,
  tanggalAwal,
  type FilterKategori,
  type Saringan,
} from '@/utilities/kegiatan'

type Mode = 'timeline' | 'kalender' | 'gallery'

const MODE: { nilai: Mode; label: string; Icon: typeof ListOrdered }[] = [
  { nilai: 'timeline', label: 'Timeline', Icon: ListOrdered },
  { nilai: 'kalender', label: 'Kalender', Icon: CalendarRange },
  { nilai: 'gallery', label: 'Gallery', Icon: LayoutGrid },
]

/** Dropdown bergaya seragam dengan chevron kustom, tetap pakai <select> asli. */
const Pilih: React.FC<{
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}> = ({ label, value, onChange, options }) => (
  <div className="relative">
    <label className="sr-only">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="w-full appearance-none rounded-lg border border-olive/20 bg-cream-elevated py-2.5 pl-3 pr-9 text-sm font-medium text-forest transition-colors hover:border-olive/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <ChevronDown
      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-olive"
      aria-hidden
    />
  </div>
)

/**
 * Penjelajah kegiatan: satu bilah kontrol (cari + saringan status/kategori/
 * divisi + pilih mode) di atas tiga mode tampilan yang berbagi state.
 *
 * Seluruh kegiatan diambil sekali di server lalu disaring di klien, jadi
 * berganti saringan atau mode tidak memicu permintaan jaringan. Tanggal
 * terpilih dibagi antara mode Timeline dan Kalender supaya keduanya sinkron.
 */
export const KegiatanExplorer: React.FC<{
  events: Event[]
  divisiList: { id: number; nama: string }[]
  featured: Event | null
}> = ({ events, divisiList, featured }) => {
  const [mode, setMode] = useState<Mode>('timeline')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<Saringan>('semua')
  const [kategori, setKategori] = useState<FilterKategori>('semua')
  const [divisi, setDivisi] = useState<string>('semua')
  const [selected, setSelected] = useState<string | null>(() => tanggalAwal(events))

  const tersaring = useMemo(
    () =>
      saringLengkap(events, {
        q,
        status,
        kategori,
        divisi: divisi === 'semua' ? 'semua' : Number(divisi),
      }),
    [events, q, status, kategori, divisi],
  )

  return (
    <div>
      {/* Bilah kontrol */}
      <div className="rounded-2xl border border-olive/10 bg-cream p-3 text-forest shadow-lg">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-2.5 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
            <div className="relative sm:col-span-2 lg:w-56">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-olive"
                aria-hidden
              />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari kegiatan..."
                aria-label="Cari kegiatan"
                className="w-full rounded-lg border border-olive/20 bg-cream-elevated py-2.5 pl-9 pr-3 text-sm text-forest placeholder:text-olive/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              />
            </div>
            <Pilih
              label="Status"
              value={status}
              onChange={(v) => setStatus(v as Saringan)}
              options={[
                { value: 'semua', label: 'Semua Status' },
                { value: 'mendatang', label: 'Akan Datang' },
                { value: 'selesai', label: 'Selesai' },
              ]}
            />
            <Pilih
              label="Kategori"
              value={kategori}
              onChange={(v) => setKategori(v as FilterKategori)}
              options={[
                { value: 'semua', label: 'Semua Kategori' },
                { value: 'gratis', label: 'Gratis' },
                { value: 'berbayar', label: 'Berbayar' },
              ]}
            />
            <Pilih
              label="Divisi"
              value={divisi}
              onChange={setDivisi}
              options={[
                { value: 'semua', label: 'Semua Divisi' },
                ...divisiList.map((d) => ({ value: String(d.id), label: d.nama })),
              ]}
            />
          </div>

          <div
            className="inline-flex rounded-lg border border-olive/20 bg-cream-elevated p-1"
            role="group"
            aria-label="Pilih tampilan"
          >
            {MODE.map(({ nilai, label, Icon }) => {
              const aktif = mode === nilai
              return (
                <button
                  key={nilai}
                  type="button"
                  onClick={() => setMode(nilai)}
                  aria-pressed={aktif}
                  className={[
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest',
                    aktif ? 'bg-forest text-cream shadow-sm' : 'text-forest hover:bg-forest/5',
                  ].join(' ')}
                >
                  <Icon className="size-4" aria-hidden />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-mist" aria-live="polite">
        {tersaring.length} kegiatan
      </p>

      {/* Featured hanya di mode timeline, di atas daftar. */}
      {mode === 'timeline' && featured && (
        <div className="mt-6">
          <FeaturedEvent event={featured} />
        </div>
      )}

      <div className="mt-8">
        {mode === 'timeline' && (
          <TimelineMode
            events={tersaring}
            selected={selected}
            onSelect={setSelected}
            onLihatKalender={() => setMode('kalender')}
          />
        )}
        {mode === 'kalender' && (
          <KalenderMode events={tersaring} selected={selected} onSelect={setSelected} />
        )}
        {mode === 'gallery' && <GalleryMode events={tersaring} />}
      </div>
    </div>
  )
}
