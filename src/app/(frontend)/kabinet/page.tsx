import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'

import type { Divisi, Media } from '@/payload-types'
import { HeroKabinet } from '@/components/kabinet/HeroKabinet'
import { StatKabinet } from '@/components/kabinet/StatKabinet'
import { KabinetBrowser, type Kelompok } from '@/components/kabinet/KabinetBrowser'
import { CtaKabinet } from '@/components/kabinet/CtaKabinet'
import type { FotoHero } from '@/components/kabinet/HeroCarousel'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

export const revalidate = 600

type Args = { searchParams: Promise<{ periode?: string }> }

/**
 * Halaman Kabinet.
 *
 * Server hanya mengambil dan mengelompokkan data; seluruh penjelajahan
 * (memilih divisi, mencari, membuka profil) terjadi di klien tanpa navigasi.
 *
 * Paginasi yang dulu ada di sini dihapus: begitu anggota ditampilkan per
 * divisi, tidak ada lagi daftar panjang yang perlu dipotong — dan memotongnya
 * justru merusak pengelompokan, karena satu divisi bisa terbelah dua halaman.
 *
 * Satu dokumen Pengurus mewakili satu orang pada satu periode, jadi halaman
 * ini menampilkan satu periode saja. Pemilih periode baru muncul kalau memang
 * sudah ada lebih dari satu kabinet.
 */
export default async function KabinetPage({ searchParams }: Args) {
  const payload = await getPayload({ config: configPromise })
  const sp = await searchParams

  // Divisi diambil terpisah dengan depth 1 supaya `foto_grup` ikut terisi
  // sebagai objek Media (lewat relasi Pengurus, upload-nya cuma jadi id).
  const [{ docs: semua }, { docs: divisiSemua }, settings] = await Promise.all([
    payload.find({ collection: 'pengurus', limit: 500, depth: 1, sort: 'urutan' }),
    payload.find({ collection: 'divisi', limit: 100, depth: 1, sort: 'urutan' }),
    payload.findGlobal({ slug: 'site-settings', depth: 1 }),
  ])

  // Periode terbaru lebih dulu. Format "2026/2027" aman diurutkan sebagai teks.
  const periodeTersedia = [...new Set(semua.map((p) => p.periode))].sort().reverse()
  const periodeAktif =
    sp.periode && periodeTersedia.includes(sp.periode) ? sp.periode : periodeTersedia[0]

  const anggota = semua.filter((p) => p.periode === periodeAktif)

  // Kelompokkan anggota per divisi memakai objek Divisi berdepth 1. Divisi
  // yang belum punya pengurus di periode ini dilewati.
  const anggotaDivisi = (id: number) =>
    anggota
      .filter((p) => {
        const div = p.divisi
        const idDiv = typeof div === 'object' && div ? div.id : div
        return idDiv === id
      })
      .sort((a, b) => (a.urutan ?? 999) - (b.urutan ?? 999) || a.nama.localeCompare(b.nama, 'id'))

  const kelompok: Kelompok[] = divisiSemua
    .map((divisi: Divisi) => ({ divisi, anggota: anggotaDivisi(divisi.id) }))
    .filter((k) => k.anggota.length > 0)
    .sort(
      (a, b) =>
        (a.divisi.urutan ?? 999) - (b.divisi.urutan ?? 999) ||
        a.divisi.nama.localeCompare(b.divisi.nama, 'id'),
    )

  // Foto sorotan hero (dari Pengaturan Situs). Hanya yang gambarnya terisi.
  const fotoHero: FotoHero[] = ((settings as { kabinet?: { foto_hero?: unknown[] } })?.kabinet
    ?.foto_hero ?? [])
    .map((f) => f as { gambar?: number | Media; keterangan?: string | null })
    .filter((f): f is { gambar: Media; keterangan?: string | null } => typeof f.gambar === 'object')

  return (
    <main className="overflow-x-clip bg-forest">
      <HeroKabinet
        anggota={anggota}
        fotoHero={fotoHero}
        periodeAktif={periodeAktif}
        periodeTersedia={periodeTersedia}
      />

      <StatKabinet jumlahPengurus={anggota.length} jumlahDivisi={kelompok.length} />

      <div className="container py-12 sm:py-16">
        {kelompok.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-forest-line px-6 py-12 text-center text-sm text-mist">
            Belum ada data pengurus untuk periode ini. Tambahkan lewat panel admin.
          </p>
        ) : (
          <KabinetBrowser kelompok={kelompok} />
        )}
      </div>

      <CtaKabinet />
    </main>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: 'Kabinet - ITSA',
  description: 'Pengurus ITSA Politeknik Caltex Riau, dikelompokkan per divisi.',
  openGraph: mergeOpenGraph({ title: 'Kabinet - ITSA', url: '/kabinet' }),
}
