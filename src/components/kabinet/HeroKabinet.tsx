import Link from 'next/link'
import React from 'react'
import { ChevronRight, Home, Info, Network } from 'lucide-react'

import type { Media as MediaType, Pengurus } from '@/payload-types'
import { HeroCarousel, type FotoHero } from './HeroCarousel'
import { MozaikKabinet } from './MozaikKabinet'

const TOMBOL_DASAR =
  'inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 active:scale-[0.98] motion-reduce:active:scale-100'

export const HeroKabinet: React.FC<{
  anggota: Pengurus[]
  fotoHero: FotoHero[]
  periodeAktif?: string
  periodeTersedia: string[]
}> = ({ anggota, fotoHero, periodeAktif, periodeTersedia }) => {
  const fotoPengurus = anggota
    .map((p) => p.foto)
    .filter((f): f is MediaType => !!f && typeof f === 'object')

  return (
    <header className="relative isolate overflow-hidden bg-forest">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,var(--color-cream)_0px,var(--color-cream)_1px,transparent_1px,transparent_22px)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-40 -z-10 size-[30rem] rounded-full bg-forest-elevated/50"
      />

      <div className="container pt-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 font-aksen text-xs text-mist">
            <li>
              <Link
                href="/"
                className="inline-flex items-center gap-1 rounded transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <Home className="size-3.5" aria-hidden />
                Beranda
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li className="text-cream">Kabinet</li>
          </ol>
        </nav>
      </div>

      <div className="container grid items-center gap-10 py-10 sm:py-12 lg:grid-cols-2 lg:gap-14">
        <div className="min-w-0">
          <p className="font-aksen text-xs font-medium uppercase tracking-[0.18em] text-gold">
            Kepengurusan ITSA
          </p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-cream sm:text-5xl">
            Kabinet
            {periodeAktif && <span className="block text-gold">{periodeAktif}</span>}
          </h1>
          <p className="mt-4 max-w-[46ch] leading-relaxed text-mist">
            Bersama, kami membangun ITSA yang solid, kolaboratif, dan berdampak untuk mahasiswa dan
            lingkungan.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/about"
              className={`${TOMBOL_DASAR} bg-gold text-forest shadow-sm hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream`}
            >
              <Info className="size-4" aria-hidden />
              Tentang Kabinet
            </Link>
            <Link
              href="#departemen"
              className={`${TOMBOL_DASAR} border border-cream/35 text-cream hover:border-cream/70 hover:bg-cream/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold`}
            >
              <Network className="size-4" aria-hidden />
              Struktur Organisasi
            </Link>
          </div>

          {/* Pemilih periode tetap berupa tautan: tiap kabinet punya URL sendiri
              sehingga bisa dibagikan, dan datanya diambil ulang di server. */}
          {periodeTersedia.length > 1 && (
            <div
              className="mt-7 flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Pilih periode"
            >
              <span className="font-aksen text-[11px] uppercase tracking-[0.14em] text-mist">
                Periode
              </span>
              {periodeTersedia.map((per) => {
                const aktif = per === periodeAktif
                return (
                  <Link
                    key={per}
                    href={`/kabinet?periode=${encodeURIComponent(per)}`}
                    aria-current={aktif ? 'true' : undefined}
                    className={`rounded-lg px-3 py-1.5 font-aksen text-xs font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                      aktif
                        ? 'bg-gold text-forest'
                        : 'border border-forest-line text-cream hover:bg-forest-elevated'
                    }`}
                  >
                    {per}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="min-w-0">
          {fotoHero.length > 0 ? (
            <HeroCarousel foto={fotoHero} />
          ) : (
            <div className="hidden lg:block">
              <MozaikKabinet foto={fotoPengurus} />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
