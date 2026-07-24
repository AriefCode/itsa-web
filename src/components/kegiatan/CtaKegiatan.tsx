import Link from 'next/link'
import React from 'react'
import { ArrowRight, CalendarClock, Users } from 'lucide-react'

import type { Event } from '@/payload-types'
import { formatRentang, pendaftaranBuka } from '@/utilities/kegiatan'

/**
 * Ajakan penutup halaman Kegiatan yang menyesuaikan diri dengan kegiatan
 * terdekat, bukan teks tetap:
 *
 * - Pendaftaran sedang buka  -> "Pendaftaran <judul> dibuka!" + Daftar Sekarang
 * - Sedang berlangsung       -> "<judul> sedang berlangsung!" + Lihat Detail
 * - Masih akan datang        -> "Jangan lewatkan <judul>!"    + Lihat Detail
 * - Tidak ada yang mendatang  -> ajakan umum + Kirim Aspirasi
 *
 * `featured` adalah kegiatan unggulan yang sama dengan yang dipakai di bagian
 * atas halaman, jadi ajakan ini selalu selaras dengan konteks terdekat.
 */
const bangunIsi = (featured: Event | null) => {
  if (featured) {
    const now = Date.now()
    const mulai = new Date(featured.tanggal_mulai).getTime()
    const selesai = new Date(featured.tanggal_selesai || featured.tanggal_mulai).getTime()
    const belumLewat = selesai >= now

    if (belumLewat) {
      const sedang = mulai <= now
      if (pendaftaranBuka(featured) && featured.link_pendaftaran) {
        return {
          judul: `Pendaftaran ${featured.judul} dibuka!`,
          sub: 'Amankan tempatmu sebelum pendaftaran ditutup.',
          label: 'Daftar Sekarang',
          href: featured.link_pendaftaran,
          eksternal: true,
        }
      }
      return {
        judul: sedang
          ? `${featured.judul} sedang berlangsung!`
          : `Jangan lewatkan ${featured.judul}!`,
        sub: [formatRentang(featured.tanggal_mulai, featured.tanggal_selesai), featured.lokasi]
          .filter(Boolean)
          .join(' · '),
        label: 'Lihat Detail',
        href: `/kegiatan/${featured.slug}`,
        eksternal: false,
      }
    }
  }

  return {
    judul: 'Jangan lewatkan kegiatan berikutnya!',
    sub: 'Ikuti kegiatan ITSA dan jadi bagian dari perjalanan hebat kami.',
    label: 'Kirim Aspirasi',
    href: '/aspirasi',
    eksternal: false,
  }
}

export const CtaKegiatan: React.FC<{ featured: Event | null }> = ({ featured }) => {
  const isi = bangunIsi(featured)
  const adaEvent = featured != null && new Date(featured.tanggal_selesai || featured.tanggal_mulai).getTime() >= Date.now()
  const Ikon = adaEvent ? CalendarClock : Users

  const kelasTombol =
    'inline-flex shrink-0 items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-forest transition-transform hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest'

  return (
    <section className="bg-forest">
      <div className="container py-16 sm:py-20">
        <div className="flex flex-col items-start gap-6 rounded-2xl bg-cream px-6 py-8 text-forest sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-10">
          <div className="flex items-start gap-4">
            <span className="hidden size-12 shrink-0 items-center justify-center rounded-full bg-forest text-gold sm:inline-flex">
              <Ikon className="size-6" aria-hidden />
            </span>
            <div>
              <h2 className="font-heading text-xl font-bold sm:text-2xl">{isi.judul}</h2>
              {isi.sub && (
                <p className="mt-1.5 max-w-[56ch] text-sm leading-relaxed text-olive">{isi.sub}</p>
              )}
            </div>
          </div>

          {isi.eksternal ? (
            <a href={isi.href} target="_blank" rel="noopener noreferrer" className={kelasTombol}>
              {isi.label}
              <ArrowRight className="size-4" aria-hidden />
            </a>
          ) : (
            <Link href={isi.href} className={kelasTombol}>
              {isi.label}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
