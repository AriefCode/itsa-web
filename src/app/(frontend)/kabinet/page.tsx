import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import React from 'react'

import type { Divisi, Pengurus } from '@/payload-types'
import { KartuPengurus } from '@/components/kabinet/KartuPengurus'
import { Paginasi } from '@/components/Paginasi'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

export const revalidate = 600

const PER_HALAMAN = 12

type Args = { searchParams: Promise<{ page?: string; periode?: string }> }

/**
 * Halaman Kabinet.
 *
 * Pengurus diurutkan berdasarkan urutan divisi lalu urutan jabatan, kemudian
 * dipotong per halaman. Konsekuensi yang disadari: satu divisi bisa terbelah
 * antara dua halaman. Karena itu judul divisi yang terpotong diberi keterangan
 * "lanjutan" supaya pembaca tidak mengira daftarnya dimulai dari awal.
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

  const urutanDivisi = (p: Pengurus) =>
    p.divisi && typeof p.divisi === 'object' ? (p.divisi.urutan ?? 999) : 999
  const namaDivisi = (p: Pengurus) =>
    p.divisi && typeof p.divisi === 'object' ? p.divisi.nama : ''

  const terurut = [...anggota].sort(
    (a, b) =>
      urutanDivisi(a) - urutanDivisi(b) ||
      // Divisi dengan angka urutan sama diurutkan alfabetis agar susunannya
      // tetap sama di tiap render, tidak bergantung urutan dari database.
      namaDivisi(a).localeCompare(namaDivisi(b), 'id') ||
      (a.urutan ?? 999) - (b.urutan ?? 999) ||
      a.nama.localeCompare(b.nama, 'id'),
  )

  const totalHalaman = Math.max(1, Math.ceil(terurut.length / PER_HALAMAN))
  const diminta = Number.parseInt(sp.page ?? '1', 10)
  const halaman = Number.isFinite(diminta) ? Math.min(Math.max(diminta, 1), totalHalaman) : 1
  const mulai = (halaman - 1) * PER_HALAMAN
  const isiHalaman = terurut.slice(mulai, mulai + PER_HALAMAN)

  // Kelompokkan isi halaman per divisi, sambil mencatat apakah divisi pertama
  // merupakan sambungan dari halaman sebelumnya.
  const kelompok: { divisi: Divisi | null; items: Pengurus[]; lanjutan: boolean }[] = []
  for (const p of isiHalaman) {
    const div = p.divisi && typeof p.divisi === 'object' ? p.divisi : null
    const akhir = kelompok[kelompok.length - 1]
    if (akhir && akhir.divisi?.id === div?.id) akhir.items.push(p)
    else kelompok.push({ divisi: div, items: [p], lanjutan: false })
  }
  const sebelumnya = terurut[mulai - 1]
  if (kelompok[0] && sebelumnya) {
    const divSebelum =
      sebelumnya.divisi && typeof sebelumnya.divisi === 'object' ? sebelumnya.divisi : null
    kelompok[0].lanjutan = divSebelum?.id === kelompok[0].divisi?.id
  }

  const buatHref = (h: number) => {
    const q = new URLSearchParams()
    if (periodeAktif && periodeTersedia.length > 1) q.set('periode', periodeAktif)
    if (h > 1) q.set('page', String(h))
    const s = q.toString()
    return s ? `/kabinet?${s}` : '/kabinet'
  }

  return (
    <main className="bg-forest">
      <div className="container py-14 sm:py-20">
        <header className="max-w-[60ch]">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">
            Kabinet
          </h1>
          <p className="mt-4 leading-relaxed text-mist">
            Pengurus ITSA yang menjalankan program kerja himpunan, dikelompokkan per divisi.
          </p>
        </header>

        {periodeTersedia.length > 1 && (
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Pilih periode">
            {periodeTersedia.map((per) => {
              const aktif = per === periodeAktif
              const q = new URLSearchParams()
              q.set('periode', per)
              return (
                <Link
                  key={per}
                  href={`/kabinet?${q.toString()}`}
                  aria-current={aktif ? 'true' : undefined}
                  className={[
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                    aktif
                      ? 'bg-gold text-forest'
                      : 'border border-forest-line text-cream hover:bg-forest-elevated',
                  ].join(' ')}
                >
                  {per}
                </Link>
              )
            })}
          </div>
        )}

        {terurut.length === 0 ? (
          <p className="mt-10 rounded-lg border border-dashed border-forest-line px-6 py-12 text-center text-sm text-mist">
            Belum ada data pengurus. Tambahkan lewat panel admin.
          </p>
        ) : (
          <>
            <p className="mt-8 text-sm text-mist">
              {terurut.length} pengurus
              {periodeAktif ? ` periode ${periodeAktif}` : ''}
              {totalHalaman > 1 ? ` - halaman ${halaman} dari ${totalHalaman}` : ''}
            </p>

            <div className="mt-8 space-y-12">
              {kelompok.map((g, i) => (
                <section key={`${g.divisi?.id ?? 'tanpa'}-${i}`}>
                  <h2 className="font-heading text-xl font-bold text-cream">
                    {g.divisi?.nama ?? 'Tanpa Divisi'}
                    {g.lanjutan && (
                      <span className="ml-2 text-sm font-normal text-mist">(lanjutan)</span>
                    )}
                  </h2>

                  {/* Deskripsi divisi hanya ditulis di tempat divisi itu dimulai,
                      supaya tidak diulang pada halaman sambungan. */}
                  {!g.lanjutan && g.divisi?.deskripsi_singkat && (
                    <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-mist">
                      {g.divisi.deskripsi_singkat}
                    </p>
                  )}

                  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {g.items.map((p) => (
                      <KartuPengurus key={p.id} pengurus={p} />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <Paginasi halaman={halaman} totalHalaman={totalHalaman} buatHref={buatHref} />
          </>
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
