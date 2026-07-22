import type { Metadata } from 'next'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import React, { Suspense } from 'react'
import { Inbox } from 'lucide-react'

import { FormAspirasi } from '@/components/aspirasi/FormAspirasi'
import { HeroAspirasi } from '@/components/aspirasi/HeroAspirasi'
import { StatistikAspirasi } from '@/components/aspirasi/StatistikAspirasi'
import { FilterAspirasi } from '@/components/aspirasi/FilterAspirasi'
import { KartuAspirasi } from '@/components/aspirasi/KartuAspirasi'
import { SidebarAspirasi } from '@/components/aspirasi/SidebarAspirasi'
import { TombolMengambang } from '@/components/aspirasi/TombolMengambang'
import { KerangkaDaftar, KerangkaStatistik } from '@/components/aspirasi/Kerangka'
import { Paginasi } from '@/components/Paginasi'
import { kategoriSah } from '@/utilities/aspirasi'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

const PER_HALAMAN = 8

type Args = {
  searchParams: Promise<{ [kunci: string]: string | string[] | undefined }>
}

type Saringan = { q: string; kategori: string; urut: 'terbaru' | 'terlama'; halaman: number }

const satuNilai = (nilai: string | string[] | undefined): string =>
  (Array.isArray(nilai) ? nilai[0] : nilai)?.trim() ?? ''

/**
 * Semua penyaringan dan paginasi dikerjakan di SERVER lewat query URL, bukan
 * di browser. Halaman ini dirancang menampung ratusan sampai ribuan aspirasi;
 * mengirim seluruhnya ke browser lalu menyaring di sana akan makin berat
 * seiring bertambahnya data, dan tiap kombinasi saringan tidak akan punya URL
 * yang bisa dibagikan.
 */
const bacaSaringan = (sp: Record<string, string | string[] | undefined>): Saringan => {
  const kategori = satuNilai(sp.kategori)
  const halaman = Number.parseInt(satuNilai(sp.halaman), 10)
  return {
    q: satuNilai(sp.q),
    // Kategori asing dari URL diabaikan, bukan diteruskan ke query.
    kategori: kategoriSah(kategori) ? kategori : '',
    urut: satuNilai(sp.urut) === 'terlama' ? 'terlama' : 'terbaru',
    halaman: Number.isFinite(halaman) && halaman > 0 ? halaman : 1,
  }
}

const buatQuery = (s: Saringan, halaman: number): string => {
  const p = new URLSearchParams()
  if (s.q) p.set('q', s.q)
  if (s.kategori) p.set('kategori', s.kategori)
  if (s.urut !== 'terbaru') p.set('urut', s.urut)
  if (halaman > 1) p.set('halaman', String(halaman))
  const query = p.toString()
  return `/aspirasi${query ? `?${query}` : ''}#daftar-aspirasi`
}

/**
 * Ringkasan angka. Sengaja dihitung atas SELURUH aspirasi yang tayang, bukan
 * hasil saringan — angka yang ikut berubah tiap kali kategori diganti tidak
 * lagi menjawab "seberapa responsif pengurus", yang justru pertanyaannya.
 */
async function Statistik() {
  const payload = await getPayload({ config: configPromise })
  const dasar = { collection: 'aspirasi' as const, limit: 1, depth: 0, overrideAccess: false }

  const [semua, ditanggapi] = await Promise.all([
    payload.find(dasar),
    payload.find({
      ...dasar,
      where: { or: [{ respon_komentar: { exists: true } }, { respon_foto: { exists: true } }] },
    }),
  ])

  return <StatistikAspirasi total={semua.totalDocs} ditanggapi={ditanggapi.totalDocs} />
}

