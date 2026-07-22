import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'

import { Hero } from '@/components/home/Hero'
import { StatCounter } from '@/components/home/StatCounter'
import { CtaAspirasi, FaqRingkas, KegiatanMendatang, RecapTerbaru } from '@/components/home/Seksi'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

export const revalidate = 600

/**
 * Beranda ITSA (DESIGN.md §6):
 * hero hijau -> band statistik cream -> recap -> kegiatan mendatang ->
 * FAQ ringkas -> ajakan aspirasi -> footer.
 *
 * Status kegiatan tidak lagi disimpan di database, jadi pemisahan "mendatang"
 * dan "selesai" dilakukan lewat tanggal. Patokannya tanggal_selesai; kalau
 * kosong, dipakai tanggal_mulai.
 */
export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const sekarang = new Date().toISOString()

  const [settings, mendatang, selesai, faq] = await Promise.all([
    getCachedGlobal('site-settings', 2)(),
    payload.find({
      collection: 'events',
      limit: 3,
      depth: 1,
      sort: 'tanggal_mulai',
      where: {
        _status: { equals: 'published' },
        or: [
          { tanggal_selesai: { greater_than_equal: sekarang } },
          {
            and: [
              { tanggal_selesai: { exists: false } },
              { tanggal_mulai: { greater_than_equal: sekarang } },
            ],
          },
        ],
      },
    }),
    payload.find({
      collection: 'events',
      limit: 3,
      depth: 1,
      sort: '-tanggal_mulai',
      where: {
        _status: { equals: 'published' },
        or: [
          { tanggal_selesai: { less_than: sekarang } },
          {
            and: [
              { tanggal_selesai: { exists: false } },
              { tanggal_mulai: { less_than: sekarang } },
            ],
          },
        ],
      },
    }),
    payload.find({ collection: 'faq', limit: 4, sort: 'urutan' }),
  ])

  return (
    <main>
      <Hero
        judul={settings?.hero?.judul}
        subjudul={settings?.hero?.subjudul}
        gambar={settings?.hero?.gambar}
      />
      <StatCounter statistik={settings?.statistik ?? []} />
      <RecapTerbaru events={selesai.docs} />
      <KegiatanMendatang events={mendatang.docs} />
      <FaqRingkas faq={faq.docs} />
      <CtaAspirasi />
    </main>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: 'ITSA - Information Technology Student Association',
  description:
    'Himpunan mahasiswa Teknologi Informasi Politeknik Caltex Riau. Kegiatan, kabinet, berita, dan aspirasi.',
  openGraph: mergeOpenGraph({
    title: 'ITSA - Information Technology Student Association',
    url: '/',
  }),
}
