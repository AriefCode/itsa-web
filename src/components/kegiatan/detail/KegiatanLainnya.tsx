import Link from 'next/link'
import React from 'react'
import { ArrowRight, MapPin } from 'lucide-react'

import type { Event } from '@/payload-types'
import { Media } from '@/components/Media'
import { namaBulan, sudahSelesai } from '@/utilities/kegiatan'

const SINGKATAN_BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

/**
 * Kegiatan lain yang bisa dilihat setelah selesai membaca halaman ini.
 *
 * Kartunya mendatar dan gelap supaya jelas terbaca sebagai blok "keluar dari
 * halaman", berbeda dari kartu-kartu terang di badan artikel.
 */
export const KegiatanLainnya: React.FC<{ events: Event[] }> = ({ events }) => {
  if (events.length === 0) return null

  return (
    <section aria-labelledby="kegiatan-lainnya">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="kegiatan-lainnya" className="font-heading text-2xl font-bold text-forest">
          Kegiatan Lainnya
        </h2>
        <Link
          href="/kegiatan"
          className="inline-flex items-center gap-2 rounded-full border border-olive/30 px-4 py-2 text-xs font-medium text-olive transition-colors hover:border-olive hover:bg-olive/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          Lihat semua kegiatan
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      {/* Tiga kolom baru di lg. Di lebar tablet, tiga kartu mendatar bikin
          judulnya pecah jadi empat baris dan lokasinya terpotong. */}
      <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => {
          const mulai = new Date(e.tanggal_mulai)
          const selesai = sudahSelesai(e)
          return (
            // min-w-0: tanpa ini item grid memakai lebar isinya (min-width
            // auto), jadi judul panjang melebarkan kartu dan membuat seluruh
            // halaman bisa digeser mendatar di layar sempit.
            <li key={e.id} className="min-w-0">
              <Link
                href={`/kegiatan/${e.slug}`}
                className="group relative isolate flex h-full items-center gap-4 overflow-hidden rounded-2xl bg-forest p-4 text-cream transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold motion-reduce:hover:translate-y-0"
              >
                {e.thumbnail && typeof e.thumbnail === 'object' && (
                  <>
                    <Media
                      resource={e.thumbnail}
                      fill
                      pictureClassName="absolute inset-0 -z-20"
                      imgClassName="size-full object-cover"
                      htmlElement={null}
                    />
                    <span className="absolute inset-0 -z-10 bg-forest/85 transition-colors duration-300 group-hover:bg-forest/75" aria-hidden />
                  </>
                )}

                <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-cream font-aksen text-forest">
                  <span className="text-lg font-bold leading-none">
                    {String(mulai.getDate()).padStart(2, '0')}
                  </span>
                  <span className="mt-0.5 text-[11px] uppercase leading-none">
                    {SINGKATAN_BULAN[mulai.getMonth()]}
                  </span>
                  <span className="sr-only">{namaBulan(mulai.getMonth())}</span>
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={
                      selesai
                        ? 'inline-block rounded bg-cream/15 px-2 py-0.5 font-aksen text-[10px] font-medium uppercase tracking-wider text-cream'
                        : 'inline-block rounded bg-gold px-2 py-0.5 font-aksen text-[10px] font-bold uppercase tracking-wider text-forest'
                    }
                  >
                    {selesai ? 'Selesai' : 'Akan Datang'}
                  </span>
                  <span className="mt-1.5 block font-heading text-sm font-bold leading-snug">
                    {e.judul}
                  </span>
                  {e.lokasi && (
                    <span className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-mist">
                      <MapPin className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{e.lokasi}</span>
                    </span>
                  )}
                </span>

                <span
                  aria-hidden
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-cream/30 transition-colors group-hover:border-gold group-hover:bg-gold group-hover:text-forest"
                >
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
