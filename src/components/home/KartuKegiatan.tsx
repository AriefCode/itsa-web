import Link from 'next/link'
import React from 'react'
import { CalendarDays, MapPin } from 'lucide-react'

import type { Event } from '@/payload-types'
import { Media } from '@/components/Media'
import { ambilTeks, potongTeks } from '@/utilities/lexicalText'

const formatTanggal = (nilai?: string | null) =>
  nilai
    ? new Date(nilai).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

/**
 * Kartu kegiatan: kartu cream di atas latar hijau, radius 12px, sedikit
 * terangkat saat hover (DESIGN.md §4).
 *
 * Seluruh kartu adalah satu tautan, jadi target sentuhnya besar di ponsel.
 */
export const KartuKegiatan: React.FC<{
  event: Event
  selesai?: boolean
  /** Melebar: gambar di kiri, teks di kanan. Untuk recap yang disorot. */
  lebar?: boolean
}> = ({ event, selesai = false, lebar = false }) => {
  const tanggal = formatTanggal(event.tanggal_mulai)

  return (
    <Link
      href={`/kegiatan/${event.slug}`}
      className={
        lebar
          ? 'group grid overflow-hidden rounded-lg bg-cream text-forest transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold motion-reduce:hover:translate-y-0 sm:grid-cols-2'
          : 'group flex flex-col overflow-hidden rounded-lg bg-cream text-forest transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold motion-reduce:hover:translate-y-0'
      }
    >
      {event.thumbnail && typeof event.thumbnail === 'object' && (
        <Media
          resource={event.thumbnail}
          imgClassName={
            lebar
              ? 'h-full w-full object-cover sm:aspect-auto aspect-[16/10]'
              : 'aspect-[16/10] w-full object-cover'
          }
          htmlElement={null}
        />
      )}

      <div className={lebar ? 'flex flex-col p-6 sm:p-8' : 'flex flex-1 flex-col p-5'}>
        <div className="flex items-center gap-2">
          <span
            className={
              selesai
                ? 'rounded bg-forest px-2 py-0.5 text-xs font-medium text-cream'
                : 'rounded border border-olive px-2 py-0.5 text-xs font-medium text-olive'
            }
          >
            {selesai ? 'Selesai' : 'Akan Datang'}
          </span>
          {!event.gratis && typeof event.htm === 'number' && (
            <span className="rounded bg-gold px-2 py-0.5 text-xs font-semibold text-forest">
              Rp{event.htm.toLocaleString('id-ID')}
            </span>
          )}
          {event.gratis && (
            <span className="text-xs font-medium text-olive">Gratis</span>
          )}
        </div>

        <h3
          className={
            lebar
              ? 'mt-3 font-heading text-2xl font-bold leading-snug'
              : 'mt-3 font-heading text-lg font-bold leading-snug'
          }
        >
          {event.judul}
        </h3>

        {/* Cuplikan deskripsi hanya di kartu melebar: di kartu grid ruangnya
            sempit dan judul saja sudah cukup. */}
        {lebar &&
          (() => {
            const cuplikan = potongTeks(ambilTeks(event.deskripsi), 180)
            return cuplikan ? (
              <p className="mt-3 text-sm leading-relaxed text-olive">{cuplikan}</p>
            ) : null
          })()}

        <div className="mt-auto space-y-1.5 pt-4 text-sm text-olive">
          {tanggal && (
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              {tanggal}
            </p>
          )}
          {event.lokasi && (
            <p className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {event.lokasi}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
