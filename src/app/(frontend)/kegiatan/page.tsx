import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'

import { HeroKegiatan } from '@/components/kegiatan/HeroKegiatan'
import { StatKegiatan, type StatItem } from '@/components/kegiatan/StatKegiatan'
import { KegiatanExplorer } from '@/components/kegiatan/KegiatanExplorer'
import { CtaKegiatan } from '@/components/kegiatan/CtaKegiatan'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { sudahSelesai } from '@/utilities/kegiatan'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

export const revalidate = 600

/**
 * Halaman Kegiatan: hero berfoto -> band statistik -> penjelajah tiga mode
 * (Timeline / Kalender / Gallery) -> ajakan bergabung.
 *
 * Semua kegiatan diambil sekali di sini lalu disaring & ditampilkan di klien
 * (KegiatanExplorer). Statistik dan kegiatan unggulan dihitung dari data nyata.
 */
export default async function KegiatanPage() {
  const payload = await getPayload({ config: configPromise })

  const [{ docs }, divisiRes, settings] = await Promise.all([
    payload.find({
      collection: 'events',
      // Diambil sekali lalu disaring di klien. Batas 500 lebih dari cukup;
      // kalau suatu saat terlampaui, ganti ke paginasi di server.
      limit: 500,
      depth: 1,
      sort: '-tanggal_mulai',
      where: { _status: { equals: 'published' } },
    }),
    payload.find({ collection: 'divisi', limit: 50, depth: 0, sort: 'urutan' }),
    getCachedGlobal('site-settings', 2)(),
  ])

  const now = Date.now()
  const mendatang = docs.filter((e) => !sudahSelesai(e))
  const selesai = docs.filter((e) => sudahSelesai(e))

  // Kegiatan unggulan: yang sedang berlangsung; kalau tidak ada, yang paling
  // dekat akan datang; kalau tidak ada juga, yang terakhir selesai.
  const sedang = docs.find((e) => {
    const m = new Date(e.tanggal_mulai).getTime()
    const s = new Date(e.tanggal_selesai || e.tanggal_mulai).getTime()
    return m <= now && now <= s
  })
  const terdekat = [...mendatang].sort(
    (a, b) => new Date(a.tanggal_mulai).getTime() - new Date(b.tanggal_mulai).getTime(),
  )[0]
  const featured = sedang ?? terdekat ?? docs[0] ?? null

  const stats: StatItem[] = [
    { ikon: 'total', nilai: docs.length, label: 'Total Kegiatan', sub: 'Sejak 2009' },
    { ikon: 'mendatang', nilai: mendatang.length, label: 'Akan Datang', sub: 'Belum terlaksana' },
    { ikon: 'selesai', nilai: selesai.length, label: 'Kegiatan Selesai', sub: 'Terlaksana' },
    { ikon: 'divisi', nilai: divisiRes.totalDocs, label: 'Divisi Aktif', sub: 'Terlibat' },
  ]

  const divisiList = divisiRes.docs.map((d) => ({ id: d.id, nama: d.nama }))

  return (
    <main className="bg-forest">
      <HeroKegiatan gambar={settings?.hero?.gambar} />
      <StatKegiatan items={stats} />

      <div className="container pb-4 pt-12 sm:pt-16">
        <KegiatanExplorer events={docs} divisiList={divisiList} featured={featured} />
      </div>

      <CtaKegiatan featured={featured} />
    </main>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: 'Kegiatan - ITSA',
  description:
    'Jelajahi kegiatan ITSA Politeknik Caltex Riau lewat timeline, kalender, dan galeri dokumentasi.',
  openGraph: mergeOpenGraph({ title: 'Kegiatan - ITSA', url: '/kegiatan' }),
}
