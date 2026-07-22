'use client'

import React, { useEffect, useRef } from 'react'

export type Statistik = {
  label: string
  nilai: number
  akhiran?: string | null
  id?: string | null
}

/**
 * Band statistik dengan animasi angka naik (DESIGN.md §4).
 *
 * Latar cream memberi jeda terang di antara section hijau, angka forest
 * berukuran besar, garis gold sebagai aksen.
 *
 * Angka dianimasikan lewat requestAnimationFrame yang menulis langsung ke
 * textContent, bukan lewat state React. Menyimpan nilai per frame di state
 * akan merender ulang pohon komponen 60 kali per detik tanpa alasan.
 */
const AngkaNaik: React.FC<{ nilai: number; akhiran?: string | null }> = ({ nilai, akhiran }) => {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const langsungTampilkan = () => {
      el.textContent = `${nilai.toLocaleString('id-ID')}${akhiran ?? ''}`
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      langsungTampilkan()
      return
    }

    let frame = 0
    let mulai: number | null = null
    const durasi = 1400

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        observer.disconnect()

        const jalan = (waktu: number) => {
          if (mulai === null) mulai = waktu
          const progres = Math.min((waktu - mulai) / durasi, 1)
          // easeOutCubic: cepat di awal lalu melambat, terasa lebih hidup
          const eased = 1 - Math.pow(1 - progres, 3)
          el.textContent = `${Math.round(nilai * eased).toLocaleString('id-ID')}${akhiran ?? ''}`
          if (progres < 1) frame = requestAnimationFrame(jalan)
        }
        frame = requestAnimationFrame(jalan)
      },
      { threshold: 0.4 },
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [nilai, akhiran])

  // Nilai awal ditulis di server supaya angkanya tetap ada kalau JS gagal.
  return <span ref={ref}>{`${nilai.toLocaleString('id-ID')}${akhiran ?? ''}`}</span>
}

export const StatCounter: React.FC<{ statistik: Statistik[] }> = ({ statistik }) => {
  const kosong = statistik.length === 0

  return (
    <section className="bg-cream text-forest" aria-labelledby="statistik-judul">
      <div className="container py-16 sm:py-20">
        <h2 id="statistik-judul" className="sr-only">
          ITSA dalam angka
        </h2>

        {kosong ? (
          <p className="text-center text-sm text-olive">
            Angka statistik belum diisi. Tambahkan lewat Pengaturan Situs di panel admin.
          </p>
        ) : (
          <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {statistik.map((s, i) => (
              <div key={s.id ?? i} className="border-t-2 border-gold pt-5">
                <dt className="font-heading text-4xl font-extrabold leading-none sm:text-5xl">
                  <AngkaNaik nilai={s.nilai} akhiran={s.akhiran} />
                </dt>
                <dd className="mt-2 text-sm text-olive">{s.label}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}
