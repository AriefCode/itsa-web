import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import React from 'react'

import { KartuBerita } from '@/components/berita/KartuBerita'
import { Paginasi } from '@/components/Paginasi'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

export const revalidate = 600

const PER_HALAMAN = 9

type Args = { searchParams: Promise<{ page?: string; kategori?: string }> }

/**
 * Feed berita ITSA.
 *
 * Saringan kategori dan nomor halaman ditaruh di URL, bukan di state komponen,
 * supaya tiap kombinasi punya alamat sendiri yang bisa dibagikan dan diindeks.
 * Penyaringan dikerjakan di server lewat query, jadi yang dikirim ke browser
 * hanya berita yang memang ditampilkan.
 */
export default async function BeritaPage({ searchParams }: Args) {
  const payload = await getPayload({ config: configPromise })
  const sp = await searchParams

  const { docs: kategori } = await payload.find({
    collection: 'categories',
    limit: 50,
    depth: 0,
    sort: 'title',
  })

  const aktif = kategori.find((k) => k.slug === sp.kategori)
  const diminta = Number.parseInt(sp.page ?? '1', 10)
  const halamanDiminta = Number.isFinite(diminta) && diminta > 0 ? diminta : 1

  const hasil = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: PER_HALAMAN,
    page: halamanDiminta,
    sort: '-publishedAt',
    overrideAccess: false,
    where: aktif ? { categories: { in: [aktif.id] } } : {},
  })

  const buatHref = (h: number) => {
    const q = new URLSearchParams()
    if (aktif?.slug) q.set('kategori', aktif.slug)
    if (h > 1) q.set('page', String(h))
    const s = q.toString()
    return s ? `/posts?${s}` : '/posts'
  }

  return (
    <main className="bg-forest">
      <div className="container py-14 sm:py-20">
        <header className="max-w-[60ch]">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">
            Berita
          </h1>
          <p className="mt-4 leading-relaxed text-mist">
            Kabar terbaru dari ITSA: pembukaan pendaftaran, prestasi warga TI, dan pengumuman
            himpunan.
          </p>
        </header>

        {kategori.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Saring kategori">
            {[{ id: 0, title: 'Semua', slug: null }, ...kategori].map((k) => {
              const dipilih = k.slug ? k.slug === aktif?.slug : !aktif
              return (
                <Link
                  key={k.slug ?? 'semua'}
                  href={k.slug ? `/posts?kategori=${k.slug}` : '/posts'}
                  aria-current={dipilih ? 'true' : undefined}
                  className={[
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                    dipilih
                      ? 'bg-gold text-forest'
                      : 'border border-forest-line text-cream hover:bg-forest-elevated',
                  ].join(' ')}
                >
                  {k.title}
                </Link>
              )
            })}
          </div>
        )}

        {hasil.docs.length === 0 ? (
          <p className="mt-10 rounded-lg border border-dashed border-forest-line px-6 py-12 text-center text-sm text-mist">
            {aktif
              ? `Belum ada berita berkategori ${aktif.title}.`
              : 'Belum ada berita yang diterbitkan.'}
          </p>
        ) : (
          <>
            <p className="mt-8 text-sm text-mist">
              {hasil.totalDocs} berita
              {aktif ? ` berkategori ${aktif.title}` : ''}
              {hasil.totalPages > 1 ? ` - halaman ${hasil.page} dari ${hasil.totalPages}` : ''}
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hasil.docs.map((post) => (
                <KartuBerita key={post.id} post={post} />
              ))}
            </div>

            <Paginasi
              halaman={hasil.page ?? 1}
              totalHalaman={hasil.totalPages}
              buatHref={buatHref}
            />
          </>
        )}
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: 'Berita - ITSA',
  description: 'Kabar terbaru dari ITSA Politeknik Caltex Riau.',
  openGraph: mergeOpenGraph({ title: 'Berita - ITSA', url: '/posts' }),
}
