'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Overlay splash video, tampil sekali tiap sesi browser (DESIGN.md §4).
 *
 * Perilaku:
 * - Muncul hanya kalau `sessionStorage` belum mencatat splash sesi ini, jadi
 *   pindah halaman tidak memutarnya lagi.
 * - Tombol Skip selalu ada dan langsung fokusabel.
 * - Menutup sendiri saat video selesai.
 * - Tombol Esc juga menutup.
 * - Kalau file videonya tidak ada atau gagal dimuat, overlay langsung menutup
 *   diri. Situs tidak boleh tertutup layar hitam gara-gara aset hilang.
 * - Dilewati sepenuhnya kalau pengguna menyalakan `prefers-reduced-motion`.
 */

const KUNCI_SESI = 'itsa-splash-sudah-tampil'
const SUMBER_VIDEO = '/splash.mp4'

export const Splash: React.FC = () => {
  // Mulai dari false supaya render server dan klien sama (tidak ada hydration
  // mismatch); baru diputuskan di efek setelah sessionStorage terbaca.
  const [tampil, setTampil] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const tombolRef = useRef<HTMLButtonElement>(null)

  const tutup = useCallback(() => {
    setTampil(false)
    try {
      sessionStorage.setItem(KUNCI_SESI, '1')
    } catch {
      // Mode privat bisa melarang sessionStorage. Splash tetap tertutup.
    }
  }, [])

  useEffect(() => {
    let batal = false
    const kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let sudah = false
    try {
      sudah = sessionStorage.getItem(KUNCI_SESI) === '1'
    } catch {
      sudah = true
    }
    if (kurangiGerak || sudah) return

    // Pastikan file videonya benar-benar ada sebelum menutupi layar.
    fetch(SUMBER_VIDEO, { method: 'HEAD' })
      .then((r) => {
        if (!batal && r.ok) setTampil(true)
      })
      .catch(() => {
        /* aset tidak ada: jangan tampilkan apa pun */
      })

    return () => {
      batal = true
    }
  }, [])

  useEffect(() => {
    if (!tampil) return
    document.body.style.overflow = 'hidden'
    tombolRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') tutup()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [tampil, tutup])

  if (!tampil) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-forest"
      role="dialog"
      aria-modal="true"
      aria-label="Intro ITSA"
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src={SUMBER_VIDEO}
        autoPlay
        muted
        playsInline
        onEnded={tutup}
        onError={tutup}
      />
      <button
        ref={tombolRef}
        type="button"
        onClick={tutup}
        className="absolute bottom-8 right-6 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-forest transition-transform hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:bottom-10 sm:right-10"
      >
        Lewati
      </button>
    </div>
  )
}
