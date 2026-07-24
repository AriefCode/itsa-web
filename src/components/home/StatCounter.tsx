'use client'

import React, { useEffect, useRef } from 'react'

import { ikonDari } from './ikon'

export type Statistik = {
  label: string
  nilai: number
  akhiran?: string | null
  sub?: string | null
  ikon?: string | null
  id?: string | null
}

/**
 * Band statistik dengan animasi angka naik (DESIGN.md §4).
 *
 * Latar cream memberi jeda terang di antara section hijau. Tiap kolom: ikon
 * kecil, angka besar, label tebal, lalu sub-keterangan. Kolom dipisah garis
 * vertikal tipis di layar lebar.
 *
 * Angka dianimasikan lewat requestAnimationFrame yang menulis langsung ke
 * textContent, bukan lewat state React. Menyimpan nilai per frame di state
 * akan merender ulang pohon komponen 60 kali per detik tanpa alasan.
 */
/**
 * Pemisah ribuan hanya dipakai mulai lima digit.
 *
 * Angka statistik himpunan hampir selalu di bawah seribu, sementara satu
 * kolom biasanya berisi TAHUN berdiri. Memformat semuanya membuat 2009
 * tampil sebagai "2.009", yang salah untuk sebuah tahun. Ambang lima digit
 * membuat tahun dan jumlah kecil tampil apa adanya, tanpa mengorbankan
 * keterbacaan angka yang memang besar.
 */
const formatAngka = (n: number) => (n >= 10000 ? n.toLocaleString('id-ID') : String(n))

const AngkaNaik: React.FC<{ nilai: number; akhiran?: string | null }> = ({ nilai, akhiran }) => {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const langsungTampilkan = () => {
      el.textContent = `${formatAngka(nilai)}${akhiran ?? ''}`
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
          el.textContent = `${formatAngka(Math.round(nilai * eased))}${akhiran ?? ''}`
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
  return <span ref={ref}>{`${formatAngka(nilai)}${akhiran ?? ''}`}</span>
}

export const StatCounter: React.FC<{ statistik: Statistik[] }> = ({ statistik }) => {
  const kosong = statistik.length === 0

  return (
    <section className="bg-cream text-forest" aria-labelledby="statistik-judul">
      <div className="container py-14 sm:py-16">
        <h2 id="statistik-judul" className="sr-only">
          ITSA dalam angka
        </h2>

        {kosong ? (
          <p className="text-center text-sm text-olive">
            Angka statistik belum diisi. Tambahkan lewat Pengaturan Situs di panel admin.
          </p>
        ) : (
          <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-olive/15">
            {statistik.map((s, i) => {
              const Ikon = ikonDari(s.ikon)
              return (
                <div key={s.id ?? i} className="lg:px-8 lg:first:pl-0 lg:last:pr-0">
                  <Ikon className="size-6 text-forest-field" aria-hidden strokeWidth={2} />
                  {/* Angka pakai font aksen mono (DESIGN.md §3): lebar tiap digit
                      sama, jadi angka tidak bergeser-geser selama animasi
                      count-up. */}
                  <dt className="mt-4 font-aksen text-4xl font-bold leading-none tabular-nums sm:text-5xl">
                    <AngkaNaik nilai={s.nilai} akhiran={s.akhiran} />
                  </dt>
                  <dd className="mt-3">
                    <span className="block font-heading text-sm font-bold text-forest">
                      {s.label}
                    </span>
                    {s.sub && (
                      <span className="mt-1 block text-xs leading-relaxed text-olive">{s.sub}</span>
                    )}
                  </dd>
                </div>
              )
            })}
          </dl>
        )}
      </div>
    </section>
  )
}
