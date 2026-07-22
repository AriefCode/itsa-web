import Link from 'next/link'
import React from 'react'
import { CalendarDays, MapPin } from 'lucide-react'

import type { Event } from '@/payload-types'
import { Media } from '@/components/Media'
import { formatRentang, namaBulan, sudahSelesai } from '@/utilities/kegiatan'

/**
 * Timeline kegiatan: garis vertikal dengan titik per kegiatan, dikelompokkan
 * per bulan (DESIGN.md §4).
 *
 * Titik gold menandai kegiatan yang belum lewat, titik hijau muda untuk yang
 * sudah selesai, jadi keadaannya terbaca sekilas tanpa harus membaca badge.
 */
export const Timeline: React.FC<{ events: Event[] }> = ({ events }) => {
  if (events.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-forest-line px-6 py-12 text-center text-sm text-mist">
        Tidak ada kegiatan pada pilihan ini.
      </p>
    )
  }

  // Kelompokkan per bulan, urutan mengikuti urutan events yang masuk.
  const kelompok: { kunci: string; judul: string; items: Event[] }[] = []
  for (const e of events) {
    const d = new Date(e.tanggal_mulai)
    const kunci = `${d.getFullYear()}-${d.getMonth()}`
    const judul = `${namaBulan(d.getMonth())} ${d.getFullYear()}`
    const akhir = kelompok[kelompok.length - 1]
    if (akhir && akhir.kunci === kunci) akhir.items.push(e)
    else kelompok.push({ kunci, judul, items: [e] })
  }

  return (
    <div className="space-y-10">
      {kelompok.map((g) => (
        <section key={g.kunci} aria-label={g.judul}>
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-mist">
            {g.judul}
          </h2>

          {/* Garis timeline digambar sebagai border kiri pada daftar */}
          <ul className="mt-4 space-y-4 border-l border-forest-line pl-6">
            {g.items.map((e) => {
              const selesai = sudahSelesai(e)
              return (
                <li key={e.id} className="relative">
                  <span
                    aria-hidden
                    className={`absolute -left-[1.9rem] top-6 size-3 rounded-full ring-4 ring-forest ${
                      selesai ? 'bg-mist' : 'bg-gold'
                    }`}
                  />
                  <Link
                    href={`/kegiatan/${e.slug}`}
                    className="group grid gap-4 rounded-lg bg-cream p-4 text-forest transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold motion-reduce:hover:translate-y-0 sm:grid-cols-[12rem_1fr]"
                  >
                    {e.thumbnail && typeof e.thumbnail === 'object' && (
                      <Media
                        resource={e.thumbnail}
                        imgClassName="aspect-[16/10] w-full rounded object-cover"
                        htmlElement={null}
                      />
                    )}

                    <div className="flex flex-col">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            selesai
                              ? 'rounded bg-forest px-2 py-0.5 text-xs font-medium text-cream'
                              : 'rounded border border-olive px-2 py-0.5 text-xs font-medium text-olive'
                          }
                        >
                          {selesai ? 'Selesai' : 'Akan Datang'}
                        </span>
                        {e.gratis ? (
                          <span className="text-xs font-medium text-olive">Gratis</span>
                        ) : (
                          typeof e.htm === 'number' && (
                            <span className="rounded bg-gold px-2 py-0.5 text-xs font-semibold text-forest">
                              Rp{e.htm.toLocaleString('id-ID')}
                            </span>
                          )
                        )}
                        {e.divisi && typeof e.divisi === 'object' && (
                          <span className="text-xs text-olive">{e.divisi.nama}</span>
                        )}
                      </div>

                      <h3 className="mt-2 font-heading text-lg font-bold leading-snug">
                        {e.judul}
                      </h3>

                      <div className="mt-auto flex flex-wrap gap-x-5 gap-y-1.5 pt-3 text-sm text-olive">
                        <span className="flex items-center gap-2">
                          <CalendarDays className="size-4 shrink-0" aria-hidden />
                          {formatRentang(e.tanggal_mulai, e.tanggal_selesai)}
                        </span>
                        {e.lokasi && (
                          <span className="flex items-center gap-2">
                            <MapPin className="size-4 shrink-0" aria-hidden />
                            {e.lokasi}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
