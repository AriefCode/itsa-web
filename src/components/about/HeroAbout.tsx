import Link from 'next/link'
import React from 'react'
import { ChevronRight, Home } from 'lucide-react'

import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'

/**
 * Hero halaman About: breadcrumb, judul, subjudul, dan (opsional) foto
 * kebersamaan dari Pengaturan Situs.
 */
export const HeroAbout: React.FC<{ gambar?: number | MediaType | null }> = ({ gambar }) => {
  const foto = gambar && typeof gambar === 'object' ? gambar : null
  return (
    <header className="relative isolate overflow-hidden bg-forest">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,var(--color-cream)_0px,var(--color-cream)_1px,transparent_1px,transparent_22px)]"
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
            <li className="text-cream">About</li>
          </ol>
        </nav>
      </div>

      <div className="container grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-2 lg:gap-14">
        <div className="min-w-0">
          <p className="font-aksen text-xs font-medium uppercase tracking-[0.18em] text-gold">
            Tentang ITSA
          </p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-cream sm:text-5xl">
            Lebih dari sekadar <span className="text-gold">himpunan.</span>
          </h1>
          <p className="mt-4 max-w-[48ch] leading-relaxed text-mist">
            ITSA (Information Technology Student Association) adalah rumah bagi mahasiswa Teknologi
            Informasi Politeknik Caltex Riau untuk belajar, berkarya, dan bertumbuh bersama.
          </p>
        </div>

        {foto && (
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl ring-1 ring-cream/10">
            <Media
              resource={foto}
              imgClassName="absolute inset-0 h-full w-full object-cover"
              htmlElement={null}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-forest-deep/40 to-transparent"
            />
          </div>
        )}
      </div>
    </header>
  )
}
