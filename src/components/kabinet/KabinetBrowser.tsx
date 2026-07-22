'use client'

import React, { useDeferredValue, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, LayoutGrid, Rows3, Search, Users } from 'lucide-react'

import type { Divisi, Pengurus } from '@/payload-types'
import { Media } from '@/components/Media'
import { KartuPengurus } from './KartuPengurus'
import { KaruselAnggota } from './KaruselAnggota'
import { ModalPengurus } from './ModalPengurus'
import { PANAH, TREK, useGeserMendatar } from './useGeserMendatar'

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

/**
 * Penjelajah Kabinet.
 *
 * Prinsipnya progressive disclosure: yang langsung terlihat cuma daftar
 * divisi. Anggota baru muncul setelah sebuah divisi dipilih, dan hanya
 * anggota divisi itu. Halaman lama menampilkan seluruh pengurus semua divisi
 * sekaligus — untuk 26 orang itu sudah jadi dinding informasi, dan makin
 * bertambah tiap kabinet baru.
 *
 * Semua pergantian divisi terjadi di state, tanpa navigasi: posisi gulir
 * pengunjung tidak pernah berpindah dan tidak ada permintaan jaringan baru.
 */
export const KabinetBrowser: React.FC<{ kelompok: Kelompok[] }> = ({ kelompok }) => {
  const [idAktif, setIdAktif] = useState<number | string | null>(kelompok[0]?.divisi.id ?? null)
  const [cari, setCari] = useState('')
  const [tampilanGrid, setTampilanGrid] = useState(false)
  const [profil, setProfil] = useState<Pengurus | null>(null)

  const {
    trekRef: trekDivisi,
    bisaMundur: divisiBisaMundur,
    bisaMaju: divisiBisaMaju,
    perbarui: perbaruiDivisi,
    geser: geserDivisi,
  } = useGeserMendatar(kelompok.length, kelompok)

  // Pencarian tetap lancar walau daftarnya panjang: hasilnya boleh tertinggal
  // satu frame dari ketikan, kotak isiannya tidak.
  const kunci = useDeferredValue(cari).trim().toLowerCase()

  const aktif = kelompok.find((k) => k.divisi.id === idAktif) ?? kelompok[0]

  const hasilCari = useMemo(() => {
    if (!kunci) return []
    return kelompok.flatMap((k) => k.anggota).filter((p) => cocok(p, kunci))
  }, [kelompok, kunci])

  const sedangMencari = kunci.length > 0
  // Ketua divisi = urutan terkecil. Field `urutan` memang dipakai untuk itu
  // (lihat collections/Pengurus.ts), jadi tidak perlu field ketua terpisah.
  const ketua = aktif?.anggota[0] ?? null

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-cream">Pilih Departemen</h2>
          <p className="mt-1 text-sm text-mist">
            Klik salah satu divisi untuk melihat anggotanya.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72 sm:flex-none">
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

          {/* Panah hanya muncul kalau deretannya memang lebih panjang dari
              kotaknya — pada kabinet berdivisi sedikit, tombol yang selalu
              mati cuma jadi hiasan yang membingungkan. */}
          {(divisiBisaMundur || divisiBisaMaju) && (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => geserDivisi(-1)}
                disabled={!divisiBisaMundur}
                className={PANAH}
              >
                <span className="sr-only">Divisi sebelumnya</span>
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => geserDivisi(1)}
                disabled={!divisiBisaMaju}
                className={PANAH}
              >
                <span className="sr-only">Divisi berikutnya</span>
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Deretan divisi digeser mendatar di SEMUA ukuran layar, bukan berubah
          jadi grid di layar lebar. Grid enam kolom rapi selama divisinya pas
          enam; begitu himpunan menambah divisi ketujuh, barisnya pecah dan
          divisi baru itu terlempar ke bawah di luar pandangan. */}
      <ul ref={trekDivisi} onScroll={perbaruiDivisi} className={`${TREK} mt-7`}>
        {kelompok.map((k) => {
          const dipilih = !sedangMencari && k.divisi.id === aktif?.divisi.id
          return (
            <li
              key={k.divisi.id}
              className="w-[68%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-5rem)/6)]"
            >
              <button
                type="button"
                onClick={() => {
                  setIdAktif(k.divisi.id)
                  setCari('')
                }}
                aria-pressed={dipilih}
                className={`flex h-full w-full flex-col rounded-2xl border p-5 text-left transition duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:hover:translate-y-0 ${
                  dipilih
                    ? 'border-gold bg-forest-elevated shadow-lg'
                    : 'border-forest-line bg-forest hover:border-forest-field'
                }`}
              >
                <span
                  aria-hidden
                  className={`inline-flex size-12 items-center justify-center rounded-full font-aksen text-base font-bold transition-colors duration-200 ${
                    dipilih ? 'bg-gold text-forest' : 'bg-forest-elevated text-cream'
                  }`}
                >
                  {inisial(k.divisi.nama)}
                </span>

                <span className="mt-4 block font-heading text-sm font-bold text-cream">
                  {k.divisi.nama}
                </span>
                {k.divisi.deskripsi_singkat && (
                  <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-mist">
                    {k.divisi.deskripsi_singkat}
                  </span>
                )}

                <span className="mt-4 flex items-center gap-1.5 font-aksen text-[11px] uppercase tracking-wider text-mist">
                  <Users className="size-3.5 shrink-0" aria-hidden />
                  {k.anggota.length} pengurus
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {sedangMencari ? (
        <section className="mt-10" aria-live="polite">
          <h3 className="font-heading text-lg font-bold text-cream">
            {hasilCari.length} hasil untuk &ldquo;{cari.trim()}&rdquo;
          </h3>
          {hasilCari.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-forest-line px-6 py-12 text-center text-sm text-mist">
              Tidak ada pengurus yang cocok. Coba nama, jabatan, atau nama divisi lain.
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
          <section
            className="mt-10 grid gap-6 rounded-2xl border border-forest-line bg-forest-deep p-5 sm:p-7 lg:grid-cols-12"
            aria-labelledby="panel-divisi"
          >
            <div className="min-w-0 lg:col-span-4">
              <span
                aria-hidden
                className="inline-flex size-12 items-center justify-center rounded-full bg-gold font-aksen text-base font-bold text-forest"
              >
                {inisial(aktif.divisi.nama)}
              </span>
              <h3 id="panel-divisi" className="mt-4 font-heading text-2xl font-bold text-cream">
                {aktif.divisi.nama}
              </h3>
              {aktif.divisi.deskripsi_singkat && (
                <p className="mt-3 text-sm leading-relaxed text-mist">
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
                    {ketua.angkatan && (
                      <p className="font-aksen text-[11px] text-mist">Angkatan {ketua.angkatan}</p>
                    )}
                  </div>
                </div>
              )}

              <p className="mt-4 flex items-center gap-2 text-sm text-mist">
                <Users className="size-4 shrink-0 text-gold" aria-hidden />
                {aktif.anggota.length} pengurus di divisi ini
              </p>
            </div>

            <div className="min-w-0 lg:col-span-8">
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

              {/* key memaksa React memasang ulang isinya setiap divisi atau
                  tampilan berganti, sehingga animasi masuknya berjalan lagi
                  alih-alih hanya menukar isi kartu yang sudah tampil. */}
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
                    label={`Anggota divisi ${aktif.divisi.nama}`}
                  />
                )}
              </div>
            </div>
          </section>
        )
      )}

      <ModalPengurus pengurus={profil} onTutup={() => setProfil(null)} />
    </>
  )
}
