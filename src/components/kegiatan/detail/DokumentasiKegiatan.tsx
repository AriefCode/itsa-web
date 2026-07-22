import React from 'react'
import { ArrowRight } from 'lucide-react'

import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import { KARTU_TERANG } from './gaya'

/**
 * Pratinjau dokumentasi kegiatan.
 *
 * Foto diambil dari media yang memang tersimpan di Payload. Selama collection
 * Events baru punya satu `thumbnail` (belum ada field galeri), yang tampil ya
 * satu foto itu — ditampilkan lebar, bukan dipalsukan jadi empat thumbnail
 * yang isinya sama. Begitu field galeri ditambahkan, kirim saja arraynya ke
 * prop `gambar` dan tata letak empat kolomnya langsung jalan.
 */
export const DokumentasiKegiatan: React.FC<{
  gambar: MediaType[]
  link?: string | null
}> = ({ gambar, link }) => {
  if (gambar.length === 0 && !link) return null

  const banyak = gambar.length > 1

  return (
    <section className={`${KARTU_TERANG} p-5 sm:p-7`} aria-labelledby="dokumentasi-kegiatan">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="dokumentasi-kegiatan" className="font-heading text-xl font-bold text-forest">
          Dokumentasi Kegiatan
        </h2>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-olive/30 px-4 py-1.5 text-xs font-medium text-olive transition-colors hover:border-olive hover:bg-olive/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            Lihat semua
            <ArrowRight className="size-3.5" aria-hidden />
            <span className="sr-only">dokumentasi di Google Drive (membuka tab baru)</span>
          </a>
        )}
      </div>

      {gambar.length > 0 && (
        <ul className={`mt-5 grid gap-3 ${banyak ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1'}`}>
          {gambar.slice(0, 4).map((foto) => (
            <li
              key={foto.id}
              className={`overflow-hidden rounded-xl bg-forest/5 ${banyak ? '' : 'sm:aspect-[16/7]'}`}
            >
              <Media
                resource={foto}
                imgClassName={`w-full object-cover transition-transform duration-500 hover:scale-105 motion-reduce:hover:scale-100 ${
                  banyak ? 'aspect-[4/3]' : 'aspect-[16/9] sm:aspect-[16/7]'
                }`}
                htmlElement={null}
              />
            </li>
          ))}
        </ul>
      )}

      {gambar.length === 0 && link && (
        <p className="mt-4 text-sm leading-relaxed text-olive">
          Foto dan video kegiatan tersimpan di Google Drive.
        </p>
      )}
    </section>
  )
}
