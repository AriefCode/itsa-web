import Link from 'next/link'
import React from 'react'
import { ChevronRight, Clock, MapPin } from 'lucide-react'

import type { Event } from '@/payload-types'
import { Media } from '@/components/Media'
import { BadgeStatus } from './KartuKegiatanBaris'
import { formatWaktu } from '@/utilities/kegiatan'

/** Satu baris kegiatan ringkas untuk daftar hari terpilih. */
const Item: React.FC<{ event: Event }> = ({ event }) => {
  const waktu = formatWaktu(event)
  return (
    <Link
      href={`/kegiatan/${event.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-forest-line bg-forest-elevated p-2.5 transition-colors hover:border-gold/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-forest">
        {event.thumbnail && typeof event.thumbnail === 'object' ? (
          <Media
            resource={event.thumbnail}
            imgClassName="h-full w-full object-cover"
            htmlElement={null}
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="truncate font-heading text-sm font-bold text-cream">{event.judul}</h4>
          <BadgeStatus event={event} />
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-mist">
          {waktu && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5 shrink-0" aria-hidden />
              {waktu}
            </span>
          )}
          {event.lokasi && (
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{event.lokasi}</span>
            </span>
          )}
        </div>
      </div>
      <ChevronRight
        className="size-4 shrink-0 text-mist transition-transform group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0"
        aria-hidden
      />
    </Link>
  )
}

/**
 * Daftar kegiatan pada satu hari terpilih. Dipakai di sidebar mode Timeline
 * dan di kolom kanan mode Kalender.
 */
export const DaftarHari: React.FC<{ events: Event[]; kosong?: string }> = ({
  events,
  kosong = 'Tidak ada kegiatan pada tanggal ini.',
}) => {
  if (events.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-forest-line px-4 py-8 text-center text-sm text-mist">
        {kosong}
      </p>
    )
  }
  return (
    <ul className="space-y-2.5">
      {events.map((e) => (
        <li key={e.id}>
          <Item event={e} />
        </li>
      ))}
    </ul>
  )
}