async function DaftarAspirasi({ saringan }: { saringan: Saringan }) {
  const payload = await getPayload({ config: configPromise })

  const kondisi: Where[] = []
  if (saringan.q) {
    kondisi.push({ or: [{ judul: { like: saringan.q } }, { isi: { like: saringan.q } }] })
  }
  if (saringan.kategori) kondisi.push({ kategori: { equals: saringan.kategori } })

  // overrideAccess: false membuat query tunduk pada access control publik,
  // sehingga hanya aspirasi yang sudah ditandai tampil yang ikut terambil.
  // Yang belum dimoderasi tidak pernah sampai ke halaman ini.
  const hasil = await payload.find({
    collection: 'aspirasi',
    limit: PER_HALAMAN,
    page: saringan.halaman,
    depth: 1,
    sort: saringan.urut === 'terlama' ? 'createdAt' : '-createdAt',
    overrideAccess: false,
    ...(kondisi.length > 0 ? { where: { and: kondisi } } : {}),
  })

  if (hasil.docs.length === 0) {
    const adaSaringan = Boolean(saringan.q || saringan.kategori)
    return (
      <div className="rounded-2xl border border-dashed border-olive/30 px-6 py-16 text-center">
        <span
          aria-hidden
          className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-olive/10 text-olive"
        >
          <Inbox className="size-8" strokeWidth={1.5} />
        </span>
        <p className="mt-5 font-heading text-lg font-bold text-forest">Belum ada aspirasi</p>
        <p className="mx-auto mt-2 max-w-[42ch] text-sm leading-relaxed text-olive">
          {adaSaringan
            ? 'Tidak ada aspirasi yang cocok dengan filter ini. Coba kata kunci lain atau lihat semua kategori.'
            : 'Aspirasi yang sudah ditanggapi pengurus akan muncul di sini.'}
        </p>
        {adaSaringan && (
          <Link
            href="/aspirasi"
            className="mt-6 inline-flex items-center rounded-xl border border-olive/30 px-5 py-2.5 text-sm font-medium text-forest transition-colors duration-200 hover:bg-olive/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            Reset Filter
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      <p className="mb-4 text-sm text-olive" aria-live="polite">
        Menampilkan {hasil.docs.length} dari {hasil.totalDocs} aspirasi
      </p>

      <ul className="space-y-4">
        {hasil.docs.map((a) => (
          <KartuAspirasi key={a.id} aspirasi={a} />
        ))}
      </ul>

      <Paginasi
        halaman={hasil.page ?? 1}
        totalHalaman={hasil.totalPages}
        buatHref={(n) => buatQuery(saringan, n)}
        label="Halaman aspirasi"
        nada="terang"
      />
    </>
  )
}

export default async function AspirasiPage({ searchParams }: Args) {
  const sp = await searchParams
  const saringan = bacaSaringan(sp)

  const payload = await getPayload({ config: configPromise })
  const { docs: faq } = await payload.find({
    collection: 'faq',
    limit: 4,
    depth: 0,
    sort: 'urutan',
  })

  return (
    <main>
      <HeroAspirasi />

      <div className="bg-cream text-forest">
        <div className="container space-y-10 py-12 sm:space-y-12 sm:py-16">
          {/* scroll-mt memberi jarak di atas form saat dituju dari anchor,
              supaya judulnya tidak menempel persis di tepi atas layar. */}
          <section id="tulis-aspirasi" className="scroll-mt-6" aria-label="Form kirim aspirasi">
            <FormAspirasi />
          </section>

          <Suspense fallback={<KerangkaStatistik />}>
            <Statistik />
          </Suspense>

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <FilterAspirasi q={saringan.q} kategori={saringan.kategori} urut={saringan.urut} />
            </div>

            <section
              id="daftar-aspirasi"
              className="scroll-mt-6 lg:col-span-6"
              aria-labelledby="judul-daftar"
            >
              <h2 id="judul-daftar" className="mb-4 font-heading text-xl font-bold text-forest">
                Aspirasi Terbaru
              </h2>
              {/* key membuat Suspense memasang ulang batasnya setiap saringan
                  berubah, sehingga kerangka muncul lagi alih-alih menahan
                  daftar lama sampai data baru siap. */}
              <Suspense key={JSON.stringify(saringan)} fallback={<KerangkaDaftar />}>
                <DaftarAspirasi saringan={saringan} />
              </Suspense>
            </section>

            <div className="lg:col-span-3">
              <SidebarAspirasi faq={faq} />
            </div>
          </div>
        </div>
      </div>

      <TombolMengambang />
    </main>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: 'Aspirasi - ITSA',
  description: 'Kirim aspirasi anonim untuk ITSA Politeknik Caltex Riau.',
  openGraph: mergeOpenGraph({ title: 'Aspirasi - ITSA', url: '/aspirasi' }),
}
