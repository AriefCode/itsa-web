import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'

import { BeritaBrowser } from '@/components/berita/BeritaBrowser'
import { CtaNewsletter } from '@/components/berita/CtaNewsletter'
import { punyaKategori } from '@/utilities/berita'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

export const revalidate = 600

/**
 * Halaman Berita: bilah berita terbaru, hero (judul + cari + carousel
 * unggulan), lalu satu grid berita yang bisa disaring per kategori dan
 * diurutkan, ditutup ajakan berlangganan.
 *
 * Semua berita diambil sekali di sini lalu disaring & diurutkan di klien
 * (BeritaBrowser). Kegiatan unggulan mengutamakan kategori Prestasi.
 */
export default async function BeritaPage() {
  const payload = await getPayload({ config: configPromise })

  const [{ docs: posts }, { docs: kategori }] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 100,
      sort: '-publishedAt',
      overrideAccess: false,
    }),
    payload.find({ collection: 'categories', limit: 50, depth: 0, sort: 'urutan' }),
  ])

  // Unggulan: berita Prestasi dulu, dilengkapi berita terbaru lain sampai 4.
  // ID kategori dicari dari judul, bukan di-hardcode, supaya tetap benar walau
  // datanya diisi ulang dan id-nya berganti.
  const prestasiId = kategori.find((k) => k.title.toLowerCase() === 'prestasi')?.id
  const prestasi = prestasiId ? posts.filter((p) => punyaKategori(p, prestasiId)) : []
  const sisanya = prestasiId ? posts.filter((p) => !punyaKategori(p, prestasiId)) : posts
  const unggulan = [...prestasi, ...sisanya].slice(0, 4)

  return (
    <main className="bg-forest">
      <BeritaBrowser
        posts={posts}
        kategori={kategori.map((k) => ({ id: k.id, title: k.title }))}
        unggulan={unggulan}
      />
      <CtaNewsletter />
    </main>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: 'Berita - ITSA',
  description:
    'Berita terbaru ITSA Politeknik Caltex Riau: prestasi, kegiatan, dan pengumuman mahasiswa TI.',
  openGraph: mergeOpenGraph({ title: 'Berita - ITSA', url: '/posts' }),
}
