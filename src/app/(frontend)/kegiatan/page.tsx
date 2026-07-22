import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'

import { KegiatanBrowser } from '@/components/kegiatan/KegiatanBrowser'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

export const revalidate = 600

export default async function KegiatanPage() {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'events',
    // Diambil sekali lalu disaring di klien. Batas 500 lebih dari cukup untuk
    // himpunan; kalau suatu saat terlampaui, ganti ke paginasi di server.
    limit: 500,
    depth: 1,
    sort: '-tanggal_mulai',
    where: { _status: { equals: 'published' } },
  })

  return (
    <main className="bg-forest">
      <div className="container py-14 sm:py-20">
        <header className="max-w-[60ch]">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">
            Kegiatan
          </h1>
          <p className="mt-4 leading-relaxed text-mist">
            Semua kegiatan ITSA, dari yang sedang direncanakan sampai yang sudah terlaksana
            lengkap dengan dokumentasinya.
          </p>
        </header>

        <div className="mt-10">
          <KegiatanBrowser events={docs} />
        </div>
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: 'Kegiatan - ITSA',
  description: 'Timeline dan kalender kegiatan ITSA Politeknik Caltex Riau.',
  openGraph: mergeOpenGraph({ title: 'Kegiatan - ITSA', url: '/kegiatan' }),
}
