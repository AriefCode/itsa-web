'use client'

import React, { useEffect, useState } from 'react'
import { Bookmark } from 'lucide-react'

const KUNCI = 'itsa:berita-tersimpan'

const baca = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(KUNCI) || '[]')
  } catch {
    return []
  }
}

/**
 * Tombol simpan berita, disimpan di localStorage peramban (tanpa backend).
 * Berada di dalam kartu yang juga sebuah tautan, jadi klik & keyboardnya
 * dihentikan agar tidak ikut membuka halaman berita.
 */
export const TombolSimpan: React.FC<{ slug: string; terang?: boolean }> = ({
  slug,
  terang = false,
}) => {
  const [tersimpan, setTersimpan] = useState(false)

  useEffect(() => {
    setTersimpan(baca().includes(slug))
  }, [slug])

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const daftar = baca()
    const baru = daftar.includes(slug) ? daftar.filter((s) => s !== slug) : [...daftar, slug]
    localStorage.setItem(KUNCI, JSON.stringify(baru))
    setTersimpan(baru.includes(slug))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={tersimpan}
      aria-label={tersimpan ? 'Hapus dari simpanan' : 'Simpan berita'}
      className={[
        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
        tersimpan
          ? 'text-gold'
          : terang
            ? 'text-olive hover:text-forest'
            : 'text-mist hover:text-cream',
      ].join(' ')}
    >
      <Bookmark className="size-4" aria-hidden fill={tersimpan ? 'currentColor' : 'none'} />
    </button>
  )
}
