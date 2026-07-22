import type { Metadata } from 'next'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import type { Event, Media as MediaType } from '@/payload-types'
import RichText from '@/components/RichText'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { HeroKegiatan } from '@/components/kegiatan/detail/HeroKegiatan'
import { SidebarKegiatan } from '@/components/kegiatan/detail/SidebarKegiatan'
import { SorotanKegiatan } from '@/components/kegiatan/detail/SorotanKegiatan'
import { DokumentasiKegiatan } from '@/components/kegiatan/detail/DokumentasiKegiatan'
import { RecapKegiatan } from '@/components/kegiatan/detail/RecapKegiatan'
import { KegiatanLainnya } from '@/components/kegiatan/detail/KegiatanLainnya'
import type { Poster } from '@/components/kegiatan/detail/AksiKegiatan'
import { sudahSelesai } from '@/utilities/kegiatan'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { ambilParagraf, ambilTeks, potongTeks } from '@/utilities/lexicalText'

type Args = { params: Promise<{ slug?: string }> }

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'events',
    limit: 500,
    depth: 0,
    select: { slug: true },
    where: { _status: { equals: 'published' } },
  })
  return docs.filter((d) => d.slug).map(({ slug }) => ({ slug: slug! }))
}

const ambilKegiatan = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'events',
    draft,
    limit: 1,
    depth: 2,
    overrideAccess: draft,
    where: { slug: { equals: slug } },
  })
  return docs[0] ?? null
})

/**
 * Tiga kegiatan lain untuk blok "Kegiatan Lainnya".
 *
 * Yang belum lewat didahulukan (itu yang masih bisa diikuti pengunjung), lalu
 * dilengkapi kegiatan terbaru yang sudah selesai kalau jumlahnya belum cukup.
 */
const ambilKegiatanLain = cache(async (idSekarang: number | string) => {
  const payload = await getPayload({ config: configPromise })
  const sekarang = new Date().toISOString()
  const dasar: Where[] = [
    { id: { not_equals: idSekarang } },
    { _status: { equals: 'published' } },
  ]

  const { docs: mendatang } = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 3,
    sort: 'tanggal_mulai',
    where: { and: [...dasar, { tanggal_mulai: { greater_than: sekarang } }] },
  })

  if (mendatang.length >= 3) return mendatang

  const { docs: lampau } = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 3,
    sort: '-tanggal_mulai',
    where: { and: [...dasar, { tanggal_mulai: { less_than_equal: sekarang } }] },
  })

  return [...mendatang, ...lampau].slice(0, 3)
})

export default async function DetailKegiatan({ params }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await params
  const event = await ambilKegiatan({ slug: decodeURIComponent(slug) })

  if (!event) notFound()

  const lainnya = await ambilKegiatanLain(event.id)

  const selesai = sudahSelesai(event)
  const thumbnail: MediaType | null =
    event.thumbnail && typeof event.thumbnail === 'object' ? event.thumbnail : null

  // Poster memakai berkas thumbnail itu sendiri — collection Events belum
  // punya field poster terpisah, jadi ini gambar resmi kegiatan yang tersedia.
  const poster: Poster = thumbnail?.url
    ? { href: getMediaUrl(thumbnail.url), namaBerkas: thumbnail.filename || `${event.slug}.jpg` }
    : null

  // Field rich text yang dibuka lalu dikosongkan tetap menyisakan struktur
  // Lexical kosong, jadi keberadaan field saja tidak cukup: cek isi teksnya
  // supaya tidak muncul judul "Recap" yang menggantung tanpa isi.
  const paragrafRecap = selesai ? ambilParagraf(event.recap) : []
  const linkDokumentasi = selesai ? event.link_dokumentasi : null

  return (
    <main>
      {draft && <LivePreviewListener />}

      <HeroKegiatan event={event} poster={poster} />

      {/* Area baca: latar cream, teks forest (DESIGN.md §6) */}
      <div className="bg-cream text-forest">
        <div className="container py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="space-y-10 lg:col-span-8">
              <section aria-labelledby="tentang-kegiatan">
                <span aria-hidden className="block h-1 w-10 rounded-full bg-gold" />
                <h2
                  id="tentang-kegiatan"
                  className="mt-4 font-heading text-2xl font-bold text-forest"
                >
                  Tentang Kegiatan
                </h2>
                {/* Panjang baris dijaga di sini saja, bukan dengan mempersempit
                    seluruh kolom, supaya kartu di bawahnya tetap selebar grid. */}
                <div className="mt-4 max-w-[68ch] leading-relaxed">
                  <RichText data={event.deskripsi} enableGutter={false} />
                </div>
              </section>

              <SorotanKegiatan event={event} />

              {selesai && (
                <DokumentasiKegiatan
                  gambar={thumbnail ? [thumbnail] : []}
                  link={linkDokumentasi}
                />
              )}

              <RecapKegiatan paragraf={paragrafRecap} />
            </div>

            <div className="lg:col-span-4">
              <SidebarKegiatan event={event} poster={poster} />
            </div>
          </div>

          <div className="mt-16 sm:mt-20">
            <KegiatanLainnya events={lainnya as Event[]} />
          </div>
        </div>
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = '' } = await params
  const event = await ambilKegiatan({ slug: decodeURIComponent(slug) })
  if (!event) return { title: 'Kegiatan tidak ditemukan - ITSA' }

  const deskripsi = potongTeks(ambilTeks(event.deskripsi), 155)

  return {
    metadataBase: new URL(getServerSideURL()),
    title: `${event.judul} - Kegiatan ITSA`,
    description: deskripsi || undefined,
    openGraph: mergeOpenGraph({
      title: `${event.judul} - Kegiatan ITSA`,
      description: deskripsi || undefined,
      url: `/kegiatan/${event.slug}`,
    }),
  }
}
