import Link from 'next/link'
import React from 'react'
import { ArrowRight, CalendarDays, MapPin, Layers } from 'lucide-react'

import type { Event } from '@/payload-types'
import { Media } from '@/components/Media'
import { Countdown } from './Countdown'
import { BadgeBiaya } from './KartuKegiatanBaris'
import { formatRentang, pendaftaranBuka } from '@/utilities/kegiatan'
import { ambilTeks, potongTeks } from '@/utilities/lexicalText'

const TAGLINE_BAWAAN =
  'Jadilah bagian dari perubahan. Bersama ITSA, wujudkan dampak nyata untuk masa depan.'

/**
 * Kartu kegiatan unggulan di atas daftar (mode timeline): foto besar, info,
 * dan panel hitung mundur menuju kegiatan.
 *
 * Kegiatan yang sedang berlangsung memakai penanda "Sedang Berlangsung" dan
 * mundur ke tanggal berakhir; kegiatan mendatang mundur ke tanggal mulai.
 */
export const FeaturedEvent: React.FC<{ event: Event }> = ({ event }) => {
  const now = Date.now()
  const mulai = new Date(event.tanggal_mulai).getTime()
  const selesai = new Date(event.tanggal_selesai || event.tanggal_mulai).getTime()
  const sedang = mulai <= now && now <= selesai
  const usai = now > selesai
  const buka = pendaftaranBuka(event)

  // Hitung mundur diarahkan ke hal yang paling berguna: batas pendaftaran kalau
  // masih buka, lalu tanggal berakhir kalau sedang berlangsung, lalu tanggal
  // mulai kalau masih akan datang.
  const targetISO = buka
    ? event.pendaftaran_tutup || event.tanggal_mulai
    : sedang
      ? event.tanggal_selesai || event.tanggal_mulai
      : event.tanggal_mulai
  const labelCountdown = buka
    ? 'Pendaftaran berakhir dalam'
    : sedang
      ? 'Berakhir dalam'
      : 'Dimulai dalam'
  const tampilCountdown = new Date(targetISO).getTime() > now

  const tagline = potongTeks(ambilTeks(event.deskripsi), 120) || TAGLINE_BAWAAN

  return (
    <section aria-label="Kegiatan unggulan" className="overflow-hidden rounded-2xl border border-forest-line bg-forest-elevated">
      <div className="grid lg:grid-cols-[16rem_minmax(0,1fr)_19rem]">
        <div className="relative min-h-52 lg:min-h-full">
          {event.thumbnail && typeof event.thumbnail === 'object' ? (
            <Media
              resource={event.thumbnail}
              imgClassName="absolute inset-0 h-full w-full object-cover"
              htmlElement={null}
            />
          ) : (
            <div aria-hidden className="absolute inset-0 bg-forest" />
          )}
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-8">
          <span
            className={
              sedang
                ? 'inline-flex w-fit items-center gap-1.5 rounded bg-gold px-2.5 py-1 font-aksen text-[11px] font-bold uppercase tracking-wider text-forest'
                : usai
                  ? 'inline-flex w-fit items-center gap-1.5 rounded border border-cream/25 px-2.5 py-1 font-aksen text-[11px] font-bold uppercase tracking-wider text-mist'
                  : 'inline-flex w-fit items-center gap-1.5 rounded border border-gold/60 px-2.5 py-1 font-aksen text-[11px] font-bold uppercase tracking-wider text-gold'
            }
          >
            {sedang && <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-forest" />}
            {sedang ? 'Sedang Berlangsung' : usai ? 'Selesai' : 'Akan Datang'}
          </span>

          <h2 className="mt-3 font-heading text-2xl font-bold leading-tight text-cream sm:text-3xl">
            {event.judul}
          </h2>
          <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-mist">{tagline}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-mist">
            <span className="flex items-center gap-1.5 text-gold">
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              <span className="font-aksen text-xs tracking-wide">
                {formatRentang(event.tanggal_mulai, event.tanggal_selesai)}
              </span>
            </span>
            {event.lokasi && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" aria-hidden />
                {event.lokasi}
              </span>
            )}
            {event.divisi && typeof event.divisi === 'object' && (
              <span className="flex items-center gap-1.5">
                <Layers className="size-4 shrink-0" aria-hidden />
                {event.divisi.nama}
              </span>
            )}
            <BadgeBiaya event={event} />
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 border-t border-forest-line bg-forest/50 p-6 lg:border-l lg:border-t-0">
          {tampilCountdown && (
            <>
              <p className="text-center text-xs uppercase tracking-wide text-mist">
                {labelCountdown}
              </p>
              <Countdown targetISO={targetISO} />
            </>
          )}

          {buka && event.link_pendaftaran ? (
            <a
              href={event.link_pendaftaran}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-forest transition-transform hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              Daftar Sekarang
              <ArrowRight className="size-4" aria-hidden />
            </a>
          ) : (
            <Link
              href={`/kegiatan/${event.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-forest transition-transform hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              Lihat Detail
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
