import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import React, { cache } from 'react'
import { ArrowLeft, CalendarDays, ExternalLink, MapPin, Ticket, Users } from 'lucide-react'

import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { formatJam, formatRentang, sudahSelesai } from '@/utilities/kegiatan'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'
import { ambilTeks, potongTeks } from '@/utilities/lexicalText'

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

export default async function DetailKegiatan({ params }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await params
  const event = await ambilKegiatan({ slug: decodeURIComponent(slug) })

  if (!event) notFound()

  const selesai = sudahSelesai(event)
  const jam = formatJam(event.tanggal_mulai)
  // Field rich text yang dibuka lalu dikosongkan tetap menyisakan struktur
  // Lexical kosong, jadi keberadaan field saja tidak cukup: cek isi teksnya
  // supaya tidak muncul judul "Recap" yang menggantung tanpa isi.
  const adaRecap = ambilTeks(event.recap).trim().length > 0

  return (
    <main>
      {draft && <LivePreviewListener />}

      {/* Kepala: tetap hijau, memberi jeda sebelum area baca terang */}
      <header className="bg-forest">
        <div className="container py-12 sm:py-16">
          <Link
            href="/kegiatan"
            className="inline-flex items-center gap-2 rounded text-sm text-mist transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Semua kegiatan
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span
              className={
                selesai
                  ? 'rounded bg-cream px-2.5 py-1 text-xs font-medium text-forest'
                  : 'rounded border border-cream/50 px-2.5 py-1 text-xs font-medium text-cream'
              }
            >
              {selesai ? 'Selesai' : 'Akan Datang'}
            </span>
            {event.divisi && typeof event.divisi === 'object' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-mist">
                <Users className="size-3.5" aria-hidden />
                {event.divisi.nama}
              </span>
            )}
          </div>

          <h1 className="mt-4 max-w-[24ch] font-heading text-3xl font-extrabold leading-tight tracking-tight text-cream sm:text-4xl lg:text-5xl">
            {event.judul}
          </h1>

          <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-sm text-mist">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Tanggal</dt>
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              <dd>
                {formatRentang(event.tanggal_mulai, event.tanggal_selesai)}
                {jam && !event.tanggal_selesai && `, ${jam} WIB`}
              </dd>
            </div>
            {event.lokasi && (
              <div className="flex items-center gap-2">
                <dt className="sr-only">Lokasi</dt>
                <MapPin className="size-4 shrink-0" aria-hidden />
                <dd>{event.lokasi}</dd>
              </div>
            )}
            <div className="flex items-center gap-2">
              <dt className="sr-only">Biaya</dt>
              <Ticket className="size-4 shrink-0" aria-hidden />
              <dd>
                {event.gratis || typeof event.htm !== 'number'
                  ? 'Gratis'
                  : `Rp${event.htm.toLocaleString('id-ID')}`}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      {event.thumbnail && typeof event.thumbnail === 'object' && (
        <div className="bg-forest">
          <div className="container pb-12 sm:pb-16">
            <Media
              resource={event.thumbnail}
              imgClassName="aspect-[21/9] w-full rounded-lg object-cover"
              htmlElement={null}
              priority
            />
          </div>
        </div>
      )}

      {/* Area baca: latar cream, teks forest (DESIGN.md §6) */}
      <div className="bg-cream text-forest">
        <div className="container py-14 sm:py-20">
          <div className="max-w-[70ch]">
            <RichText data={event.deskripsi} enableGutter={false} />

            {selesai && event.link_dokumentasi && (
              <div className="mt-10 border-t border-olive/30 pt-8">
                <h2 className="font-heading text-lg font-bold">Dokumentasi</h2>
                <p className="mt-2 text-sm text-olive">
                  Foto dan video kegiatan tersimpan di Google Drive.
                </p>
                <a
                  href={event.link_dokumentasi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-forest transition-transform hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  Buka Dokumentasi
                  <ExternalLink className="size-4" aria-hidden />
                </a>
              </div>
            )}

            {selesai && adaRecap && event.recap && (
              <div className="mt-10 border-t border-olive/30 pt-8">
                <h2 className="font-heading text-lg font-bold">Recap</h2>
                <div className="mt-4">
                  <RichText data={event.recap} enableGutter={false} />
                </div>
              </div>
            )}
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
