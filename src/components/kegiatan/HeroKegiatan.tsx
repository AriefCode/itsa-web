import Link from 'next/link'
import React from 'react'
import { Home, ChevronRight } from 'lucide-react'

import type { Media } from '@/payload-types'
import { Media as MediaComponent } from '@/components/Media'

/**
 * Hero halaman Kegiatan: foto kegiatan sebagai latar penuh dengan overlay
 * hijau agar teks terbaca, breadcrumb kecil, judul besar dengan potongan
 * aksen gold, lalu subjudul.
 *
 * Kalau foto belum ada, hero jatuh ke hijau polos berkilau lembut — tetap
 * layak tampil.
 */
export const HeroKegiatan: React.FC<{ gambar?: Media | number | null }> = ({ gambar }) => {
  const adaGambar = gambar && typeof gambar === 'object'

  return (
    <section className="relative isolate overflow-hidden bg-forest">
      {adaGambar ? (
        <>
          <MediaComponent
            resource={gambar}
            fill
            priority
            imgClassName="object-cover object-center"
            pictureClassName="absolute inset-0 -z-10"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-r from-forest via-forest/85 to-forest/45"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-t from-forest via-transparent to-forest/30"
          />
        </>
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 -top-40 -z-10 size-[36rem] rounded-full bg-forest-elevated/50 blur-3xl"
        />
      )}

      <div className="container py-16 sm:py-20 lg:py-24">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-mist">
            <li>
              <Link
                href="/"
                className="inline-flex items-center gap-1 rounded text-gold transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <Home className="size-4" aria-hidden />
                <span className="sr-only">Beranda</span>
              </Link>
            </li>
            <ChevronRight className="size-3.5 text-mist/60" aria-hidden />
            <li aria-current="page" className="text-cream">
              Kegiatan
            </li>
          </ol>
        </nav>

        <h1 className="mt-6 max-w-[18ch] font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-cream sm:text-5xl lg:text-6xl">
          Kegiatan ITSA,{' '}
          <span className="text-gold">setiap langkah membentuk cerita.</span>
        </h1>
        <p className="mt-5 max-w-[56ch] text-base leading-relaxed text-mist sm:text-lg">
          Temukan berbagai kegiatan yang kami selenggarakan. Belajar, berkompetisi, berbagi, dan
          bertumbuh bersama ITSA.
        </p>
      </div>
    </section>
  )
}
