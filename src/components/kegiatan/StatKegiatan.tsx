'use client'

import React, { useEffect, useRef } from 'react'
import { CalendarDays, Clock, CircleCheckBig, Users, type LucideIcon } from 'lucide-react'

export type StatItem = {
  ikon: 'total' | 'mendatang' | 'selesai' | 'divisi'
  nilai: number
  akhiran?: string
  label: string
  sub: string
}

const IKON: Record<StatItem['ikon'], LucideIcon> = {
  total: CalendarDays,
  mendatang: Clock,
  selesai: CircleCheckBig,
  divisi: Users,
}

/** Angka naik saat kartu masuk viewport; menulis langsung ke DOM, bukan state. */
const AngkaNaik: React.FC<{ nilai: number; akhiran?: string }> = ({ nilai, akhiran }) => {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const tulis = (n: number) => (el.textContent = `${n}${akhiran ?? ''}`)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tulis(nilai)
      return
    }
    let frame = 0
    let mulai: number | null = null
    const durasi = 1200
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        obs.disconnect()
        const jalan = (t: number) => {
          if (mulai === null) mulai = t
          const p = Math.min((t - mulai) / durasi, 1)
          tulis(Math.round(nilai * (1 - Math.pow(1 - p, 3))))
          if (p < 1) frame = requestAnimationFrame(jalan)
        }
        frame = requestAnimationFrame(jalan)
      },
      { threshold: 0.4 },
    )
    obs.observe(el)
    return () => {
      obs.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [nilai, akhiran])

  return <span ref={ref}>{`${nilai}${akhiran ?? ''}`}</span>
}

/**
 * Band statistik kegiatan, empat kartu gelap yang menaungi batas bawah hero.
 * Angkanya dihitung dari data nyata (lihat page.tsx), bukan angka tetap.
 */
export const StatKegiatan: React.FC<{ items: StatItem[] }> = ({ items }) => (
  <section aria-label="Statistik kegiatan" className="relative z-10 bg-forest">
    <div className="container -mt-8 grid gap-4 sm:grid-cols-2 lg:-mt-12 lg:grid-cols-4">
      {items.map((s) => {
        const Ikon = IKON[s.ikon]
        return (
          <div
            key={s.label}
            className="rounded-2xl border border-forest-line bg-forest-elevated/80 p-5 shadow-lg backdrop-blur-sm"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-gold/12 text-gold">
              <Ikon className="size-5" aria-hidden strokeWidth={2} />
            </span>
            <p className="mt-4 font-aksen text-3xl font-bold leading-none tabular-nums text-cream sm:text-4xl">
              <AngkaNaik nilai={s.nilai} akhiran={s.akhiran} />
            </p>
            <p className="mt-2 font-heading text-sm font-bold text-cream">{s.label}</p>
            <p className="text-xs text-mist">{s.sub}</p>
          </div>
        )
      })}
    </div>
  </section>
)
