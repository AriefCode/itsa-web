'use client'

import Link from 'next/link'
import React from 'react'
import { ArrowRight } from 'lucide-react'

import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import { useGeserMendatar } from '@/components/kabinet/useGeserMendatar'

/** Label kecil di atas judul, dengan garis gold pendek. */
const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="flex items-center gap-3 font-aksen text-xs uppercase tracking-[0.18em] text-mist">
    <span aria-hidden className="h-px w-8 bg-gold" />
    {children}
  </p>
)

/**
 * Section "Galeri Momen" (beranda, latar hijau): teks di kiri, deretan foto
 * kegiatan yang bisa digeser mendatar di kanan.
 *
 * Fotonya diambil otomatis dari thumbnail kegiatan (lihat page.tsx) — nol
 * pengelolaan tambahan. Kalau belum ada foto sama sekali, section ini tidak
 * ditampilkan.
 *
 * Geser mendatarnya memakai hook `useGeserMendatar` yang sama dengan strip
 * "Sekilas Departemen" di Kabinet: roda mouse, seret, dan sapuan sentuh —
 * tanpa tombol panah.
 */
export const GaleriMomen: React.FC<{ foto: MediaType[] }> = ({ foto }) => {
  const { propsTrek } = useGeserMendatar(foto.length, foto)

  if (foto.length === 0) return null

  return (
    <section className="bg-forest" aria-labelledby="galeri-momen">
      <div className="container grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-12">
        <div>
          <Eyebrow>Galeri Momen</Eyebrow>
          <h2
            id="galeri-momen"
            className="mt-4 max-w-[12ch] font-heading text-3xl font-bold leading-tight text-cream sm:text-4xl"
          >
            Kenangan yang menginspirasi.
          </h2>
          <Link
            href="/kegiatan"
            className="mt-6 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-cream underline-offset-4 transition-colors hover:text-gold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Lihat Semua Galeri
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {/* `[&_img]:[-webkit-user-drag:none]` mencegah gambar ikut "ditarik"
            sebagai file saat menyeret strip dengan mouse. */}
        <ul {...propsTrek} className={`${propsTrek.className} [&_img]:[-webkit-user-drag:none]`}>
          {foto.map((f, i) => (
            <li
              key={f.id ?? i}
              className="h-44 w-60 shrink-0 snap-start overflow-hidden rounded-xl border border-forest-line sm:h-52 sm:w-72"
            >
              <Media
                resource={f}
                imgClassName="h-full w-full object-cover"
                htmlElement={null}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
