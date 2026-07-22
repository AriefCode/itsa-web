import Link from 'next/link'
import React from 'react'
import { CalendarRange, Info, Shield, Users } from 'lucide-react'

import type { Pengurus } from '@/payload-types'
import { Media } from '@/components/Media'

/**
 * Mozaik foto pengurus sebagai gambar hero.
 *
 * Collection Pengurus tidak punya field "foto kabinet" bersama, jadi alih-alih
 * menyisipkan gambar contoh yang bukan milik ITSA, hero-nya disusun dari foto
 * pengurus yang memang sudah ada di database. Kalau kelak ada foto kabinet
 * resmi, ganti blok ini dengan satu <Media> saja.
 */
const Mozaik: React.FC<{ anggota: Pengurus[] }> = ({ anggota }) => {
  const berfoto = anggota.filter((p) => p.foto && typeof p.foto === 'object').slice(0, 8)
  if (berfoto.length < 4) return null

  return (
    <div aria-hidden className="relative">
      <div className="grid grid-cols-4 gap-2.5">
        {berfoto.map((p, i) => (
          <div
            key={p.id}
            // Baris kedua diturunkan sedikit supaya susunannya tidak terbaca
            // sebagai tabel yang kaku.
            className={`overflow-hidden rounded-xl ring-1 ring-cream/10 ${i % 2 === 1 ? 'mt-5' : ''}`}
          >
            <Media
              resource={p.foto!}
              imgClassName="aspect-[3/4] w-full object-cover"
              htmlElement={null}
            />
          </div>
        ))}
      </div>
      {/* Tepi bawah dilebur ke latar supaya mozaiknya menyatu, bukan terpotong
          mendadak seperti gambar yang salah ukur. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-forest to-transparent" />
    </div>
  )
}

const TOMBOL_DASAR =
  'inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 active:scale-[0.98] motion-reduce:active:scale-100'

export const HeroKabinet: React.FC<{
  anggota: Pengurus[]
  jumlahDivisi: number
  periodeAktif?: string
  periodeTersedia: string[]
}> = ({ anggota, jumlahDivisi, periodeAktif, periodeTersedia }) => (
  <header className="relative isolate overflow-hidden bg-forest">
    <div
      aria-hidden
      className="absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,var(--color-cream)_0px,var(--color-cream)_1px,transparent_1px,transparent_22px)]"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute -right-32 -top-40 -z-10 size-[30rem] rounded-full bg-forest-elevated/50"
    />

    <div className="container grid items-center gap-10 py-12 sm:py-14 lg:grid-cols-2 lg:gap-14">
      <div className="min-w-0">
        <p className="font-aksen text-xs font-medium uppercase tracking-[0.18em] text-gold">
          Kepengurusan ITSA
        </p>
        <h1 className="mt-3 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-cream sm:text-5xl">
          Kabinet
          {periodeAktif && <span className="block text-gold">{periodeAktif}</span>}
        </h1>
        <p className="mt-4 max-w-[44ch] leading-relaxed text-mist">
          Pengurus ITSA yang menjalankan program kerja himpunan, dikelompokkan per divisi.
        </p>

        <dl className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
          <div className="flex items-center gap-3">
            <Users className="size-6 shrink-0 text-gold" strokeWidth={1.75} aria-hidden />
            <div>
              <dd className="font-aksen text-2xl font-bold leading-none text-cream tabular-nums">
                {anggota.length}
              </dd>
              <dt className="mt-1 text-xs text-mist">Pengurus</dt>
            </div>
          </div>
          <div className="hidden h-10 w-px bg-forest-line sm:block" />
          <div className="flex items-center gap-3">
            <Shield className="size-6 shrink-0 text-gold" strokeWidth={1.75} aria-hidden />
            <div>
              <dd className="font-aksen text-2xl font-bold leading-none text-cream tabular-nums">
                {jumlahDivisi}
              </dd>
              <dt className="mt-1 text-xs text-mist">Divisi</dt>
            </div>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/about"
            className={`${TOMBOL_DASAR} bg-gold text-forest shadow-sm hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream`}
          >
            <Info className="size-4" aria-hidden />
            Tentang Kabinet
          </Link>
          <Link
            href="/kegiatan"
            className={`${TOMBOL_DASAR} border border-cream/35 text-cream hover:border-cream/70 hover:bg-cream/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold`}
          >
            <CalendarRange className="size-4" aria-hidden />
            Kegiatan Kabinet
          </Link>
        </div>

        {/* Pemilih periode tetap berupa tautan: tiap kabinet punya URL sendiri
            sehingga bisa dibagikan, dan datanya diambil ulang di server. */}
        {periodeTersedia.length > 1 && (
          <div className="mt-7 flex flex-wrap items-center gap-2" role="group" aria-label="Pilih periode">
            <span className="font-aksen text-[11px] uppercase tracking-[0.14em] text-mist">
              Periode
            </span>
            {periodeTersedia.map((per) => {
              const aktif = per === periodeAktif
              return (
                <Link
                  key={per}
                  href={`/kabinet?periode=${encodeURIComponent(per)}`}
                  aria-current={aktif ? 'true' : undefined}
                  className={`rounded-lg px-3 py-1.5 font-aksen text-xs font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                    aktif
                      ? 'bg-gold text-forest'
                      : 'border border-forest-line text-cream hover:bg-forest-elevated'
                  }`}
                >
                  {per}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <div className="hidden lg:block">
        <Mozaik anggota={anggota} />
      </div>
    </div>
  </header>
)
