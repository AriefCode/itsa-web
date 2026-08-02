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
 * Struktur organisasi bisa berbeda tiap tahun: tiap Divisi milik satu Periode,
 * dan Pengurus menempel ke Divisi. Halaman ini menampilkan periode `aktif`
 * secara default; periode lain dibuka lewat `?periode=<slug>` (bisa dibagikan).
 * Pemilih periode baru muncul kalau memang sudah ada lebih dari satu kabinet.
 */
export default async function KabinetPage({ searchParams }: Args) {
  const payload = await getPayload({ config: configPromise })
  const sp = await searchParams

  // Divisi diambil dengan depth 1 supaya `foto_grup` (Media) dan `periode`
  // ikut terisi sebagai objek, bukan sekadar id.
  const [{ docs: pengurusSemua }, { docs: divisiSemua }, { docs: periodeDocs }, settings] =
    await Promise.all([
      payload.find({ collection: 'pengurus', limit: 500, depth: 1, sort: 'urutan' }),
      payload.find({ collection: 'divisi', limit: 200, depth: 1, sort: 'urutan' }),
      payload.find({ collection: 'periode', limit: 100, sort: '-tahun_mulai' }),
      payload.findGlobal({ slug: 'site-settings', depth: 1 }),
    ])

  // Periode terpilih: dari URL (slug) kalau valid > yang ditandai aktif > terbaru.
  const periodeDipilih =
    (sp.periode && periodeDocs.find((p) => p.slug === sp.periode)) ||
    periodeDocs.find((p) => p.aktif) ||
    periodeDocs[0]
  const idPeriode = periodeDipilih?.id

  // Hanya divisi milik periode terpilih — inilah yang membuat tiap tahun bisa
  // punya susunan divisi sendiri.
  const divisiPeriode = divisiSemua.filter((d) => {
    const per = d.periode
    const idPer = typeof per === 'object' && per ? per.id : per
    return idPer != null && idPer === idPeriode
  })
  const idDivisiPeriode = new Set(divisiPeriode.map((d) => d.id))

  // Pengurus yang divisinya termasuk periode ini (periode diwarisi dari divisi).
  const anggota = pengurusSemua.filter((p) => {
    const div = p.divisi
    const idDiv = typeof div === 'object' && div ? div.id : div
    return typeof idDiv === 'number' && idDivisiPeriode.has(idDiv)
  })

  const anggotaDivisi = (id: number) =>
    anggota
      .filter((p) => {
        const div = p.divisi
        const idDiv = typeof div === 'object' && div ? div.id : div
        return idDiv === id
      })
      .sort((a, b) => (a.urutan ?? 999) - (b.urutan ?? 999) || a.nama.localeCompare(b.nama, 'id'))

  const kelompok: Kelompok[] = divisiPeriode
    .map((divisi: Divisi) => ({ divisi, anggota: anggotaDivisi(divisi.id) }))
    .filter((k) => k.anggota.length > 0)
    .sort(
      (a, b) =>
        (a.divisi.urutan ?? 999) - (b.divisi.urutan ?? 999) ||
        a.divisi.nama.localeCompare(b.divisi.nama, 'id'),
    )

  // Daftar periode untuk pemilih di hero (terbaru dulu, ikut urutan query).
  const periodeTersedia = periodeDocs.map((p) => ({ label: p.label, slug: p.slug }))

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
        periodeAktif={
          periodeDipilih
            ? {
                label: periodeDipilih.label,
                slug: periodeDipilih.slug,
                tagline: periodeDipilih.tagline,
              }
            : undefined
        }
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
