'use client'

import React, { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'

export type FotoHero = { gambar: MediaType; keterangan?: string | null }

/**
 * Carousel foto sorotan di hero Kabinet.
 *
 * Foto ditumpuk lalu di-crossfade; berganti sendiri tiap 6 detik kecuali
 * pengguna memilih prefers-reduced-motion. Bisa juga digeser manual lewat
 * panah atau titik.
 */
export const HeroCarousel: React.FC<{ foto: FotoHero[] }> = ({ foto }) => {
  const n = foto.length
  const [i, setI] = useState(0)

  useEffect(() => {
    if (n <= 1) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setI((p) => (p + 1) % n), 6000)
    return () => clearInterval(id)
  }, [n])

  if (n === 0) return null
  const geser = (arah: number) => setI((p) => (p + arah + n) % n)

  return (
    <div className="relative">
      <div className="group relative aspect-[16/10] overflow-hidden rounded-3xl bg-forest-elevated ring-1 ring-cream/10 sm:aspect-[16/9]">
        {foto.map((f, idx) => (
          <div
            key={idx}
            aria-hidden={idx !== i}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              idx === i ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Media
              resource={f.gambar}
              imgClassName="h-full w-full object-cover"
              htmlElement={null}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-forest-deep/75 via-forest-deep/10 to-transparent"
            />
            {f.keterangan && (
              <p className="absolute bottom-5 left-5 right-16 font-aksen text-xs text-cream/90 drop-shadow">
                {f.keterangan}
              </p>
            )}
          </div>
        ))}

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => geser(-1)}
              className="absolute left-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-cream/30 bg-forest/50 text-cream backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <span className="sr-only">Foto sebelumnya</span>
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => geser(1)}
              className="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-cream/30 bg-forest/50 text-cream backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <span className="sr-only">Foto berikutnya</span>
              <ChevronRight className="size-5" aria-hidden />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {foto.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setI(idx)}
                  aria-label={`Ke foto ${idx + 1}`}
                  aria-current={idx === i}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === i ? 'w-6 bg-gold' : 'w-2.5 bg-cream/40 hover:bg-cream/70'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
