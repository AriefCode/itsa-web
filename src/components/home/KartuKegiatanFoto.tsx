import Link from 'next/link'
import React from 'react'
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react'

import type { Event } from '@/payload-types'
import { Media } from '@/components/Media'

const formatTanggal = (nilai?: string | null) =>
  nilai
    ? new Date(nilai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

/**
 * Kartu kegiatan bergaya foto-latar penuh untuk "Kegiatan Mendatang".
 *
 * Foto memenuhi kartu, diselimuti gradien dari bawah agar teks putih terbaca.
 * Badge di atas, judul + tanggal + lokasi di bawah, tombol panah gold di sudut.
 * Seluruh kartu satu tautan — target sentuh besar di ponsel.
 *
 * Kalau event belum punya thumbnail, latar jatuh ke hijau elevasi supaya kartu
 * tetap utuh, bukan kotak putih kosong.
 */
export const KartuKegiatanFoto: React.FC<{ event: Event }> = ({ event }) => {
  const tanggal = formatTanggal(event.tanggal_mulai)
  const adaFoto = event.thumbnail && typeof event.thumbnail === 'object'

  return (
    <Link
      href={`/kegiatan/${event.slug}`}
      className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-forest-elevated text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
    >
      {adaFoto && (
        <Media
          resource={event.thumbnail}
          imgClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
          htmlElement={null}
        />
      )}
      {/* Gradien keterbacaan: gelap pekat di bawah tempat teks, memudar ke atas. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/55 to-forest-deep/10"
      />

      {/* Badge status + harga */}
      <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
        <span className="rounded bg-forest-deep/80 px-2 py-0.5 font-aksen text-[11px] font-medium uppercase tracking-wider text-cream backdrop-blur-sm">
          Akan Datang
        </span>
        {!event.gratis && typeof event.htm === 'number' ? (
          <span className="rounded bg-gold px-2 py-0.5 font-aksen text-[11px] font-bold tracking-wider text-forest">
            Rp{event.htm.toLocaleString('id-ID')}
          </span>
        ) : (
          <span className="rounded bg-cream/20 px-2 py-0.5 font-aksen text-[11px] font-medium uppercase tracking-wider text-cream backdrop-blur-sm">
            Gratis
          </span>
        )}
      </div>

      <div className="relative p-5">
        <h3 className="font-heading text-lg font-bold leading-snug">{event.judul}</h3>
        <div className="mt-3 space-y-1 text-sm text-mist">
          {tanggal && (
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              <span className="font-aksen text-xs tracking-wide">{tanggal}</span>
            </p>
          )}
          {event.lokasi && (
            <p className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden />
              <span className="line-clamp-1">{event.lokasi}</span>
            </p>
          )}
        </div>
      </div>

      {/* Panah gold di sudut, ikut "terangkat" saat hover. */}
      <span
        aria-hidden
        className="absolute bottom-5 right-5 inline-flex size-10 items-center justify-center rounded-full bg-gold text-forest transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
      >
        <ArrowUpRight className="size-5" />
      </span>
    </Link>
  )
}
