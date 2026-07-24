import Link from 'next/link'
import React from 'react'
import { ArrowRight, Play } from 'lucide-react'

import type { Media } from '@/payload-types'
import { Media as MediaComponent } from '@/components/Media'

const JUDUL_BAWAAN = 'Wadah bertumbuh mahasiswa'
const AKSEN_BAWAAN = 'Teknologi Informasi.'
const SUBJUDUL_BAWAAN =
  'Belajar, berkarya, dan memberikan dampak nyata bersama ITSA Politeknik Caltex Riau.'

/**
 * Hero beranda (DESIGN.md §6): foto lebar sebagai latar penuh, diselimuti
 * overlay hijau agar teks cream tetap terbaca (kontras WCAG), dengan potongan
 * judul disorot gold.
 *
 * Kalau foto latar belum diunggah, hero jatuh ke latar hijau polos dengan
 * cahaya lembut — tetap layak tampil, tidak ada kotak kosong.
 */
export const Hero: React.FC<{
  judul?: string | null
  aksen?: string | null
  subjudul?: string | null
  gambar?: Media | number | null
  videoUrl?: string | null
}> = ({ judul, aksen, subjudul, gambar, videoUrl }) => {
  const adaGambar = gambar && typeof gambar === 'object'
  const teksAksen = aksen ?? (judul ? null : AKSEN_BAWAAN)

  return (
    <section className="relative isolate overflow-hidden bg-forest">
      {/* Latar foto memenuhi seluruh section; overlay ganda menjaga keterbacaan:
          gelap merata + gradien dari bawah tempat teks berada. */}
      {adaGambar ? (
        <>
          <MediaComponent
            resource={gambar}
            fill
            priority
            imgClassName="object-cover"
            pictureClassName="absolute inset-0 -z-10"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-t from-forest via-forest/80 to-forest/55"
          />
        </>
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 -top-40 -z-10 size-[36rem] rounded-full bg-forest-elevated/50 blur-3xl"
        />
      )}

      <div className="container flex min-h-[34rem] flex-col justify-center py-24 sm:min-h-[40rem] sm:py-28 lg:min-h-[44rem]">
        <div className="max-w-3xl">
          <h1 className="font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-cream sm:text-5xl lg:text-6xl">
            {judul || JUDUL_BAWAAN}
            {teksAksen && (
              <>
                {' '}
                <span className="text-gold">{teksAksen}</span>
              </>
            )}
          </h1>
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-mist sm:text-lg">
            {subjudul || SUBJUDUL_BAWAAN}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/kegiatan"
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-forest transition-transform hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              Jelajahi ITSA
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/about"
              className="rounded-lg border border-cream/40 bg-forest/30 px-6 py-3 text-sm font-semibold text-cream backdrop-blur-sm transition-colors hover:border-cream hover:bg-forest-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Tentang Kami
            </Link>
          </div>
        </div>

        {/* Tautan video profil: tombol putar bundar + label. Hanya muncul kalau
            link video diisi di admin. */}
        {videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-12 inline-flex items-center gap-3 self-start rounded-full text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            <span className="inline-flex size-11 items-center justify-center rounded-full border border-cream/50 transition-colors group-hover:border-gold group-hover:bg-gold group-hover:text-forest">
              <Play className="size-4 translate-x-px" aria-hidden fill="currentColor" />
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold">Lihat Perjalanan Kami</span>
              <span className="block text-xs text-mist">Video Profil ITSA</span>
            </span>
          </a>
        )}
      </div>
    </section>
  )
}
