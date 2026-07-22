'use client'

import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { Event } from '@/payload-types'
import { formatRentang, hariTerpakai, kunciHari, namaBulan, sudahSelesai } from '@/utilities/kegiatan'

const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

/**
 * Kalender bulanan; tanggal yang ada kegiatannya ditandai titik gold
 * (DESIGN.md §4). Memilih tanggal menampilkan daftar kegiatan hari itu
 * di bawah kalender.
 *
 * Kegiatan multi-hari ditandai di setiap harinya, bukan hanya hari mulai.
 */
export const Kalender: React.FC<{ events: Event[] }> = ({ events }) => {
  const hariIni = new Date()

  /**
   * Bulan pembuka: bulan ini kalau memang ada kegiatannya. Kalau tidak, lompat
   * ke bulan berkegiatan terdekat, mengutamakan yang di depan. Tanpa ini
   * pengunjung sering disambut kalender kosong dan mengira tidak ada kegiatan
   * sama sekali.
   */
  const awal = useMemo(() => {
    const sekarang = new Date(hariIni.getFullYear(), hariIni.getMonth(), 1).getTime()
    const bulanan = events.map((e) => {
      const d = new Date(e.tanggal_mulai)
      return new Date(d.getFullYear(), d.getMonth(), 1).getTime()
    })
    if (bulanan.length === 0) return { tahun: hariIni.getFullYear(), bulan: hariIni.getMonth() }
    if (bulanan.includes(sekarang))
      return { tahun: hariIni.getFullYear(), bulan: hariIni.getMonth() }

    const kedepan = bulanan.filter((t) => t > sekarang).sort((a, b) => a - b)
    const target = kedepan[0] ?? bulanan.sort((a, b) => b - a)[0]
    const d = new Date(target)
    return { tahun: d.getFullYear(), bulan: d.getMonth() }
    // Sengaja hanya bergantung pada daftar kegiatan: bulan pembuka ditentukan
    // sekali, setelah itu navigasi sepenuhnya milik pengguna.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events])

  const [tahun, setTahun] = useState(awal.tahun)
  const [bulan, setBulan] = useState(awal.bulan)
  const [dipilih, setDipilih] = useState<string | null>(null)

  // Peta "tanggal -> kegiatan", dihitung ulang hanya saat daftar berubah.
  const peta = useMemo(() => {
    const m = new Map<string, Event[]>()
    for (const e of events) {
      for (const hari of hariTerpakai(e)) {
        const daftar = m.get(hari) ?? []
        daftar.push(e)
        m.set(hari, daftar)
      }
    }
    return m
  }, [events])

  const kotak = useMemo(() => {
    const pertama = new Date(tahun, bulan, 1)
    // getDay(): 0 = Minggu. Digeser supaya pekan dimulai Senin.
    const geser = (pertama.getDay() + 6) % 7
    const jumlahHari = new Date(tahun, bulan + 1, 0).getDate()
    const sel: (Date | null)[] = Array.from({ length: geser }, () => null)
    for (let d = 1; d <= jumlahHari; d++) sel.push(new Date(tahun, bulan, d))
    return sel
  }, [tahun, bulan])

  const pindah = (arah: number) => {
    const d = new Date(tahun, bulan + arah, 1)
    setTahun(d.getFullYear())
    setBulan(d.getMonth())
    setDipilih(null)
  }

  const kegiatanTerpilih = dipilih ? (peta.get(dipilih) ?? []) : []

  return (
    <div>
      <div className="rounded-lg border border-forest-line p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => pindah(-1)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-forest-line text-cream transition-colors hover:bg-forest-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <span className="sr-only">Bulan sebelumnya</span>
            <ChevronLeft className="size-4" aria-hidden />
          </button>

          <p aria-live="polite" className="font-heading text-base font-bold text-cream">
            {namaBulan(bulan)} {tahun}
          </p>

          <button
            type="button"
            onClick={() => pindah(1)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-forest-line text-cream transition-colors hover:bg-forest-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <span className="sr-only">Bulan berikutnya</span>
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs text-mist">
          {HARI.map((h) => (
            <div key={h} className="py-1">
              {h}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {kotak.map((tgl, i) => {
            if (!tgl) return <div key={`kosong-${i}`} />
            const kunci = kunciHari(tgl)
            const punya = peta.has(kunci)
            const iniHariIni = kunci === kunciHari(hariIni)
            const aktif = kunci === dipilih

            return (
              <button
                key={kunci}
                type="button"
                disabled={!punya}
                onClick={() => setDipilih(aktif ? null : kunci)}
                aria-pressed={aktif}
                aria-label={`${tgl.getDate()} ${namaBulan(bulan)} ${tahun}${punya ? `, ${peta.get(kunci)!.length} kegiatan` : ', tidak ada kegiatan'}`}
                className={[
                  // Tinggi tetap, bukan aspect-square: pada kontainer selebar
                  // halaman, sel persegi jadi setinggi ratusan piksel.
                  'relative flex h-14 flex-col items-center justify-center rounded text-sm transition-colors sm:h-16',
                  punya
                    ? 'cursor-pointer text-cream hover:bg-forest-elevated'
                    : 'cursor-default text-mist/40',
                  aktif ? 'bg-forest-elevated ring-1 ring-gold' : '',
                  iniHariIni && !aktif ? 'ring-1 ring-forest-line' : '',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                ].join(' ')}
              >
                {tgl.getDate()}
                {punya && (
                  <span aria-hidden className="mt-1 size-1.5 rounded-full bg-gold" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        {!dipilih ? (
          <p className="text-sm text-mist">
            Tanggal bertitik gold berarti ada kegiatan. Pilih tanggalnya untuk melihat detail.
          </p>
        ) : (
          <ul className="space-y-3">
            {kegiatanTerpilih.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/kegiatan/${e.slug}`}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-cream px-4 py-3 text-forest transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold motion-reduce:hover:translate-y-0"
                >
                  <span className="font-heading font-bold">{e.judul}</span>
                  <span className="text-sm text-olive">
                    {formatRentang(e.tanggal_mulai, e.tanggal_selesai)}
                  </span>
                  <span
                    className={
                      sudahSelesai(e)
                        ? 'rounded bg-forest px-2 py-0.5 text-xs text-cream'
                        : 'rounded border border-olive px-2 py-0.5 text-xs text-olive'
                    }
                  >
                    {sudahSelesai(e) ? 'Selesai' : 'Akan Datang'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
