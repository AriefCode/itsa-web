import Link from 'next/link'
import React from 'react'

import type { Media } from '@/payload-types'
import { Media as MediaComponent } from '@/components/Media'

const JUDUL_BAWAAN = 'Wadah tumbuh mahasiswa Teknologi Informasi'
const SUBJUDUL_BAWAAN =
  'Himpunan mahasiswa Teknologi Informasi Politeknik Caltex Riau. Berkegiatan, berkarya, dan bersuara bersama.'

/**
 * Hero beranda (DESIGN.md §6): latar hijau tua, headline cream besar, CTA gold.
 *
 * Susunannya split asimetris, bukan blok tengah, supaya tidak terasa seperti
 * template. Kalau gambar hero belum diunggah, kolom teks melebar mengisi ruang
 * sehingga tidak ada kotak kosong yang menganga.
 */
export const Hero: React.FC<{
  judul?: string | null
  subjudul?: string | null
  gambar?: Media | number | null
}> = ({ judul, subjudul, gambar }) => {
  const adaGambar = gambar && typeof gambar === 'object'

  return (
    <section className="relative overflow-hidden bg-forest">
      {/* Cahaya lembut di belakang teks, memberi kedalaman tanpa gradien mencolok */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 size-[36rem] rounded-full bg-forest-elevated/50 blur-3xl"
      />

      <div className="container relative grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16">
        <div className={adaGambar ? 'lg:col-span-7' : 'lg:col-span-9'}>
          <h1 className="font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-cream sm:text-5xl lg:text-6xl">
            {judul || JUDUL_BAWAAN}
          </h1>
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-mist sm:text-lg">
            {subjudul || SUBJUDUL_BAWAAN}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/kegiatan"
              className="rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-forest transition-transform hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              Lihat Kegiatan
            </Link>
            <Link
              href="/about"
              className="rounded-lg border border-cream/40 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:border-cream hover:bg-forest-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Tentang ITSA
            </Link>
          </div>
        </div>

        {adaGambar && (
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-lg border border-forest-line">
              <MediaComponent
                resource={gambar}
                imgClassName="aspect-[4/3] w-full object-cover"
                priority
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
