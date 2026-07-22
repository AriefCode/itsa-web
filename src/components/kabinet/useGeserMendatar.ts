'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

/** Geseran dianggap seretan, bukan klik, setelah melewati jarak ini. */
const AMBANG_SERET = 5

/** Delta roda sebesar ini ke atas dianggap tetikus bernotch, bukan trackpad. */
const AMBANG_NOTCH = 40

/** Berapa lama snap tetap dimatikan setelah putaran roda terakhir. */
const JEDA_SNAP_MS = 140

/**
 * Guliran terprogram tidak otomatis menghormati prefers-reduced-motion —
 * berbeda dengan `scroll-behavior: smooth` di CSS, `behavior: 'smooth'` tetap
 * dianimasikan browser. Jadi setelannya diperiksa sendiri di sini.
 */
const perilakuGulir = (): ScrollBehavior =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'

type Opsi = {
  /**
   * Lacak kartu mana yang sedang di depan. Hanya perlu kalau pemakainya
   * menampilkan titik indikator — melacaknya berarti setState pada hampir
   * setiap kejadian gulir, dan itu me-render ulang seluruh pohon di atasnya.
   */
  lacakAktif?: boolean
}

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
 *
 * Ada tiga cara menggeser, karena satu cara saja selalu meninggalkan sebagian
 * pengguna: sentuhan (bawaan browser), roda mouse, dan seret dengan tetikus.
 */
