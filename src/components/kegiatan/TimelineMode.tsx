'use client'

import React, { useMemo, useState } from 'react'
import { CalendarRange, ChevronDown } from 'lucide-react'

import type { Event } from '@/payload-types'
import { KartuKegiatanBaris } from './KartuKegiatanBaris'
import { KalenderKegiatan } from './KalenderKegiatan'
import { DaftarHari } from './DaftarHari'
import { hariTerpakai, kunciHari, namaBulan, sudahSelesai } from '@/utilities/kegiatan'

const PER_HALAMAN = 6

const labelTanggal = (kunci: string) => {
  const [y, m, d] = kunci.split('-').map(Number)
  return `${d} ${namaBulan(m - 1)} ${y}`
}

/**
 * Mode Timeline: perjalanan kegiatan sebagai garis vertikal per tahun di kiri
 * (kartu besar, bisa "muat lebih banyak"), dengan sidebar kalender + daftar
 * kegiatan hari terpilih di kanan. Kalender dan daftar memakai tanggal terpilih
 * yang sama dengan mode Kalender, jadi keduanya sinkron.
 */
export const TimelineMode: React.FC<{
  events: Event[]
  selected: string | null
  onSelect: (kunci: string) => void
  onLihatKalender: () => void
}> = ({ events, selected, onSelect, onLihatKalender }) => {
  const [tampil, setTampil] = useState(PER_HALAMAN)

  // Timeline dibaca dari yang terbaru ke lama.
  const urut = useMemo(
    () =>
      [...events].sort(
        (a, b) => new Date(b.tanggal_mulai).getTime() - new Date(a.tanggal_mulai).getTime(),
      ),
    [events],
  )

  const terlihat = urut.slice(0, tampil)

  // Kelompokkan yang terlihat per tahun.
  const kelompok = useMemo(() => {
    const out: { tahun: number; items: Event[] }[] = []
    for (const e of terlihat) {
      const tahun = new Date(e.tanggal_mulai).getFullYear()
      const akhir = out[out.length - 1]
      if (akhir && akhir.tahun === tahun) akhir.items.push(e)
      else out.push({ tahun, items: [e] })
    }
    return out
  }, [terlihat])

  const kegiatanHari = useMemo(
    () => (selected ? events.filter((e) => hariTerpakai(e).includes(selected)) : []),
    [events, selected],
  )
  const hariIni = kunciHari(new Date())

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10">
      <div>
        <h2 className="font-heading text-xl font-bold text-cream sm:text-2xl">Perjalanan Kegiatan</h2>

        {urut.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-forest-line px-6 py-12 text-center text-sm text-mist">
            Tidak ada kegiatan yang cocok dengan saringan ini.
          </p>
        ) : (
          <div className="relative mt-6">
            {/* Rel vertikal */}
            <span
              aria-hidden
              className="absolute bottom-2 left-[6px] top-2 w-px bg-forest-line"
            />
            <div className="space-y-8">
              {kelompok.map((g) => (
                <section key={g.tahun} aria-label={`Tahun ${g.tahun}`}>
                  <div className="relative mb-4 flex items-center gap-3 pl-8">
                    <span
                      aria-hidden
                      className="absolute left-0 size-3.5 rounded-full border-2 border-gold bg-forest"
                    />
                    <h3 className="font-heading text-lg font-extrabold text-gold">{g.tahun}</h3>
                  </div>
                  <ul className="space-y-4">
                    {g.items.map((e) => (
                      <li key={e.id} className="relative pl-8">
                        <span
                          aria-hidden
                          className={`absolute left-[3px] top-7 size-2 rounded-full ring-4 ring-forest ${
                            sudahSelesai(e) ? 'bg-mist' : 'bg-gold'
                          }`}
                        />
                        <KartuKegiatanBaris event={e} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        )}

        {tampil < urut.length && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setTampil((n) => n + PER_HALAMAN)}
              className="inline-flex items-center gap-2 rounded-lg border border-forest-line px-5 py-3 text-sm font-semibold text-cream transition-colors hover:border-gold hover:bg-forest-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Muat lebih banyak
              <ChevronDown className="size-4" aria-hidden />
            </button>
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-20 lg:h-fit">
        <div className="rounded-2xl border border-forest-line bg-forest-elevated/60 p-5">
          <h3 className="font-heading text-base font-bold text-cream">Kalender Kegiatan</h3>
          <div className="mt-4">
            <KalenderKegiatan events={events} value={selected} onSelect={onSelect} />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-forest-line bg-forest-elevated/60 p-5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-heading text-base font-bold text-cream">
              {selected === hariIni ? 'Kegiatan Hari Ini' : 'Kegiatan Terpilih'}
            </h3>
            {selected && <span className="font-aksen text-xs text-mist">{labelTanggal(selected)}</span>}
          </div>
          <div className="mt-4">
            <DaftarHari events={kegiatanHari} kosong="Tidak ada kegiatan pada tanggal ini." />
          </div>
          <button
            type="button"
            onClick={onLihatKalender}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-forest-line px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:border-gold hover:bg-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <CalendarRange className="size-4" aria-hidden />
            Lihat Kalender Lengkap
          </button>
        </div>
      </aside>
    </div>
  )
}
