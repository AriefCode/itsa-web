'use client'

import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Home, Search } from 'lucide-react'

import type { Post } from '@/payload-types'
import { FeaturedCarousel } from './FeaturedCarousel'
import { KartuBeritaBersih } from './KartuBeritaBersih'
import { cuplikanPost, kategoriPost, punyaKategori } from '@/utilities/berita'

type Kat = { id: number; title: string }
type Urut = 'terbaru' | 'terlama'
const PER_HALAMAN = 6

/**
 * Penjelajah berita: hero (judul + cari + carousel unggulan) lalu satu grid
 * berita yang bisa disaring per kategori, diurutkan, dan dimuat bertahap.
 * Semua berita diambil sekali di server lalu disaring di klien, jadi berganti
 * kategori/urutan tidak memicu permintaan jaringan.
 */
export const BeritaBrowser: React.FC<{
  posts: Post[]
  kategori: Kat[]
  unggulan: Post[]
}> = ({ posts, kategori, unggulan }) => {
  const [q, setQ] = useState('')
  const [aktif, setAktif] = useState<number | 'semua'>('semua')
  const [urut, setUrut] = useState<Urut>('terbaru')
  const [tampil, setTampil] = useState(PER_HALAMAN)

  const reset = () => setTampil(PER_HALAMAN)

  const tersaring = useMemo(() => {
    const cari = q.trim().toLowerCase()
    const hasil = posts.filter((p) => {
      if (aktif !== 'semua' && !punyaKategori(p, aktif)) return false
      if (cari) {
        const kat = kategoriPost(p)
          .map((c) => c.title)
          .join(' ')
        if (!`${p.title} ${cuplikanPost(p, 200)} ${kat}`.toLowerCase().includes(cari)) return false
      }
      return true
    })
    hasil.sort((a, b) => {
      const ta = new Date(a.publishedAt ?? 0).getTime()
      const tb = new Date(b.publishedAt ?? 0).getTime()
      return urut === 'terbaru' ? tb - ta : ta - tb
    })
    return hasil
  }, [posts, aktif, q, urut])

  const chip = (id: number | 'semua', label: string) => {
    const on = aktif === id
    return (
      <button
        key={id}
        type="button"
        onClick={() => {
          setAktif(id)
          reset()
        }}
        aria-pressed={on}
        className={[
          'rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
          on
            ? 'border-gold text-gold'
            : 'border-forest-line text-mist hover:border-cream/40 hover:text-cream',
        ].join(' ')}
      >
        {label}
      </button>
    )
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-forest">
        <div className="container py-10 sm:py-12">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-1.5 font-aksen text-xs text-mist">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 rounded transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <Home className="size-3.5" aria-hidden />
                  Beranda
                </Link>
              </li>
              <ChevronRight className="size-3.5" aria-hidden />
              <li aria-current="page" className="text-cream">
                News
              </li>
            </ol>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-12">
            <div>
              <p className="font-aksen text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                Berita ITSA
              </p>
              <h1 className="mt-3 font-heading text-3xl font-extrabold leading-[1.1] tracking-tight text-cream sm:text-4xl">
                Cerita terbaru, prestasi yang <span className="text-gold">menginspirasi.</span>
              </h1>
              <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-mist sm:text-base">
                Dapatkan informasi terbaru seputar prestasi, kegiatan, dan pengumuman penting dari
                ITSA.
              </p>
              <div className="relative mt-6">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-mist"
                  aria-hidden
                />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value)
                    reset()
                  }}
                  placeholder="Cari berita..."
                  aria-label="Cari berita"
                  className="w-full rounded-xl border border-forest-line bg-forest-elevated/60 py-3 pl-11 pr-4 text-sm text-cream placeholder:text-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                />
              </div>
            </div>

            <FeaturedCarousel posts={unggulan} />
          </div>
        </div>
      </section>

      {/* Filter + grid */}
      <section className="bg-forest">
        <div className="container pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Saring kategori">
              <span className="mr-1 font-heading text-sm font-bold text-cream">Kategori</span>
              {chip('semua', 'Semua')}
              {kategori.map((k) => chip(k.id, k.title))}
            </div>

            <div className="relative shrink-0 self-start sm:self-auto">
              <label htmlFor="urut-berita" className="sr-only">
                Urutkan
              </label>
              <select
                id="urut-berita"
                value={urut}
                onChange={(e) => {
                  setUrut(e.target.value as Urut)
                  reset()
                }}
                className="appearance-none rounded-lg border border-forest-line bg-forest-elevated/60 py-2.5 pl-4 pr-10 text-sm font-medium text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-mist"
                aria-hidden
              />
            </div>
          </div>

          <h2 className="mt-8 font-heading text-xl font-bold text-cream sm:text-2xl">
            Berita Terbaru
            <span aria-hidden className="mt-2 block h-1 w-12 rounded-full bg-gold" />
          </h2>

          {tersaring.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-forest-line px-6 py-12 text-center text-sm text-mist">
              Tidak ada berita yang cocok. Coba kata kunci atau kategori lain.
            </p>
          ) : (
            <>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {tersaring.slice(0, tampil).map((p) => (
                  <KartuBeritaBersih key={p.id} post={p} />
                ))}
              </div>
              {tampil < tersaring.length && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setTampil((n) => n + PER_HALAMAN)}
                    className="inline-flex items-center gap-2 rounded-lg border border-forest-line px-5 py-3 text-sm font-semibold text-cream transition-colors hover:border-gold hover:bg-forest-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    Muat berita lainnya
                    <ChevronDown className="size-4" aria-hidden />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
