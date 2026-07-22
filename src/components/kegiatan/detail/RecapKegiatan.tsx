import React from 'react'

import { KARTU_TERANG } from './gaya'

/**
 * Recap kegiatan sebagai timeline berlangkah.
 *
 * Tiap paragraf recap jadi satu titik. Penomorannya dipakai sebagai ganti
 * ikon-per-tema: judul tiap langkah tidak ada di data (recap cuma satu field
 * rich text), jadi mengarang judul seperti "Materi" atau "Mentor" berarti
 * menaruh kata-kata yang tidak pernah ditulis pengurus.
 *
 * Di layar lebar titiknya berjajar mendatar dengan garis penghubung; di layar
 * sempit ia jatuh jadi susunan menurun dengan garis di sisi kiri.
 */
export const RecapKegiatan: React.FC<{ paragraf: string[] }> = ({ paragraf }) => {
  if (paragraf.length === 0) return null

  return (
    <section className={`${KARTU_TERANG} p-5 sm:p-7`} aria-labelledby="recap-kegiatan">
      <h2 id="recap-kegiatan" className="font-heading text-xl font-bold text-forest">
        Recap Kegiatan
      </h2>

      {/* Satu paragraf bukan timeline. Menomori langkah tunggal cuma
          menyisakan bulatan "01" yang menggantung tanpa memberi informasi,
          jadi recap sependek itu ditampilkan sebagai paragraf biasa. */}
      {paragraf.length === 1 ? (
        <p className="mt-4 max-w-[68ch] text-sm leading-relaxed text-olive">{paragraf[0]}</p>
      ) : (
        /* Flex, bukan grid: berapa pun jumlah paragrafnya semua tetap sebaris
           di layar lebar, jadi garis penghubungnya tidak pernah menggantung ke
           baris berikutnya. */
        <ol className="mt-6 flex flex-col gap-6 md:flex-row md:gap-6">
        {paragraf.map((teks, i) => {
          const terakhir = i === paragraf.length - 1
          return (
            <li key={i} className="relative flex-1 pl-14 md:pl-0">
              {/* Penghubung menurun untuk layar sempit. Ditarik sampai ke
                  dalam jarak antaritem supaya garisnya tersambung. */}
              {!terakhir && (
                <span
                  aria-hidden
                  className="absolute -bottom-6 left-[1.375rem] top-12 w-px bg-olive/25 md:hidden"
                />
              )}

              <div className="absolute left-0 top-0 md:relative md:mb-4 md:flex md:items-center">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-forest font-aksen text-sm font-bold text-gold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* Penghubung mendatar untuk layar lebar. */}
                {!terakhir && (
                  <span aria-hidden className="-mr-6 ml-3 hidden h-px flex-1 bg-olive/25 md:block" />
                )}
              </div>

              <p className="text-sm leading-relaxed text-olive md:pr-4">{teks}</p>
            </li>
          )
        })}
        </ol>
      )}
    </section>
  )
}
