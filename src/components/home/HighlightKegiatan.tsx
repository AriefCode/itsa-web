'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'

import type { Event } from '@/payload-types'
import { Media } from '@/components/Media'

const formatTanggal = (nilai?: string | null) =>
  nilai
    ? new Date(nilai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

/** Label kecil di atas judul, dengan garis gold pendek. */
const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="flex items-center gap-3 font-aksen text-xs uppercase tracking-[0.18em] text-olive">
    <span aria-hidden className="h-px w-8 bg-gold" />
    {children}
  </p>
)

/**
 * Highlight Kegiatan (beranda, latar cream): teks pengantar di kiri, satu kartu
 * kegiatan selesai yang disorot di kanan. Kalau ada lebih dari satu kegiatan
 * selesai, kartu bisa digeser dengan panah — jadi momen terbaik bergantian.
 */
export const HighlightKegiatan: React.FC<{ events: Event[] }> = ({ events }) => {
  const [indeks, setIndeks] = useState(0)

  if (events.length === 0) return null

  const banyak = events.length > 1
  const event = events[indeks % events.length]
  const geser = (arah: number) =>
    setIndeks((n) => (n + arah + events.length) % events.length)

  const divisi =
    event.divisi && typeof event.divisi === 'object' ? event.divisi.nama : null
  const tanggal = formatTanggal(event.tanggal_selesai || event.tanggal_mulai)
  const dokumentasi = event.link_dokumentasi

  return (
    <section className="bg-cream text-forest" aria-labelledby="highlight-kegiatan">
      <div className="container grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14">
        <div>
          <Eyebrow>Highlight Kegiatan</Eyebrow>
          <h2
            id="highlight-kegiatan"
            className="mt-5 max-w-[14ch] font-heading text-3xl font-bold leading-tight sm:text-4xl"
          >
            Momen terbaik, perjalanan berkesan.
          </h2>
          <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-olive">
            Setiap kegiatan adalah langkah kecil menuju perubahan besar.
          </p>
          <Link
            href="/kegiatan"
            className="mt-8 inline-flex items-center gap-2 rounded-lg border border-olive/40 px-5 py-3 text-sm font-semibold text-forest transition-colors hover:border-forest hover:bg-forest hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            Lihat Semua Kegiatan
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {/* Kartu sorot: foto + panel hijau. Menumpuk di ponsel, berdampingan di
            layar lebar. */}
        <div className="relative overflow-hidden rounded-2xl bg-forest text-cream shadow-lg">
          <div className="grid sm:grid-cols-2">
            <Link
              href={`/kegiatan/${event.slug}`}
              className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              aria-label={event.judul}
            >
              {event.thumbnail && typeof event.thumbnail === 'object' ? (
                <Media
                  resource={event.thumbnail}
                  imgClassName="h-full min-h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                  htmlElement={null}
                />
              ) : (
                <div aria-hidden className="h-full min-h-56 w-full bg-forest-elevated" />
              )}
            </Link>

            <div className="flex flex-col p-6 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-cream px-2 py-0.5 font-aksen text-[11px] font-medium uppercase tracking-wider text-forest">
                  Selesai
                </span>
                {divisi && (
                  <span className="font-aksen text-[11px] uppercase tracking-wider text-mist">
                    {divisi}
                  </span>
                )}
              </div>

              <h3 className="mt-4 font-heading text-2xl font-bold leading-snug">{event.judul}</h3>

              <div className="mt-4 space-y-1.5 text-sm text-mist">
                {tanggal && (
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0" aria-hidden />
                    <span className="font-aksen text-xs tracking-wide">{tanggal}</span>
                  </p>
                )}
                {event.lokasi && (
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0" aria-hidden />
                    {event.lokasi}
                  </p>
                )}
              </div>

              <div className="mt-auto pt-6">
                <Link
                  href={dokumentasi || `/kegiatan/${event.slug}`}
                  {...(dokumentasi ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="inline-flex items-center gap-2 rounded-lg border border-cream/40 px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:border-cream hover:bg-forest-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  {dokumentasi ? 'Lihat Dokumentasi' : 'Lihat Detail'}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>

          {banyak && (
            <div className="absolute right-4 top-4 flex gap-2">
              <button
                type="button"
                onClick={() => geser(-1)}
                className="inline-flex size-9 items-center justify-center rounded-full border border-cream/40 bg-forest/70 text-cream backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <span className="sr-only">Kegiatan sebelumnya</span>
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => geser(1)}
                className="inline-flex size-9 items-center justify-center rounded-full border border-cream/40 bg-forest/70 text-cream backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <span className="sr-only">Kegiatan berikutnya</span>
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
