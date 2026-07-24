'use client'

import React, { useEffect, useState } from 'react'

/** Sisa waktu menuju sebuah tanggal, dipecah jadi hari/jam/menit/detik. */
const hitungSisa = (target: number) => {
  const selisih = Math.max(0, target - Date.now())
  const detikTotal = Math.floor(selisih / 1000)
  return {
    hari: Math.floor(detikTotal / 86400),
    jam: Math.floor((detikTotal % 86400) / 3600),
    menit: Math.floor((detikTotal % 3600) / 60),
    detik: detikTotal % 60,
    habis: selisih === 0,
  }
}

const dua = (n: number) => String(n).padStart(2, '0')

/**
 * Penghitung mundur menuju `targetISO`, berdetak tiap detik di klien. Nilai
 * awalnya juga dirender di server (dari waktu render) supaya tidak ada kedipan
 * kosong sebelum JavaScript aktif.
 */
export const Countdown: React.FC<{ targetISO: string }> = ({ targetISO }) => {
  const target = new Date(targetISO).getTime()
  const [sisa, setSisa] = useState(() => hitungSisa(target))

  useEffect(() => {
    const id = setInterval(() => setSisa(hitungSisa(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const unit = [
    { nilai: sisa.hari, label: 'Hari' },
    { nilai: sisa.jam, label: 'Jam' },
    { nilai: sisa.menit, label: 'Menit' },
    { nilai: sisa.detik, label: 'Detik' },
  ]

  return (
    <div className="grid grid-cols-4 gap-2" role="timer" aria-label="Hitung mundur">
      {unit.map((u) => (
        <div
          key={u.label}
          className="rounded-lg bg-forest/60 px-1 py-2 text-center ring-1 ring-forest-line"
        >
          {/* Nilai berubah tiap detik, jadi render server & klien pasti beda —
              suppressHydrationWarning menandai ini memang disengaja. */}
          <div
            suppressHydrationWarning
            className="font-aksen text-xl font-bold tabular-nums text-cream sm:text-2xl"
          >
            {dua(u.nilai)}
          </div>
          <div className="mt-0.5 text-[10px] uppercase tracking-wide text-mist">{u.label}</div>
        </div>
      ))}
    </div>
  )
}
