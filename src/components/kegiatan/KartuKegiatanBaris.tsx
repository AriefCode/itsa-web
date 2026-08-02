import Link from 'next/link'
import React from 'react'
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react'

import type { Event } from '@/payload-types'
import { Media } from '@/components/Media'
import { formatRentang } from '@/utilities/kegiatan'
import { BadgeStatus } from './BadgeStatus'

/** Badge biaya (Gratis / RpXX) — gold untuk berbayar, teks kalem untuk gratis. */
export const BadgeBiaya: React.FC<{ event: Event }> = ({ event }) => {
  if (event.gratis || typeof event.htm !== 'number') {
    return (
      <span className="font-aksen text-[11px] font-medium uppercase tracking-wider text-mist">
        Gratis
      </span>
    )
  }
  return (
    <span className="rounded bg-gold px-2 py-0.5 font-aksen text-[11px] font-bold tracking-wider text-forest">
      Rp{event.htm.toLocaleString('id-ID')}
    </span>
  )
}

/**
 * Kartu kegiatan mendatar bergaya gelap (kartu di atas latar hijau) untuk
 * timeline dan daftar hari terpilih: thumbnail besar di kiri, info di tengah,
 * tombol panah gold di kanan. Seluruh kartu satu tautan.
 */
export const KartuKegiatanBaris: React.FC<{ event: Event }> = ({ event }) => {
  const adaFoto = event.thumbnail && typeof event.thumbnail === 'object'

  return (
    <Link
      href={`/kegiatan/${event.slug}`}
      className="group grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-forest-line bg-forest-elevated p-3 text-cream transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:hover:translate-y-0 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:gap-5 sm:p-4"
    >
      <div className="overflow-hidden rounded-lg bg-forest">
        {adaFoto ? (
          <Media
            resource={event.thumbnail}
            imgClassName="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100 sm:aspect-[4/3]"
            htmlElement={null}
          />
        ) : (
          <div aria-hidden className="aspect-square w-full sm:aspect-[4/3]" />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <BadgeStatus event={event} />
          <BadgeBiaya event={event} />
          {event.divisi && typeof event.divisi === 'object' && (
            <span className="text-xs text-mist">{event.divisi.nama}</span>
          )}
        </div>
        <h3 className="mt-2 truncate font-heading text-base font-bold leading-snug sm:text-lg">
          {event.judul}
        </h3>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-mist">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4 shrink-0" aria-hidden />
            <span className="font-aksen text-xs tracking-wide">
              {formatRentang(event.tanggal_mulai, event.tanggal_selesai)}
            </span>
          </span>
          {event.lokasi && (
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{event.lokasi}</span>
            </span>
          )}
        </div>
      </div>

      <span
        aria-hidden
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-gold text-forest transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
      >
        <ArrowUpRight className="size-5" />
      </span>
    </Link>
  )
}
