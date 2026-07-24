'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { CalendarDays, ChevronDown, MapPin } from 'lucide-react'

import type { Event } from '@/payload-types'
import { Media } from '@/components/Media'
import { BadgeStatus } from './KartuKegiatanBaris'
import { formatRentang } from '@/utilities/kegiatan'

const PER_HALAMAN = 9

const KartuGaleri: React.FC<{ event: Event }> = ({ event }) => {
  const adaFoto = event.thumbnail && typeof event.thumbnail === 'object'
  return (
    <Link
      href={`/kegiatan/${event.slug}`}
      className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-xl border border-forest-line bg-forest-elevated text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      {adaFoto && (
        <Media
          resource={event.thumbnail}
          imgClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
          htmlElement={null}
        />
      )}
      {/* Overlay dasar untuk keterbacaan + penguatan saat hover. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/50 to-transparent transition-opacity duration-300 group-hover:from-forest-deep group-hover:via-forest-deep/70"
      />

      <div className="absolute left-3 top-3">
        <BadgeStatus event={event} />
      </div>

      <div className="relative translate-y-1 p-4 transition-transform duration-300 group-hover:translate-y-0">
        <h3 className="font-heading text-base font-bold leading-snug">{event.judul}</h3>
        <div className="mt-2 space-y-1 text-xs text-mist">
          <p className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            <span className="font-aksen tracking-wide">
              {formatRentang(event.tanggal_mulai, event.tanggal_selesai)}
            </span>
          </p>
          {event.lokasi && (
            <p className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="line-clamp-1">{event.lokasi}</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

/**
 * Mode Gallery: dokumentasi kegiatan sebagai grid foto responsif dengan overlay
 * yang menguat saat hover. Memakai daftar kegiatan yang sama (sudah tersaring),
 * jadi tetap sinkron dengan mode lain.
 */
export const GalleryMode: React.FC<{ events: Event[] }> = ({ events }) => {
  const [tampil, setTampil] = useState(PER_HALAMAN)

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-cream sm:text-2xl">Galeri Kegiatan ITSA</h2>
      <p className="mt-2 max-w-[60ch] text-sm text-mist">
        Lihat momen-momen berharga dari setiap kegiatan yang telah kami selenggarakan.
      </p>

      {events.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-forest-line px-6 py-12 text-center text-sm text-mist">
          Tidak ada kegiatan yang cocok dengan saringan ini.
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, tampil).map((e) => (
              <KartuGaleri key={e.id} event={e} />
            ))}
          </div>
          {tampil < events.length && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setTampil((n) => n + PER_HALAMAN)}
                className="inline-flex items-center gap-2 rounded-lg border border-forest-line px-5 py-3 text-sm font-semibold text-cream transition-colors hover:border-gold hover:bg-forest-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Muat Lebih Banyak
                <ChevronDown className="size-4" aria-hidden />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
