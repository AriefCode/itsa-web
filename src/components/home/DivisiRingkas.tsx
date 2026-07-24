'use client'

import Link from 'next/link'
import React, { useRef } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

import type { Divisi } from '@/payload-types'
import { ikonDari } from './ikon'

/** Label kecil di atas judul, dengan garis gold pendek. */
const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="flex items-center gap-3 font-aksen text-xs uppercase tracking-[0.18em] text-olive">
    <span aria-hidden className="h-px w-8 bg-gold" />
    {children}
  </p>
)

/**
 * Section "Divisi ITSA" (beranda, latar cream): deretan kartu divisi berikon
 * yang bisa digeser mendatar. Tiap kartu menautkan ke halaman Kabinet tempat
 * pengurus dikelompokkan per divisi.
 *
 * Geser pakai overflow-x + scroll-snap bawaan browser; tombol panah cukup
 * memanggil scrollBy. Tanpa library carousel, dan tetap jalan lewat sentuh.
 */
export const DivisiRingkas: React.FC<{ divisi: Divisi[] }> = ({ divisi }) => {
  const trek = useRef<HTMLDivElement>(null)

  if (divisi.length === 0) return null

  const geser = (arah: number) => {
    const el = trek.current
    if (!el) return
    el.scrollBy({ left: arah * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section className="bg-cream text-forest" aria-labelledby="divisi-itsa">
      <div className="container py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Divisi ITSA</Eyebrow>
            <h2
              id="divisi-itsa"
              className="mt-4 max-w-[14ch] font-heading text-3xl font-bold leading-tight sm:text-4xl"
            >
              Beragam minat, satu tujuan.
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/kabinet"
              className="hidden rounded text-sm font-semibold text-forest underline-offset-4 transition-colors hover:text-olive hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest sm:inline-flex sm:items-center sm:gap-1.5"
            >
              Lihat Semua Divisi
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            {divisi.length > 3 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => geser(-1)}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-olive/40 text-forest transition-colors hover:border-forest hover:bg-forest hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  <span className="sr-only">Geser kiri</span>
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => geser(1)}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-olive/40 text-forest transition-colors hover:border-forest hover:bg-forest hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  <span className="sr-only">Geser kanan</span>
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          ref={trek}
          className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {divisi.map((d) => {
            const Ikon = ikonDari(d.ikon)
            return (
              <Link
                key={d.id}
                href="/kabinet"
                className="group flex w-64 shrink-0 snap-start flex-col rounded-2xl border border-olive/15 bg-cream-elevated p-6 transition-colors hover:border-forest/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-forest/8 text-forest transition-colors group-hover:bg-forest group-hover:text-cream">
                  <Ikon className="size-6" aria-hidden strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 font-heading text-base font-bold leading-snug">{d.nama}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-olive">
                  {d.deskripsi_singkat}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-forest">
                  Lihat Divisi
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
                    aria-hidden
                  />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
