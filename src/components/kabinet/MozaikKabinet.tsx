'use client'

import React, { useEffect, useState } from 'react'

import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'

/**
 * Acak Fisher–Yates lalu ambil `n` pertama. Menyalin dulu supaya array asal
 * tidak ikut berubah.
 */
const ambilAcak = <T,>(arr: T[], n: number): T[] => {
  const s = [...arr]
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[s[i], s[j]] = [s[j], s[i]]
  }
  return s.slice(0, n)
}

/**
 * Mozaik foto hero Kabinet yang berganti-ganti.
 *
 * Kumpulan foto pengurus dikirim dari server; komponen ini memilih delapan
 * secara acak tiap kali halaman dibuka. Render awalnya sengaja memakai delapan
 * foto pertama (sama dengan server) supaya tidak ada hydration mismatch —
 * pengacakan baru dijalankan setelah mount lewat useEffect.
 */
export const MozaikKabinet: React.FC<{ foto: MediaType[] }> = ({ foto }) => {
  const [pilihan, setPilihan] = useState<MediaType[]>(() => foto.slice(0, 8))

  useEffect(() => {
    if (foto.length > 8) setPilihan(ambilAcak(foto, 8))
  }, [foto])

  if (pilihan.length < 4) return null

  return (
    <div aria-hidden className="relative">
      <div className="grid grid-cols-4 gap-2.5">
        {pilihan.map((f, i) => (
          <div
            key={`${f.id}-${i}`}
            // Baris kedua diturunkan sedikit supaya susunannya tidak terbaca
            // sebagai tabel yang kaku.
            className={`overflow-hidden rounded-xl ring-1 ring-cream/10 ${i % 2 === 1 ? 'mt-5' : ''}`}
          >
            <Media resource={f} imgClassName="aspect-[3/4] w-full object-cover" htmlElement={null} />
          </div>
        ))}
      </div>
      {/* Tepi bawah dilebur ke latar supaya mozaiknya menyatu, bukan terpotong
          mendadak seperti gambar yang salah ukur. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-forest to-transparent" />
    </div>
  )
}
