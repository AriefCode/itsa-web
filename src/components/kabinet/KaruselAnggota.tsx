'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { Pengurus } from '@/payload-types'
import { KartuPengurus } from './KartuPengurus'
import { PANAH, TREK, useGeserMendatar } from './useGeserMendatar'

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
  const { trekRef, aktif, bisaMundur, bisaMaju, perbarui, geser, keIndeks } = useGeserMendatar(
    anggota.length,
    anggota,
  )

  return (
    <div>
      <ul
        ref={trekRef}
        onScroll={perbarui}
        aria-label={label}
        className={`${TREK} snap-mandatory`}
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
                  onClick={() => keIndeks(i)}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === aktif ? 'w-5 bg-gold' : 'w-1.5 bg-mist/40 hover:bg-mist'
                  }`}
                />
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <button type="button" onClick={() => geser(-1)} disabled={!bisaMundur} className={PANAH}>
              <span className="sr-only">Anggota sebelumnya</span>
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button type="button" onClick={() => geser(1)} disabled={!bisaMaju} className={PANAH}>
              <span className="sr-only">Anggota berikutnya</span>
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
