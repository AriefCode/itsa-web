'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { Pengurus } from '@/payload-types'
import { KartuPengurus } from './KartuPengurus'

const TOMBOL =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-forest-line bg-forest text-cream transition duration-200 hover:border-gold hover:bg-forest-elevated disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-forest-line disabled:hover:bg-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

/**
 * Carousel anggota divisi.
 *
 * Dibangun dari scroll mendatar + CSS scroll-snap, bukan pustaka carousel:
 * geser dengan jari sudah didapat gratis dari browser, roda mouse dan
 * navigasi keyboard tetap bekerja, dan tidak ada dependensi baru yang harus
 * ikut dimuat pengunjung (CLAUDE.md).
 *
 * Panah dan titik indikator hanya lapisan kenyamanan di atasnya; kalau
 * JavaScript gagal, daftarnya masih bisa digeser.
 */
export const KaruselAnggota: React.FC<{
  anggota: Pengurus[]
  onBuka: (pengurus: Pengurus) => void
  label: string
}> = ({ anggota, onBuka, label }) => {
  const trekRef = useRef<HTMLUListElement>(null)
  const [aktif, setAktif] = useState(0)
  const [bisaMundur, setBisaMundur] = useState(false)
  const [bisaMaju, setBisaMaju] = useState(false)

  /**
   * Hitung ulang keadaan panah dan titik dari posisi gulir sebenarnya.
   * Membaca DOM, bukan menebak dari lebar kartu, supaya tetap benar di semua
   * titik henti responsif tanpa perlu tahu berapa kartu yang muat per layar.
   */
  const perbarui = useCallback(() => {
    const t = trekRef.current
    if (!t) return
    const sisa = t.scrollWidth - t.clientWidth
    setBisaMundur(t.scrollLeft > 8)
    setBisaMaju(t.scrollLeft < sisa - 8)

    const kartu = t.children[0] as HTMLElement | undefined
    if (kartu) {
      const langkah = kartu.offsetWidth + 16
      setAktif(Math.min(anggota.length - 1, Math.max(0, Math.round(t.scrollLeft / langkah))))
    }
  }, [anggota.length])

  useEffect(() => {
    const t = trekRef.current
    if (!t) return
    // Divisi berganti: kembali ke awal dan hitung ulang.
    t.scrollLeft = 0
    perbarui()

    const pengamat = new ResizeObserver(perbarui)
    pengamat.observe(t)
    return () => pengamat.disconnect()
  }, [perbarui, anggota])

  const geser = (arah: 1 | -1) => {
    const t = trekRef.current
    if (!t) return
    t.scrollBy({ left: arah * Math.round(t.clientWidth * 0.8), behavior: 'smooth' })
  }

  const keKartu = (i: number) => {
    const t = trekRef.current
    const kartu = t?.children[i] as HTMLElement | undefined
    if (t && kartu) t.scrollTo({ left: kartu.offsetLeft - t.offsetLeft, behavior: 'smooth' })
  }

  return (
    <div>
      <ul
        ref={trekRef}
        onScroll={perbarui}
        aria-label={label}
        // scrollbar disembunyikan tapi gulirannya tetap ada — panah dan
        // gesernya yang jadi kendali utama.
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {anggota.map((p, i) => (
          <li
            key={p.id}
            className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-3rem)/4)]"
          >
            <KartuPengurus pengurus={p} onBuka={onBuka} indeks={i} />
          </li>
        ))}
      </ul>

      {(bisaMundur || bisaMaju) && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <ul className="flex flex-wrap gap-1.5" aria-hidden>
            {anggota.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => keKartu(i)}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === aktif ? 'w-5 bg-gold' : 'w-1.5 bg-mist/40 hover:bg-mist'
                  }`}
                />
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <button type="button" onClick={() => geser(-1)} disabled={!bisaMundur} className={TOMBOL}>
              <span className="sr-only">Anggota sebelumnya</span>
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button type="button" onClick={() => geser(1)} disabled={!bisaMaju} className={TOMBOL}>
              <span className="sr-only">Anggota berikutnya</span>
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
