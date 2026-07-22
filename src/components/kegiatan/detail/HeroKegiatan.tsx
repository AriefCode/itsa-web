import Link from 'next/link'
import React from 'react'
import { CalendarDays, CheckCircle2, ChevronRight, Clock3, MapPin, Tag } from 'lucide-react'

import type { Event } from '@/payload-types'
import { Media } from '@/components/Media'
import { formatBiaya, formatRentang, sudahSelesai } from '@/utilities/kegiatan'
import { AksiKegiatan, type Poster } from './AksiKegiatan'

/** Satu keping metadata di hero: ikon gold di dalam kotak bergaris. */
const Keping: React.FC<{ Icon: typeof MapPin; children: React.ReactNode }> = ({
  Icon,
  children,
}) => (
  <span className="inline-flex items-center gap-2.5 rounded-xl border border-cream/25 bg-forest/50 px-4 py-2.5 text-sm text-cream backdrop-blur-sm">
    <Icon className="size-4 shrink-0 text-gold" aria-hidden />
    {children}
  </span>
)

/**
 * Hero halaman detail kegiatan.
 *
 * Thumbnail dipasang sebagai latar penuh, bukan gambar terpisah di bawah
 * judul: judulnya jadi terbaca di atas fotonya sendiri dan halaman langsung
 * punya bobot visual. Tingginya dipatok ~450-500px, sengaja tidak setinggi
 * layar supaya isi halaman sudah kelihatan tanpa menggulir.
 */
export const HeroKegiatan: React.FC<{ event: Event; poster: Poster }> = ({ event, poster }) => {
  const selesai = sudahSelesai(event)
  const tanggal = formatRentang(event.tanggal_mulai, event.tanggal_selesai)

  return (
    <header className="relative isolate overflow-hidden bg-forest">
      {event.thumbnail && typeof event.thumbnail === 'object' && (
        <Media
          resource={event.thumbnail}
          fill
          priority
          pictureClassName="absolute inset-0 -z-20"
          imgClassName="size-full object-cover"
          htmlElement={null}
        />
      )}

      {/* Dua lapis peredup. Yang pertama menggelapkan seluruh foto supaya teks
          tetap terbaca di layar sempit (foto menutupi seluruh hero); yang kedua
          menebalkan sisi kiri di layar lebar sehingga fotonya tetap terlihat di
          kanan, seperti desain acuan. */}
      <div className="absolute inset-0 -z-10 bg-forest/80 lg:bg-forest/45" aria-hidden />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-forest via-forest/90 to-forest/20 lg:via-forest/75"
        aria-hidden
      />

      <div className="container flex min-h-[28rem] flex-col justify-center py-12 sm:py-14 lg:min-h-[31rem]">
        <nav aria-label="Remah roti">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-mist sm:text-sm">
            <li>
              <Link
                href="/"
                className="rounded transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Home
              </Link>
            </li>
            <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
            <li>
              <Link
                href="/kegiatan"
                className="rounded transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Kegiatan
              </Link>
            </li>
            <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
            <li className="max-w-[18ch] truncate text-cream sm:max-w-none" aria-current="page">
              {event.judul}
            </li>
          </ol>
        </nav>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span
            className={
              selesai
                ? 'inline-flex items-center gap-1.5 rounded-lg border border-gold/40 bg-gold/15 px-3 py-1.5 font-aksen text-xs font-medium uppercase tracking-[0.12em] text-gold'
                : 'inline-flex items-center gap-1.5 rounded-lg border border-cream/40 px-3 py-1.5 font-aksen text-xs font-medium uppercase tracking-[0.12em] text-cream'
            }
          >
            {selesai ? <CheckCircle2 className="size-3.5" aria-hidden /> : <Clock3 className="size-3.5" aria-hidden />}
            {selesai ? 'Selesai' : 'Akan Datang'}
          </span>
        </div>

        <h1 className="mt-5 max-w-[16ch] font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-cream sm:text-5xl lg:text-6xl">
          {event.judul}
        </h1>

        <div className="mt-7 flex flex-wrap gap-3">
          {tanggal && <Keping Icon={CalendarDays}>{tanggal}</Keping>}
          {event.lokasi && <Keping Icon={MapPin}>{event.lokasi}</Keping>}
          <Keping Icon={Tag}>{formatBiaya(event)}</Keping>
        </div>

        <div className="mt-7">
          <AksiKegiatan
            judul={event.judul}
            linkDokumentasi={selesai ? event.link_dokumentasi : null}
            poster={poster}
            varian="hero"
          />
        </div>
      </div>
    </header>
  )
}
