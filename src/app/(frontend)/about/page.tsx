import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'
import { ArrowRight, Users } from 'lucide-react'

import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import { HeroAbout } from '@/components/about/HeroAbout'
import { VisiMisi } from '@/components/about/VisiMisi'
import { NilaiInti } from '@/components/about/NilaiInti'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

export const revalidate = 600

/**
 * Halaman About (kustom, seragam dengan Kabinet/Kegiatan): hero, cerita singkat
 * "Tentang ITSA" (diambil dari Pengaturan Situs), Visi & Misi, nilai-nilai
 * inti, band statistik, lalu ajakan.
 *
 * Route kustom ini mengalahkan [slug] Pages untuk /about — About sengaja tidak
 * memakai layout-builder agar tampilannya konsisten dengan halaman lain.
 */
export default async function AboutPage() {
  const payload = await getPayload({ config: configPromise })
  const [settings, { docs: panitia }] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 1 }),
    payload.find({
      collection: 'media',
      depth: 0,
      limit: 1,
      where: { alt: { like: 'Panitia lengkap' } },
    }),
  ])

  const tentang = (settings as { tentang?: { judul?: string; paragraf?: string; gambar?: number | MediaType } })
    ?.tentang
  const fotoTentang =
    tentang?.gambar && typeof tentang.gambar === 'object' ? tentang.gambar : null
  // Hero pakai foto panitia lengkap kalau ada, supaya beda dari foto di section
  // "Tentang Kami". Kalau tak ada, jatuh ke foto tentang.
  const fotoHero = (panitia[0] as MediaType | undefined) ?? fotoTentang
  const statistik =
    (settings as { statistik?: { label: string; nilai: number; akhiran?: string | null }[] })
      ?.statistik ?? []

  return (
    <main className="overflow-x-clip bg-forest">
      <HeroAbout gambar={fotoHero} />

      {/* Tentang ITSA */}
      <section className="bg-forest-deep">
        <div className="container grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-2">
          <div className="min-w-0">
            <p className="font-aksen text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Tentang Kami
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold leading-tight text-cream sm:text-4xl">
              {tentang?.judul || 'Lebih dari sekadar organisasi.'}
            </h2>
            <p className="mt-4 leading-relaxed text-mist">
              {tentang?.paragraf ||
                'ITSA adalah ruang bagi mahasiswa Teknologi Informasi untuk bertumbuh, berinovasi, dan berkolaborasi. Bersama, kita membangun masa depan yang lebih baik.'}
            </p>
            <p className="mt-3 leading-relaxed text-mist">
              Setiap program kerja dijalankan oleh delapan departemen yang saling melengkapi — mulai
              dari pendidikan dan riset, komunikasi digital, hingga sosial, seni, dan olahraga.
            </p>
            <Link
              href="/kabinet"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-cream/35 px-5 py-3 text-sm font-semibold text-cream transition-colors hover:border-cream/70 hover:bg-cream/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <Users className="size-4" aria-hidden />
              Kenali Pengurus
            </Link>
          </div>

          {fotoTentang && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-cream/10">
              <Media
                resource={fotoTentang}
                imgClassName="absolute inset-0 h-full w-full object-cover"
                htmlElement={null}
              />
            </div>
          )}
        </div>
      </section>

      <VisiMisi />

      {/* Statistik */}
      {statistik.length > 0 && (
        <section className="bg-forest-deep">
          <div className="container pb-4">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-forest-line bg-forest-line lg:grid-cols-4">
              {statistik.map((s) => (
                <div key={s.label} className="bg-forest p-6 text-center">
                  <p className="font-aksen text-3xl font-bold leading-none text-gold tabular-nums">
                    {s.nilai}
                    {s.akhiran}
                  </p>
                  <p className="mt-2 text-sm text-mist">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <NilaiInti />

      {/* CTA */}
      <section className="bg-forest">
        <div className="container pb-16 sm:pb-20">
          <div className="flex flex-col items-start gap-6 rounded-2xl border border-forest-line bg-forest-elevated/60 px-6 py-8 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-cream sm:text-2xl">
                Punya ide atau masukan untuk ITSA?
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-mist">
                Suaramu penting. Sampaikan aspirasimu dan bantu ITSA jadi lebih baik.
              </p>
            </div>
            <Link
              href="/aspirasi"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-forest transition-transform hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              Sampaikan Aspirasi
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: 'About - ITSA',
  description:
    'Mengenal ITSA (Information Technology Student Association) Politeknik Caltex Riau — visi, misi, dan nilai-nilai kami.',
  openGraph: mergeOpenGraph({ title: 'About - ITSA', url: '/about' }),
}