export const useGeserMendatar = (jumlah: number, kunciMuat: unknown, opsi: Opsi = {}) => {
  const { lacakAktif = false } = opsi

  const trekRef = useRef<HTMLUListElement>(null)
  const [aktif, setAktif] = useState(0)
  const [bisaMundur, setBisaMundur] = useState(false)
  const [bisaMaju, setBisaMaju] = useState(false)
  const [sedangSeret, setSedangSeret] = useState(false)

  const seretRef = useRef({ turun: false, mulaiX: 0, mulaiScroll: 0, bergerak: false })
  const rafRef = useRef<number | null>(null)
  const jedaSnapRef = useRef<number | null>(null)

  /**
   * Snap dimatikan sementara selama gerakan berlangsung.
   *
   * `scroll-snap-type` melawan penggeseran bertahap: tiap kali scrollLeft
   * diubah sedikit, browser langsung menariknya balik ke titik snap terdekat,
   * dan hasilnya tersendat-sendat. Snap dihidupkan lagi begitu gerakannya
   * berhenti, supaya kartunya tetap berlabuh rapi di tepi.
   */
  const tundaSnap = useCallback(() => {
    const t = trekRef.current
    if (!t) return
    t.style.scrollSnapType = 'none'
    if (jedaSnapRef.current) window.clearTimeout(jedaSnapRef.current)
    jedaSnapRef.current = window.setTimeout(() => {
      t.style.scrollSnapType = ''
    }, JEDA_SNAP_MS)
  }, [])

  const hitung = useCallback(() => {
    const t = trekRef.current
    if (!t) return
    const sisa = t.scrollWidth - t.clientWidth
    setBisaMundur(t.scrollLeft > 8)
    setBisaMaju(t.scrollLeft < sisa - 8)

    if (!lacakAktif) return
    const kartu = t.children[0] as HTMLElement | undefined
    if (kartu) {
      const langkah = kartu.offsetWidth + 16
      setAktif(Math.min(jumlah - 1, Math.max(0, Math.round(t.scrollLeft / langkah))))
    }
  }, [jumlah, lacakAktif])

  /**
   * Kejadian gulir bisa datang lebih sering daripada frame yang digambar.
   * Tanpa penahan ini, satu kali menyeret memicu puluhan render React per
   * detik — dan tiap render menyusun ulang seluruh kartu di dalamnya, yang
   * justru jadi sumber tersendatnya.
   */
  const perbarui = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      hitung()
    })
  }, [hitung])

  useEffect(
    () => () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current)
      if (jedaSnapRef.current) window.clearTimeout(jedaSnapRef.current)
    },
    [],
  )

  useEffect(() => {
    const t = trekRef.current
    if (!t) return
    // Isi berganti: kembali ke awal lalu hitung ulang.
    t.scrollLeft = 0
    hitung()

    // Lebar kotaknya bisa berubah tanpa jendela ikut berubah (mis. panel
    // membuka atau kolom sidebar menyusut), jadi ukurannya diamati langsung.
    const pengamat = new ResizeObserver(perbarui)
    pengamat.observe(t)
    return () => pengamat.disconnect()
  }, [hitung, perbarui, kunciMuat])

  /**
   * Roda mouse tegak dialihkan jadi geseran mendatar.
   *
   * Hanya SELAMA trek masih bisa bergeser ke arah itu. Begitu mentok, kejadian
   * rodanya dibiarkan lewat sehingga halaman kembali menggulir seperti biasa —
   * tanpa itu, kursor yang kebetulan berhenti di atas trek akan mengunci
   * guliran halaman dan terasa seperti situs yang macet.
   *
   * Dipasang lewat addEventListener, bukan onWheel milik React, karena React
   * mendaftarkan wheel sebagai listener pasif sehingga preventDefault-nya
   * diabaikan browser.
   */
  useEffect(() => {
    const t = trekRef.current
    if (!t) return

    const padaRoda = (e: WheelEvent) => {
      // Trackpad yang memang sudah menggeser mendatar dibiarkan apa adanya.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return

      // deltaMode 1 berarti satuannya baris, bukan piksel.
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
      if (delta === 0) return

      const sisa = t.scrollWidth - t.clientWidth
      const masihBisa = delta > 0 ? t.scrollLeft < sisa - 1 : t.scrollLeft > 1
      if (!masihBisa) return

      e.preventDefault()
      tundaSnap()

      // Trackpad mengirim banyak delta kecil yang sudah mulus sendiri, jadi
      // digeser langsung. Tetikus bernotch mengirim satu lompatan besar per
      // klik roda; itu yang dianimasikan supaya tidak terasa mematah.
      if (Math.abs(delta) >= AMBANG_NOTCH) {
        t.scrollBy({ left: delta, behavior: perilakuGulir() })
      } else {
        t.scrollLeft += delta
      }
    }

    t.addEventListener('wheel', padaRoda, { passive: false })
    return () => t.removeEventListener('wheel', padaRoda)
  }, [tundaSnap])

  const bisaGeser = bisaMundur || bisaMaju

  const padaPointerTurun = (e: React.PointerEvent<HTMLUListElement>) => {
    // Sentuhan sudah punya guliran alami dari browser; ikut campur di sini
    // justru merusak inersianya.
    if (e.pointerType === 'touch' || !bisaGeser) return
    const t = trekRef.current
    if (!t) return
    seretRef.current = {
      turun: true,
      mulaiX: e.clientX,
      mulaiScroll: t.scrollLeft,
      bergerak: false,
    }
  }

  const padaPointerGerak = (e: React.PointerEvent<HTMLUListElement>) => {
    const s = seretRef.current
    const t = trekRef.current
    if (!s.turun || !t) return

    const jarak = e.clientX - s.mulaiX
    if (!s.bergerak) {
      if (Math.abs(jarak) < AMBANG_SERET) return
      s.bergerak = true
      setSedangSeret(true)
      // Snap dimatikan selama seluruh seretan, bukan lewat tundaSnap yang
      // berbasis waktu: seretan lambat bisa berhenti sejenak di tengah jalan,
      // dan snap yang hidup lagi di situ akan menyentak kartunya.
      t.style.scrollSnapType = 'none'
      // Ditangkap setelah ambang terlampaui, bukan saat tombol ditekan, supaya
      // klik biasa pada kartu tidak pernah ikut tertahan.
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    t.scrollLeft = s.mulaiScroll - jarak
  }

  const padaPointerLepas = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    // Snap dinyalakan lagi setelah seretan selesai; di sinilah kartunya
    // berlabuh mulus ke posisi terdekat.
    if (seretRef.current.bergerak && trekRef.current) {
      trekRef.current.style.scrollSnapType = ''
    }
    seretRef.current.turun = false
    setSedangSeret(false)
  }

  /**
   * Klik yang menutup sebuah seretan ditelan di fase tangkap.
   * Tanpa ini, melepas seretan di atas sebuah kartu ikut memilih divisi atau
   * membuka modal — padahal pengguna cuma bermaksud menggeser.
   */
  const padaKlikTangkap = (e: React.MouseEvent<HTMLUListElement>) => {
    if (!seretRef.current.bergerak) return
    e.preventDefault()
    e.stopPropagation()
    seretRef.current.bergerak = false
  }

  const geser = (arah: 1 | -1) => {
    const t = trekRef.current
    if (!t) return
    t.scrollBy({ left: arah * Math.round(t.clientWidth * 0.8), behavior: perilakuGulir() })
  }

  const keIndeks = (i: number) => {
    const t = trekRef.current
    const kartu = t?.children[i] as HTMLElement | undefined
    if (t && kartu)
      t.scrollTo({ left: kartu.offsetLeft - t.offsetLeft, behavior: perilakuGulir() })
  }

  /**
   * Semua yang perlu dipasang di elemen trek. Dikembalikan sebagai satu objek
   * supaya pemakainya tidak bisa lupa memasang salah satunya.
   */
  const propsTrek = {
    ref: trekRef,
    onScroll: perbarui,
    onPointerDown: padaPointerTurun,
    onPointerMove: padaPointerGerak,
    onPointerUp: padaPointerLepas,
    onPointerCancel: padaPointerLepas,
    onClickCapture: padaKlikTangkap,
    className: [
      TREK,
      bisaGeser ? 'cursor-grab' : '',
      // select-none hanya saat menyeret: di luar itu, teks di kartu tetap
      // bisa disorot dan disalin seperti biasa.
      sedangSeret ? 'cursor-grabbing select-none' : '',
    ]
      .filter(Boolean)
      .join(' '),
  }

  return { trekRef, propsTrek, aktif, bisaMundur, bisaMaju, geser, keIndeks }
}

/**
 * Kelas trek geser: scrollbar disembunyikan, snap aktif.
 *
 * SENGAJA tanpa `scroll-smooth`. Kalau `scroll-behavior: smooth` dipasang di
 * trek, setiap penetapan scrollLeft saat menyeret ikut dianimasikan — kartunya
 * jadi tertinggal di belakang kursor dan terasa seperti karet. Guliran yang
 * memang perlu halus (panah, titik indikator, roda bernotch) sudah meminta
 * `behavior: 'smooth'` sendiri, dan itu mengalahkan CSS.
 */
export const TREK =
  'flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

/** Kelas tombol panah geser. */
export const PANAH =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-forest-line bg-forest text-cream transition duration-200 hover:border-gold hover:bg-forest-elevated disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-forest-line disabled:hover:bg-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'
