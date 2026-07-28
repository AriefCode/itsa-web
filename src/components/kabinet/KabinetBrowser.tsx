'use client'

import React, { useDeferredValue, useMemo, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, LayoutGrid, Rows3, Search, Users } from 'lucide-react'

import type { Divisi, Pengurus } from '@/payload-types'
import { Media } from '@/components/Media'
import { KartuPengurus } from './KartuPengurus'
import { KaruselAnggota } from './KaruselAnggota'
import { ModalPengurus } from './ModalPengurus'
import { PANAH, useGeserMendatar } from './useGeserMendatar'

export type Kelompok = { divisi: Divisi; anggota: Pengurus[] }

/**
 * Inisial divisi untuk lencana bundar.
 *
 * Nama dua kata diambil huruf awal tiap katanya ("Pengurus Inti" -> "PI");
 * nama satu kata diambil dua huruf pertamanya ("Ristek" -> "RI").
 */
const inisial = (nama: string) => {
  const kata = nama.trim().split(/\s+/)
  return (kata.length > 1 ? kata[0][0] + kata[1][0] : nama.slice(0, 2)).toUpperCase()
}

const cocok = (p: Pengurus, kunci: string) => {
  const divisi = p.divisi && typeof p.divisi === 'object' ? p.divisi.nama : ''
  return `${p.nama} ${p.jabatan} ${divisi}`.toLowerCase().includes(kunci)
}

const fotoGrup = (d: Divisi) =>
  d.foto_grup && typeof d.foto_grup === 'object' ? d.foto_grup : null

/**
 * Penjelajah Kabinet.
 *
 * Progressive disclosure: satu departemen "disorot" di kartu besar (info +
 * foto grup + deretan anggota), sementara strip "Sekilas Departemen" di bawah
 * memudahkan berpindah departemen. Semua pergantian terjadi di state, tanpa
 * navigasi — posisi gulir tidak berpindah dan tidak ada permintaan jaringan.
 */
