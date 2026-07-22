import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'

import type { Divisi } from '@/payload-types'
import { HeroKabinet } from '@/components/kabinet/HeroKabinet'
import { KabinetBrowser, type Kelompok } from '@/components/kabinet/KabinetBrowser'
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

  const { docs: semua } = await payload.find({
    collection: 'pengurus',
    limit: 500,
    depth: 1,
    sort: 'urutan',
  })

  // Periode terbaru lebih dulu. Format "2026/2027" aman diurutkan sebagai teks.
  const periodeTersedia = [...new Set(semua.map((p) => p.periode))].sort().reverse()
  const periodeAktif =
    sp.periode && periodeTersedia.includes(sp.periode) ? sp.periode : periodeTersedia[0]

  const anggota = semua.filter((p) => p.periode === periodeAktif)

  const urutanDivisi = (d: Divisi | null) => d?.urutan ?? 999

  // Kelompokkan per divisi. Divisi tanpa objek relasi (data belum lengkap)
  // dilewati ketimbang membuat kartu divisi tanpa nama.
  const peta = new Map<number | string, Kelompok>()
  for (const p of anggota) {
    const div = p.divisi && typeof p.divisi === 'object' ? p.divisi : null
    if (!div) continue
    const ada = peta.get(div.id)
    if (ada) ada.anggota.push(p)
    else peta.set(div.id, { divisi: div, anggota: [p] })
  }

  const kelompok = [...peta.values()]
    .map((k) => ({
      ...k,
      anggota: [...k.anggota].sort(
        (a, b) => (a.urutan ?? 999) - (b.urutan ?? 999) || a.nama.localeCompare(b.nama, 'id'),
      ),
    }))
    .sort(
      (a, b) =>
        urutanDivisi(a.divisi) - urutanDivisi(b.divisi) ||
        // Divisi dengan angka urutan sama diurutkan alfabetis agar susunannya
        // tetap sama di tiap render, tidak bergantung urutan dari database.
        a.divisi.nama.localeCompare(b.divisi.nama, 'id'),
    )

  return (
    <main className="bg-forest">
      <HeroKabinet
        anggota={anggota}
        jumlahDivisi={kelompok.length}
        periodeAktif={periodeAktif}
        periodeTersedia={periodeTersedia}
      />

      <div className="container py-12 sm:py-16">
        {kelompok.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-forest-line px-6 py-12 text-center text-sm text-mist">
            Belum ada data pengurus untuk periode ini. Tambahkan lewat panel admin.
          </p>
        ) : (
          <KabinetBrowser kelompok={kelompok} />
        )}
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: 'Kabinet - ITSA',
  description: 'Pengurus ITSA Politeknik Caltex Riau, dikelompokkan per divisi.',
  openGraph: mergeOpenGraph({ title: 'Kabinet - ITSA', url: '/kabinet' }),
}
