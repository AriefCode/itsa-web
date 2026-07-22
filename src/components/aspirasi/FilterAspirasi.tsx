'use client'

import Link from 'next/link'
import React, { useRef } from 'react'
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'

import { KATEGORI_ASPIRASI } from '@/utilities/aspirasi'

type Props = {
  q: string
  kategori: string
  urut: string
}

const JUDUL_KELOMPOK = 'font-heading text-xs font-bold uppercase tracking-[0.14em] text-mist'

/**
 * Panel saringan aspirasi.
 *
 * Sengaja berupa <form method="get">, bukan state di React: setiap kombinasi
 * saringan jadi URL tersendiri yang bisa dibagikan dan di-bookmark, penyaringan
 * dikerjakan di server (halaman ini bisa memuat ribuan aspirasi, jadi tidak
 * semuanya boleh dikirim ke browser), dan saringannya tetap berfungsi kalau
 * JavaScript gagal dimuat.
 *
 * JavaScript hanya menambah kenyamanan: memilih kategori atau urutan langsung
 * mengirim form tanpa perlu menekan tombol terpisah.
 */
export const FilterAspirasi: React.FC<Props> = ({ q, kategori, urut }) => {
  const formRef = useRef<HTMLFormElement>(null)

  const kirimUlang = () => formRef.current?.requestSubmit()

  return (
    <form
      ref={formRef}
      method="get"
      action="/aspirasi"
      className="rounded-2xl border border-forest-line bg-forest p-5 text-cream lg:sticky lg:top-8"
    >
      <h2 className="flex items-center gap-2 font-heading text-base font-bold">
        <SlidersHorizontal className="size-4 text-gold" aria-hidden />
        Filter Aspirasi
      </h2>

      <div className="mt-5">
        <label htmlFor="cari-aspirasi" className={JUDUL_KELOMPOK}>
          Cari aspirasi
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="cari-aspirasi"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Ketik kata kunci..."
            className="min-w-0 flex-1 rounded-xl border border-forest-field bg-forest-elevated px-3.5 py-2.5 text-sm text-cream transition-colors duration-200 placeholder:text-mist/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          />
          <button
            type="submit"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-forest-field text-cream transition-colors duration-200 hover:bg-forest-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <span className="sr-only">Cari</span>
            <Search className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className={JUDUL_KELOMPOK}>Kategori</legend>
        <div className="mt-2 space-y-0.5">
          {[{ nilai: '', label: 'Semua kategori' }, ...KATEGORI_ASPIRASI].map((k) => {
            const aktif = kategori === k.nilai
            return (
              <label
                key={k.nilai || 'semua'}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold ${
                  aktif ? 'bg-forest-elevated font-medium text-cream' : 'text-mist hover:text-cream'
                }`}
              >
                <input
                  type="radio"
                  name="kategori"
                  value={k.nilai}
                  defaultChecked={aktif}
                  onChange={kirimUlang}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`size-1.5 shrink-0 rounded-full ${aktif ? 'bg-gold' : 'bg-mist/40'}`}
                />
                {k.label}
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-6">
        <label htmlFor="urut-aspirasi" className={JUDUL_KELOMPOK}>
          Urutkan
        </label>
        <select
          id="urut-aspirasi"
          name="urut"
          defaultValue={urut}
          onChange={kirimUlang}
          className="mt-2 w-full rounded-xl border border-forest-field bg-forest-elevated px-3.5 py-2.5 text-sm text-cream transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <option value="terbaru">Terbaru</option>
          <option value="terlama">Terlama</option>
        </select>
      </div>

      {/* Tombol kirim cadangan: tanpa JavaScript, ini yang menerapkan pilihan
          kategori dan urutan. Dengan JavaScript aktif, keduanya sudah terkirim
          sendiri saat dipilih, jadi tombolnya disembunyikan. */}
      <noscript>
        <button
          type="submit"
          className="mt-5 w-full rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-forest"
        >
          Terapkan filter
        </button>
      </noscript>

      <Link
        href="/aspirasi"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-forest-line px-4 py-2.5 text-sm text-cream transition-colors duration-200 hover:bg-forest-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <RotateCcw className="size-4" aria-hidden />
        Reset Filter
      </Link>
    </form>
  )
}
