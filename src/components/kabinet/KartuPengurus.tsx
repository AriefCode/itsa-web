import React from 'react'
import { Github, Instagram, Linkedin } from 'lucide-react'

import type { Pengurus } from '@/payload-types'
import { Media } from '@/components/Media'

/**
 * Kartu pengurus (DESIGN.md §4): foto rasio seragam, nama, jabatan, ikon
 * sosial. Kartu cream di atas latar hijau.
 *
 * Kartunya bukan tautan: tidak ada halaman detail pengurus, jadi membuatnya
 * bisa diklik hanya akan menipu. Yang bisa diklik cuma ikon sosialnya.
 */
export const KartuPengurus: React.FC<{ pengurus: Pengurus }> = ({ pengurus }) => {
  const sosial = pengurus.sosial ?? {}

  const kanal = [
    sosial.instagram && {
      nama: `Instagram ${pengurus.nama}`,
      href: `https://instagram.com/${String(sosial.instagram).replace(/^@/, '')}`,
      Icon: Instagram,
    },
    sosial.linkedin && {
      nama: `LinkedIn ${pengurus.nama}`,
      href: String(sosial.linkedin),
      Icon: Linkedin,
    },
    sosial.github && {
      nama: `GitHub ${pengurus.nama}`,
      href: `https://github.com/${String(sosial.github).replace(/^@/, '')}`,
      Icon: Github,
    },
  ].filter(Boolean) as { nama: string; href: string; Icon: typeof Github }[]

  return (
    <article className="flex flex-col overflow-hidden rounded-lg bg-cream text-forest">
      {pengurus.foto && typeof pengurus.foto === 'object' ? (
        <Media
          resource={pengurus.foto}
          imgClassName="aspect-[3/4] w-full object-cover"
          htmlElement={null}
        />
      ) : (
        <div className="flex aspect-[3/4] w-full items-center justify-center bg-olive/15 text-sm text-olive">
          Tanpa foto
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-base font-bold leading-snug">{pengurus.nama}</h3>
        <p className="mt-1 text-sm text-olive">{pengurus.jabatan}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          {pengurus.angkatan ? (
            <span className="text-xs text-olive">Angkatan {pengurus.angkatan}</span>
          ) : (
            <span />
          )}

          {kanal.length > 0 && (
            <ul className="flex gap-1.5">
              {kanal.map(({ nama, href, Icon }) => (
                <li key={nama}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-8 items-center justify-center rounded text-olive transition-colors hover:bg-olive/15 hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                  >
                    <span className="sr-only">{nama}</span>
                    <Icon className="size-4" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  )
}
