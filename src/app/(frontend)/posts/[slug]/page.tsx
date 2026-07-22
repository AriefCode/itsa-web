import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import React, { cache } from 'react'
import { ArrowLeft, CalendarDays, ExternalLink } from 'lucide-react'

import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { generateMeta } from '@/utilities/generateMeta'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return posts.docs.filter((d) => d.slug).map(({ slug }) => ({ slug: slug! }))
}

type Args = { params: Promise<{ slug?: string }> }

export default async function BeritaDetail({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  const kategori = (post.categories ?? []).filter((c) => typeof c === 'object')
  const tanggal = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null
  const gambar =
    post.heroImage && typeof post.heroImage === 'object'
      ? post.heroImage
      : post.meta?.image && typeof post.meta.image === 'object'
        ? post.meta.image
        : null

  return (
    <main>
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <header className="bg-forest">
        <div className="container py-12 sm:py-16">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 rounded text-sm text-mist transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Semua berita
          </Link>

          {kategori.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {kategori.map((c) => (
                <Link
                  key={c.id}
                  href={`/posts?kategori=${c.slug}`}
                  className="rounded border border-cream/40 px-2.5 py-1 text-xs font-medium text-cream transition-colors hover:bg-forest-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  {c.title}
                </Link>
              ))}
            </div>
          )}

          <h1 className="mt-4 max-w-[24ch] font-heading text-3xl font-extrabold leading-tight tracking-tight text-cream sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          {tanggal && (
            <p className="mt-6 flex items-center gap-2 text-sm text-mist">
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              {tanggal}
            </p>
          )}
        </div>
      </header>

      {gambar && (
        <div className="bg-forest">
          <div className="container pb-12 sm:pb-16">
            <Media
              resource={gambar}
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
            <RichText data={post.content} enableGutter={false} />

            {/*
              Berita Oprec mengarah ke Google Form pendaftaran. Tombolnya
              ditaruh SETELAH isi berita, bukan di atas, supaya pembaca tahu
              dulu apa yang didaftarkan sebelum diarahkan keluar situs.
            */}
            {post.link_eksternal && (
              <div className="mt-10 border-t border-olive/30 pt-8">
                <h2 className="font-heading text-lg font-bold">Pendaftaran</h2>
                <p className="mt-2 text-sm text-olive">
                  Pendaftaran dibuka lewat formulir di luar situs ini.
                </p>
                <a
                  href={post.link_eksternal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-forest transition-transform hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  Buka Formulir Pendaftaran
                  <ExternalLink className="size-4" aria-hidden />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const post = await queryPostBySlug({ slug: decodeURIComponent(slug) })
  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    depth: 2,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})