export const KabinetBrowser: React.FC<{ kelompok: Kelompok[] }> = ({ kelompok }) => {
  const [idAktif, setIdAktif] = useState<number | string>(kelompok[0]?.divisi.id)
  const [cari, setCari] = useState('')
  const [tampilanGrid, setTampilanGrid] = useState(false)
  const [profil, setProfil] = useState<Pengurus | null>(null)
  const sorotRef = useRef<HTMLDivElement>(null)

  const {
    propsTrek: propsTrekStrip,
    bisaMundur: stripBisaMundur,
    bisaMaju: stripBisaMaju,
    geser: geserStrip,
  } = useGeserMendatar(kelompok.length, kelompok)

  // Pencarian tetap lancar walau daftarnya panjang.
  const kunci = useDeferredValue(cari).trim().toLowerCase()
  const sedangMencari = kunci.length > 0

  const indeksAktif = Math.max(
    0,
    kelompok.findIndex((k) => k.divisi.id === idAktif),
  )
  const aktif = kelompok[indeksAktif] ?? kelompok[0]

  const pilih = (id: number | string) => {
    setIdAktif(id)
    setTampilanGrid(false)
  }

  const geserDepartemen = (arah: number) => {
    const n = kelompok.length
    const next = kelompok[(indeksAktif + arah + n) % n]
    if (next) pilih(next.divisi.id)
  }

  const hasilCari = useMemo(() => {
    if (!kunci) return []
    return kelompok.flatMap((k) => k.anggota).filter((p) => cocok(p, kunci))
  }, [kelompok, kunci])

  // Ketua divisi = urutan terkecil (lihat collections/Pengurus.ts).
  const ketua = aktif?.anggota[0] ?? null
  const grup = aktif ? fotoGrup(aktif.divisi) : null

  return (
    <>
      {/* Header + pencarian */}
      <div id="departemen" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-cream">Pilih Departemen</h2>
          <p className="mt-1 text-sm text-mist">Klik salah satu departemen untuk melihat anggotanya.</p>
        </div>

        <div className="relative sm:w-72">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mist"
          />
          <label htmlFor="cari-pengurus" className="sr-only">
            Cari pengurus berdasarkan nama, jabatan, atau divisi
          </label>
          <input
            id="cari-pengurus"
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari nama, jabatan, divisi..."
            className="w-full rounded-xl border border-forest-field bg-forest-elevated py-2.5 pl-10 pr-3.5 text-sm text-cream transition-colors duration-200 placeholder:text-mist/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          />
        </div>
      </div>

      {sedangMencari ? (
        <section className="mt-8" aria-live="polite">
          <h3 className="font-heading text-lg font-bold text-cream">
            {hasilCari.length} hasil untuk &ldquo;{cari.trim()}&rdquo;
          </h3>
          {hasilCari.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-forest-line px-6 py-12 text-center text-sm text-mist">
              Tidak ada pengurus yang cocok. Coba nama, jabatan, atau nama departemen lain.
            </p>
          ) : (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {hasilCari.map((p, i) => (
                <li key={p.id}>
                  <KartuPengurus pengurus={p} onBuka={setProfil} indeks={i} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        aktif && (
          <>
            {/* Kartu sorotan departemen */}
            <section
              ref={sorotRef}
              className="mt-7 scroll-mt-24 overflow-hidden rounded-3xl border border-forest-line bg-forest-deep"
              aria-labelledby="sorot-divisi"
            >
              <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="order-2 p-6 sm:p-8 lg:order-1">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      aria-hidden
                      className="inline-flex size-12 items-center justify-center rounded-full bg-gold font-aksen text-base font-bold text-forest"
                    >
                      {inisial(aktif.divisi.nama)}
                    </span>
                    {kelompok.length > 1 && (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => geserDepartemen(-1)} className={PANAH}>
                          <span className="sr-only">Departemen sebelumnya</span>
                          <ChevronLeft className="size-4" aria-hidden />
                        </button>
                        <button type="button" onClick={() => geserDepartemen(1)} className={PANAH}>
                          <span className="sr-only">Departemen berikutnya</span>
                          <ChevronRight className="size-4" aria-hidden />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 id="sorot-divisi" className="mt-4 font-heading text-2xl font-bold text-cream">
                    {aktif.divisi.nama}
                  </h3>
                  {aktif.divisi.deskripsi_singkat && (
                    <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-mist">
                      {aktif.divisi.deskripsi_singkat}
                    </p>
                  )}

                  {ketua && (
                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-forest-line bg-forest p-3">
                      {ketua.foto && typeof ketua.foto === 'object' && (
                        <Media
                          resource={ketua.foto}
                          imgClassName="size-12 shrink-0 rounded-lg object-cover"
                          htmlElement={null}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-aksen text-[11px] uppercase tracking-[0.14em] text-mist">
                          {ketua.jabatan}
                        </p>
                        <p className="mt-0.5 truncate font-heading text-sm font-bold text-cream">
                          {ketua.nama}
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="mt-4 flex items-center gap-2 text-sm text-mist">
                    <Users className="size-4 shrink-0 text-gold" aria-hidden />
                    {aktif.anggota.length} pengurus di departemen ini
                  </p>
                </div>

                <div className="relative order-1 min-h-[14rem] lg:order-2 lg:min-h-full">
                  {grup ? (
                    <Media
                      resource={grup}
                      imgClassName="absolute inset-0 h-full w-full object-cover"
                      htmlElement={null}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-forest-elevated" />
                  )}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/20 to-transparent lg:bg-gradient-to-l"
                  />
                </div>
              </div>

              {/* Deretan anggota */}
              <div className="border-t border-forest-line p-5 sm:p-7">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <p className="font-heading text-base font-bold text-cream">Anggota</p>
                  <button
                    type="button"
                    onClick={() => setTampilanGrid((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-lg border border-forest-line px-3 py-1.5 text-xs text-cream transition-colors duration-200 hover:bg-forest-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    {tampilanGrid ? (
                      <>
                        <Rows3 className="size-3.5" aria-hidden />
                        Tampilkan carousel
                      </>
                    ) : (
                      <>
                        <LayoutGrid className="size-3.5" aria-hidden />
                        Lihat semua
                      </>
                    )}
                  </button>
                </div>

                {/* key memaksa remount tiap divisi/tampilan berganti supaya
                    animasi masuknya berjalan lagi. */}
                <div key={`${aktif.divisi.id}-${tampilanGrid}`}>
                  {tampilanGrid ? (
                    <ul className="grid gap-4 sm:grid-cols-3 xl:grid-cols-4">
                      {aktif.anggota.map((p, i) => (
                        <li key={p.id}>
                          <KartuPengurus pengurus={p} onBuka={setProfil} indeks={i} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <KaruselAnggota
                      anggota={aktif.anggota}
                      onBuka={setProfil}
                      label={`Anggota departemen ${aktif.divisi.nama}`}
                    />
                  )}
                </div>
              </div>
            </section>

            {/* Sekilas Departemen */}
            <section className="mt-12" aria-label="Sekilas semua departemen">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-heading text-xl font-bold text-cream sm:text-2xl">
                  Sekilas Departemen
                  <span aria-hidden className="mt-2 block h-1 w-12 rounded-full bg-gold" />
                </h3>
                {(stripBisaMundur || stripBisaMaju) && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => geserStrip(-1)}
                      disabled={!stripBisaMundur}
                      className={PANAH}
                    >
                      <span className="sr-only">Geser kiri</span>
                      <ChevronLeft className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => geserStrip(1)}
                      disabled={!stripBisaMaju}
                      className={PANAH}
                    >
                      <span className="sr-only">Geser kanan</span>
                      <ChevronRight className="size-4" aria-hidden />
                    </button>
                  </div>
                )}
              </div>

              <ul {...propsTrekStrip} className={`${propsTrekStrip.className} mt-6`}>
                {kelompok.map((k) => {
                  const dipilih = k.divisi.id === aktif.divisi.id
                  const g = fotoGrup(k.divisi)
                  return (
                    <li
                      key={k.divisi.id}
                      className="w-[17rem] shrink-0 snap-start sm:w-[20rem]"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          pilih(k.divisi.id)
                          sorotRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }}
                        aria-pressed={dipilih}
                        className={`group relative block aspect-[3/2] w-full overflow-hidden rounded-2xl border text-left transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                          dipilih ? 'border-gold ring-2 ring-gold/40' : 'border-forest-line hover:border-forest-field'
                        }`}
                      >
                        {g ? (
                          <Media
                            resource={g}
                            imgClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                            htmlElement={null}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-forest-elevated" />
                        )}
                        <div
                          aria-hidden
                          className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/50 to-transparent"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <p className="font-heading text-sm font-bold leading-tight text-cream drop-shadow sm:text-base">
                            {k.divisi.nama}
                          </p>
                          <span className="mt-1.5 inline-flex items-center gap-1.5 font-aksen text-[11px] uppercase tracking-wider text-cream/80">
                            <Users className="size-3.5 shrink-0" aria-hidden />
                            {k.anggota.length} pengurus
                          </span>
                        </div>
                        {dipilih && (
                          <span className="absolute right-3 top-3 rounded-full bg-gold px-2 py-0.5 font-aksen text-[10px] font-bold uppercase tracking-wider text-forest">
                            Aktif
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          </>
        )
      )}

      <ModalPengurus pengurus={profil} onTutup={() => setProfil(null)} />
    </>
  )
}
