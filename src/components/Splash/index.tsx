'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

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
 *
 * SOAL SUARA: video WAJIB mulai dalam keadaan bisu. Browser melarang video
 * bersuara diputar otomatis sebelum pengunjung berinteraksi dengan halaman;
 * kalau `muted` dilepas, videonya bukan jadi bersuara melainkan tidak jalan
 * sama sekali (terverifikasi: paused=true, currentTime=0). Karena itu suara
 * dinyalakan lewat tombol, dan menekan tombol itu sekaligus menjadi interaksi
 * yang dibutuhkan browser.
 */

const KUNCI_SESI = 'itsa-splash-sudah-tampil'
const SUMBER_VIDEO = '/splashItsa.mp4'
/** Jaring pengaman: overlay ditutup paksa kalau video macet tidak sampai selesai. */
const BATAS_TAMPIL_MS = 12000

export const Splash: React.FC = () => {
  // Mulai dari false supaya render server dan klien sama (tidak ada hydration
  // mismatch); baru diputuskan di efek setelah sessionStorage terbaca.
  const [tampil, setTampil] = useState(false)
  const [bisu, setBisu] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const tombolRef = useRef<HTMLButtonElement>(null)

  /**
   * Menyalakan atau membisukan suara.
   *
   * Video diputar ulang dari awal saat suara dinyalakan: klipnya hanya sekitar
   * 4 detik, jadi tanpa mengulang pengunjung cuma kebagian ekor audionya.
   * Mengulang dari nol membuat suara dan gambar tetap sinkron seperti yang
   * dimaksudkan pembuatnya.
   */
  const alihkanSuara = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    const jadiBisu = !bisu
    v.muted = jadiBisu
    setBisu(jadiBisu)
    if (!jadiBisu) {
      v.currentTime = 0
      // Klik pada tombol ini sudah menjadi interaksi pengguna, jadi pemutaran
      // bersuara diizinkan browser. Tetap ditangkap kalau-kalau ditolak.
      void v.play().catch(() => {})
    }
  }, [bisu])

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

    // Kalau video gagal diputar tanpa memicu error (mis. autoplay diblokir
    // browser), tidak ada yang pernah menutup overlay. Batas waktu ini
    // memastikan pengunjung tidak terkunci di layar splash.
    const pengaman = window.setTimeout(tutup, BATAS_TAMPIL_MS)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(pengaman)
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
        muted={bisu}
        playsInline
        onEnded={tutup}
        onError={tutup}
      />

      <div className="absolute bottom-8 right-6 flex items-center gap-2 sm:bottom-10 sm:right-10">
        <button
          type="button"
          onClick={alihkanSuara}
          aria-pressed={!bisu}
          className="inline-flex items-center gap-2 rounded-lg border border-cream/40 bg-forest/70 px-4 py-2.5 text-sm font-medium text-cream backdrop-blur transition-colors hover:bg-forest-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {bisu ? (
            <VolumeX className="size-4" aria-hidden />
          ) : (
            <Volume2 className="size-4" aria-hidden />
          )}
          {bisu ? 'Nyalakan suara' : 'Bisukan'}
        </button>

        <button
          ref={tombolRef}
          type="button"
          onClick={tutup}
          className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-forest transition-transform hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          Lewati
        </button>
      </div>
    </div>
  )
}
