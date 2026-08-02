'use client'

import Link from 'next/link'
import React, { useRef } from 'react'
import { ArrowRight } from 'lucide-react'

import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'

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
 * Geser mendatar: sapuan sentuh/trackpad memakai scroll native, sedangkan
 * pengguna mouse bisa menarik (drag) langsung — kursor berubah jadi "grab"
 * sebagai isyarat. Tidak ada tombol panah.
 */
export const GaleriMomen: React.FC<{ foto: MediaType[] }> = ({ foto }) => {
  const trackRef = useRef<HTMLDivElement>(null)
  // Status tarikan mouse. Ref, bukan state: diperbarui tiap gerakan pointer,
  // tak perlu memicu render ulang.
  const tarik = useRef({ aktif: false, mulaiX: 0, mulaiScroll: 0 })

  const mulaiTarik = (e: React.PointerEvent) => {
    // Hanya untuk mouse; sentuh/trackpad sudah lancar lewat scroll native.
    if (e.pointerType !== 'mouse') return
    const el = trackRef.current
    if (!el) return
    tarik.current = { aktif: true, mulaiX: e.clientX, mulaiScroll: el.scrollLeft }
    el.setPointerCapture(e.pointerId)
  }

  const geser = (e: React.PointerEvent) => {
    const el = trackRef.current
    if (!el || !tarik.current.aktif) return
    el.scrollLeft = tarik.current.mulaiScroll - (e.clientX - tarik.current.mulaiX)
  }

  const akhiriTarik = (e: React.PointerEvent) => {
    const el = trackRef.current
    if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    tarik.current.aktif = false
  }

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

        <div
          ref={trackRef}
          onPointerDown={mulaiTarik}
          onPointerMove={geser}
          onPointerUp={akhiriTarik}
          onPointerLeave={akhiriTarik}
          onPointerCancel={akhiriTarik}
          onDragStart={(e) => e.preventDefault()}
          className="flex cursor-grab select-none gap-4 overflow-x-auto pb-2 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        >
          {foto.map((f, i) => (
            <div
              key={f.id ?? i}
              className="h-44 w-60 shrink-0 overflow-hidden rounded-xl border border-forest-line sm:h-52 sm:w-72"
            >
              <Media
                resource={f}
                imgClassName="pointer-events-none h-full w-full object-cover"
                htmlElement={null}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
