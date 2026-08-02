import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'

import type { Media } from '@/payload-types'
import { Hero } from '@/components/home/Hero'
import { StatCounter } from '@/components/home/StatCounter'
import { TentangItsa } from '@/components/home/TentangItsa'
import { HighlightKegiatan } from '@/components/home/HighlightKegiatan'
import { DivisiRingkas } from '@/components/home/DivisiRingkas'
import { GaleriMomen } from '@/components/home/GaleriMomen'
import { CtaAspirasi, FaqRingkas, KegiatanMendatang } from '@/components/home/Seksi'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

export const revalidate = 600

/**
 * Beranda ITSA (DESIGN.md §6). Ritme terang/gelap per section:
 * hero (foto) -> statistik (cream) -> tentang (hijau) -> highlight (cream) ->
 * kegiatan mendatang (hijau) -> divisi (cream) -> galeri (hijau) ->
 * FAQ (cream) -> ajakan aspirasi -> footer.
 *
 * Status kegiatan tidak disimpan di database; pemisahan "mendatang" dan
 * "selesai" dihitung dari tanggal. Patokannya tanggal_selesai; kalau kosong,
 * dipakai tanggal_mulai.
 */
export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const sekarang = new Date().toISOString()

  const [settings, mendatang, selesai, faq, divisi, fotoEvent] = await Promise.all([
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
      limit: 5,
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
    // depth 1 supaya relasi `periode` ikut terisi — dipakai untuk menyaring ke
    // kabinet yang sedang aktif (struktur divisi bisa beda tiap tahun).
    payload.find({ collection: 'divisi', limit: 100, depth: 1, sort: 'urutan' }),
    // Galeri momen diambil otomatis dari thumbnail kegiatan terbaru yang punya
    // foto, jadi tidak perlu koleksi galeri terpisah.
    payload.find({
      collection: 'events',
      limit: 10,
      depth: 1,
      sort: '-tanggal_mulai',
      where: {
        _status: { equals: 'published' },
        thumbnail: { exists: true },
      },
    }),
  ])

  // Kumpulkan foto galeri: ambil thumbnail yang benar-benar ter-populate, buang
  // duplikat berdasarkan id, batasi delapan supaya barisnya tidak kepanjangan.
  const galeri: Media[] = []
  const terlihat = new Set<number>()
  for (const e of fotoEvent.docs) {
    const t = e.thumbnail
    if (t && typeof t === 'object' && !terlihat.has(t.id)) {
      terlihat.add(t.id)
      galeri.push(t)
    }
    if (galeri.length >= 8) break
  }

  const tentang = settings?.tentang

  // Tampilkan divisi dari kabinet yang aktif saja. Kalau belum ada yang ditandai
  // aktif (mis. data lama), jatuh ke semua divisi supaya section tidak kosong.
  const divisiAktif = divisi.docs.filter((d) => {
    const per = d.periode
    return typeof per === 'object' && per !== null && per.aktif === true
  })
  const divisiTampil = (divisiAktif.length > 0 ? divisiAktif : divisi.docs).slice(0, 8)

  return (
    <main>
      <Hero
        judul={settings?.hero?.judul}
        aksen={settings?.hero?.judul_aksen}
        subjudul={settings?.hero?.subjudul}
        gambar={settings?.hero?.gambar}
        videoUrl={settings?.hero?.video_url}
      />
      <StatCounter statistik={settings?.statistik ?? []} />
      <TentangItsa
        judul={tentang?.judul}
        paragraf={tentang?.paragraf}
        gambar={tentang?.gambar}
        kartuJudul={tentang?.kartu_judul}
        kartuTeks={tentang?.kartu_teks}
      />
      <HighlightKegiatan events={selesai.docs} />
      <KegiatanMendatang events={mendatang.docs} />
      <DivisiRingkas divisi={divisiTampil} />
      <GaleriMomen foto={galeri} />
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
