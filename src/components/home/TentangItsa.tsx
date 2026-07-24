import Link from 'next/link'
import React from 'react'
import { ArrowRight, Users } from 'lucide-react'

import type { Media } from '@/payload-types'
import { Media as MediaComponent } from '@/components/Media'
import { Reveal } from '@/components/motion/Reveal'

const JUDUL_BAWAAN = 'Lebih dari sekadar organisasi.'
const PARAGRAF_BAWAAN =
  'ITSA adalah ruang bagi mahasiswa untuk bertumbuh, berinovasi, dan berkolaborasi di bidang teknologi informasi. Bersama, kita membangun masa depan yang lebih baik.'

/** Label kecil di atas judul section, dengan garis gold pendek (DESIGN.md §2). */
const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="flex items-center gap-3 font-aksen text-xs uppercase tracking-[0.18em] text-mist">
    <span aria-hidden className="h-px w-8 bg-gold" />
    {children}
  </p>
)

/**
 * Section "Tentang ITSA" (beranda): teks di kiri, foto di kanan dengan kartu
 * kecil melayang sebagai penegas. Latar hijau tua.
 *
 * Kalau foto belum diunggah, kolom teks melebar mengisi ruang — tidak ada
 * kotak kosong. Teks judul & paragraf punya bawaan supaya section tetap layak
 * tampil sebelum admin mengisinya.
 */
export const TentangItsa: React.FC<{
  judul?: string | null
  paragraf?: string | null
  gambar?: Media | number | null
  kartuJudul?: string | null
  kartuTeks?: string | null
}> = ({ judul, paragraf, gambar, kartuJudul, kartuTeks }) => {
  const adaGambar = gambar && typeof gambar === 'object'

  return (
    <section className="bg-forest" aria-labelledby="tentang-itsa">
      <div className="container grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <Eyebrow>Tentang ITSA</Eyebrow>
          <h2
            id="tentang-itsa"
            className="mt-5 max-w-[16ch] font-heading text-3xl font-bold leading-tight text-cream sm:text-4xl"
          >
            {judul || JUDUL_BAWAAN}
          </h2>
          <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-mist">
            {paragraf || PARAGRAF_BAWAAN}
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center gap-2 rounded-lg border border-cream/40 px-5 py-3 text-sm font-semibold text-cream transition-colors hover:border-cream hover:bg-forest-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Selengkapnya Tentang ITSA
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Reveal>

        {adaGambar && (
          <Reveal delay={120} className="relative">
            <div className="overflow-hidden rounded-2xl border border-forest-line">
              <MediaComponent
                resource={gambar}
                imgClassName="aspect-[4/3] w-full object-cover"
              />
            </div>

            {/* Kartu sorot melayang di sudut bawah foto. Hanya muncul kalau
                admin mengisi judulnya, supaya tidak ada kartu kosong. */}
            {kartuJudul && (
              <div className="absolute -bottom-5 left-5 right-5 flex items-center gap-3 rounded-xl border border-forest-line bg-forest-elevated/95 p-4 shadow-lg backdrop-blur-sm sm:left-6 sm:right-auto sm:max-w-xs">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-gold text-forest">
                  <Users className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-heading text-sm font-bold text-cream">{kartuJudul}</p>
                  {kartuTeks && (
                    <p className="mt-0.5 text-xs leading-relaxed text-mist">{kartuTeks}</p>
                  )}
                </div>
              </div>
            )}
          </Reveal>
        )}
      </div>
    </section>
  )
}
