'use client'

import React, { useState } from 'react'
import { Check, Share2 } from 'lucide-react'

/**
 * Tombol bagikan halaman kegiatan.
 *
 * Pakai Web Share API kalau tersedia (umumnya di ponsel) supaya muncul lembar
 * bagikan bawaan sistem. Di desktop yang belum mendukungnya, tautan disalin ke
 * papan klip — tombolnya tetap berguna, bukan mati.
 */
export const TombolBagikan: React.FC<{ judul: string; className: string; label?: string }> = ({
  judul,
  className,
  label = 'Bagikan',
}) => {
  const [tersalin, setTersalin] = useState(false)

  const bagikan = async () => {
    const url = window.location.href

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: judul, url })
        return
      } catch {
        // Pengguna membatalkan lembar bagikan, atau browser menolaknya.
        // Jatuh ke penyalinan tautan di bawah.
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setTersalin(true)
      window.setTimeout(() => setTersalin(false), 2000)
    } catch {
      // Papan klip diblokir (mis. halaman bukan HTTPS). Tidak ada yang bisa
      // dilakukan selain membiarkan tombol kembali ke keadaan semula.
    }
  }

  return (
    <button type="button" onClick={bagikan} className={className}>
      {tersalin ? (
        <Check className="size-4 shrink-0" aria-hidden />
      ) : (
        <Share2 className="size-4 shrink-0" aria-hidden />
      )}
      <span aria-live="polite">{tersalin ? 'Tautan disalin' : label}</span>
    </button>
  )
}
