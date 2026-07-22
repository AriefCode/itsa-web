'use client'

import React from 'react'
import { Github, Instagram, Linkedin } from 'lucide-react'

import type { Pengurus } from '@/payload-types'
import { Media } from '@/components/Media'

export type Kanal = { nama: string; href: string; Icon: typeof Github }

/**
 * Tautan sosial yang benar-benar diisi untuk seorang pengurus.
 *
 * Dipakai bersama oleh kartu dan modal profil supaya keduanya tidak pernah
 * menampilkan daftar kanal yang berbeda.
 */
export const kanalSosial = (pengurus: Pengurus): Kanal[] => {
  const sosial = pengurus.sosial ?? {}
  return [
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
  ].filter(Boolean) as Kanal[]
}

/**
 * Kartu pengurus (DESIGN.md §4): foto rasio seragam, nama, jabatan, ikon
 * sosial. Kartu cream di atas latar hijau.
 *
 * Seluruh kartu bisa diklik untuk membuka profil lengkap. Ikon sosialnya
 * tetap tautan tersendiri, jadi klik pada ikon TIDAK ikut membuka modal —
 * itu sebabnya kartunya dibungkus <div>, bukan <button> yang membungkus
 * tautan (tombol di dalam tombol tidak sah di HTML dan bikin bingung
 * pembaca layar).
 */
const KartuPengurusDasar: React.FC<{
  pengurus: Pengurus
  onBuka: (pengurus: Pengurus) => void
  /** Urutan kemunculan; dipakai untuk menunda animasi masuk. */
  indeks?: number
}> = ({ pengurus, onBuka, indeks = 0 }) => {
  const kanal = kanalSosial(pengurus)

  return (
    <article
      className="kartu-masuk group flex h-full flex-col overflow-hidden rounded-2xl bg-cream text-forest shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg motion-reduce:hover:translate-y-0"
      // Jeda berantai: tiap kartu menyusul 70ms setelah kartu sebelumnya.
      // Dibatasi supaya divisi besar tidak membuat kartu terakhir menunggu
      // lama sampai terasa seperti halaman yang lambat.
      style={{ animationDelay: `${Math.min(indeks, 8) * 70}ms` }}
    >
      <button
        type="button"
        onClick={() => onBuka(pengurus)}
        className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <span className="sr-only">Lihat profil {pengurus.nama}</span>
        <span aria-hidden className="block overflow-hidden">
          {pengurus.foto && typeof pengurus.foto === 'object' ? (
            <Media
              resource={pengurus.foto}
              imgClassName="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
              htmlElement={null}
            />
          ) : (
            <span className="flex aspect-[3/4] w-full items-center justify-center bg-olive/15 text-sm text-olive">
              Tanpa foto
            </span>
          )}
        </span>

        <span aria-hidden className="block px-4 pt-4">
          <span className="block font-heading text-sm font-bold leading-snug">{pengurus.nama}</span>
          <span className="mt-0.5 block text-xs text-olive">{pengurus.jabatan}</span>
        </span>
      </button>

      <div className="mt-auto flex items-center justify-between gap-3 px-4 pb-4 pt-3">
        {pengurus.angkatan ? (
          <span className="font-aksen text-[11px] tracking-wide text-olive">
            {pengurus.angkatan}
          </span>
        ) : (
          <span />
        )}

        {kanal.length > 0 && (
          <ul className="flex gap-1">
            {kanal.map(({ nama, href, Icon }) => (
              <li key={nama}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-8 items-center justify-center rounded-lg text-olive transition-colors duration-200 hover:bg-olive/15 hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  <span className="sr-only">{nama}</span>
                  <Icon className="size-4" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

/**
 * Dibungkus memo karena kartunya duduk di dalam trek yang digulir: titik
 * indikator carousel berubah hampir tiap frame saat digeser, dan tanpa ini
 * setiap perubahan itu ikut menyusun ulang seluruh kartu beserta gambarnya.
 * `onBuka` yang dioper selalu setter useState, jadi identitasnya stabil dan
 * perbandingan dangkal memo memang berlaku.
 */
export const KartuPengurus = React.memo(KartuPengurusDasar)
