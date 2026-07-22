'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Kendali untuk daftar yang digeser mendatar.
 *
 * Dipakai bersama oleh deretan kartu divisi dan carousel anggota — keduanya
 * butuh perilaku yang sama persis (panah mati di ujung, indikator ikut posisi
 * gulir), jadi logikanya ditaruh sekali di sini.
 *
 * Keadaannya dibaca dari DOM, bukan dihitung dari lebar kartu: dengan begitu
 * ia tetap benar di semua titik henti responsif tanpa perlu tahu berapa kartu
 * yang muat per layar.
 */
export const useGeserMendatar = (jumlah: number, kunciMuat: unknown) => {
  const trekRef = useRef<HTMLUListElement>(null)
  const [aktif, setAktif] = useState(0)
  const [bisaMundur, setBisaMundur] = useState(false)
  const [bisaMaju, setBisaMaju] = useState(false)

  const perbarui = useCallback(() => {
    const t = trekRef.current
    if (!t) return
    const sisa = t.scrollWidth - t.clientWidth
    setBisaMundur(t.scrollLeft > 8)
    setBisaMaju(t.scrollLeft < sisa - 8)

    const kartu = t.children[0] as HTMLElement | undefined
    if (kartu) {
      const langkah = kartu.offsetWidth + 16
      setAktif(Math.min(jumlah - 1, Math.max(0, Math.round(t.scrollLeft / langkah))))
    }
  }, [jumlah])

  useEffect(() => {
    const t = trekRef.current
    if (!t) return
    // Isi berganti: kembali ke awal lalu hitung ulang.
    t.scrollLeft = 0
    perbarui()

    // Lebar kotaknya bisa berubah tanpa jendela ikut berubah (mis. panel
    // membuka atau kolom sidebar menyusut), jadi ukurannya diamati langsung.
    const pengamat = new ResizeObserver(perbarui)
    pengamat.observe(t)
    return () => pengamat.disconnect()
  }, [perbarui, kunciMuat])

  const geser = (arah: 1 | -1) => {
    const t = trekRef.current
    if (!t) return
    t.scrollBy({ left: arah * Math.round(t.clientWidth * 0.8), behavior: 'smooth' })
  }

  const keIndeks = (i: number) => {
    const t = trekRef.current
    const kartu = t?.children[i] as HTMLElement | undefined
    if (t && kartu) t.scrollTo({ left: kartu.offsetLeft - t.offsetLeft, behavior: 'smooth' })
  }

  return { trekRef, aktif, bisaMundur, bisaMaju, perbarui, geser, keIndeks }
}

/** Kelas trek geser: scrollbar disembunyikan, snap aktif. */
export const TREK =
  'flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

/** Kelas tombol panah geser. */
export const PANAH =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-forest-line bg-forest text-cream transition duration-200 hover:border-gold hover:bg-forest-elevated disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-forest-line disabled:hover:bg-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'
