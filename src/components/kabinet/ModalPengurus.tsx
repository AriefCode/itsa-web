'use client'

import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

import type { Divisi, Pengurus } from '@/payload-types'
import { Media } from '@/components/Media'
import { kanalSosial } from './KartuPengurus'

/**
 * Profil pengurus dalam modal.
 *
 * Memakai <dialog> bawaan HTML, bukan div bertumpuk: fokus terkunci di dalam
 * modal, Esc menutupnya, dan sisa halaman otomatis tidak bisa diakses pembaca
 * layar — tiga hal yang harus ditulis tangan (dan sering salah) kalau memakai
 * div biasa.
 *
 * Backdrop-nya ditutup lewat pemeriksaan posisi klik: <dialog> memperlakukan
 * ::backdrop sebagai bagian dari dirinya sendiri, jadi klik di luar kotak
 * tetap terbaca sebagai klik pada dialog.
 */
export const ModalPengurus: React.FC<{
  pengurus: Pengurus | null
  onTutup: () => void
}> = ({ pengurus, onTutup }) => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (pengurus && !d.open) d.showModal()
    if (!pengurus && d.open) d.close()
  }, [pengurus])

  const divisi: Divisi | null =
    pengurus?.divisi && typeof pengurus.divisi === 'object' ? pengurus.divisi : null
  const kanal = pengurus ? kanalSosial(pengurus) : []

  return (
    <dialog
      ref={ref}
      onClose={onTutup}
      onClick={(e) => {
        const kotak = e.currentTarget.getBoundingClientRect()
        const diLuar =
          e.clientX < kotak.left ||
          e.clientX > kotak.right ||
          e.clientY < kotak.top ||
          e.clientY > kotak.bottom
        if (diLuar) onTutup()
      }}
      aria-labelledby="judul-profil"
      className="m-auto w-[min(46rem,calc(100vw-2rem))] rounded-2xl bg-cream p-0 text-forest shadow-2xl backdrop:bg-forest-deep/70 backdrop:backdrop-blur-sm"
    >
      {pengurus && (
        <div className="relative grid gap-0 sm:grid-cols-[15rem_1fr]">
          <button
            type="button"
            onClick={onTutup}
            className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-cream/90 text-forest transition-colors duration-200 hover:bg-olive/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            <span className="sr-only">Tutup profil</span>
            <X className="size-4" aria-hidden />
          </button>

          {pengurus.foto && typeof pengurus.foto === 'object' ? (
            <Media
              resource={pengurus.foto}
              imgClassName="h-full max-h-[22rem] w-full object-cover sm:max-h-none"
              htmlElement={null}
            />
          ) : (
            <div className="flex h-56 items-center justify-center bg-olive/15 text-sm text-olive sm:h-full">
              Tanpa foto
            </div>
          )}

          <div className="p-6 sm:p-7">
            {divisi && (
              <p className="font-aksen text-[11px] font-medium uppercase tracking-[0.16em] text-olive">
                {divisi.nama}
              </p>
            )}
            <h2 id="judul-profil" className="mt-2 font-heading text-2xl font-bold leading-tight">
              {pengurus.nama}
            </h2>
            <p className="mt-1 text-sm text-olive">{pengurus.jabatan}</p>

            <dl className="mt-6 space-y-3 border-t border-olive/20 pt-5 text-sm">
              {pengurus.angkatan && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-olive">Angkatan</dt>
                  <dd className="font-aksen">{pengurus.angkatan}</dd>
                </div>
              )}
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-olive">Periode</dt>
                <dd className="font-aksen">{pengurus.periode}</dd>
              </div>
              {divisi?.deskripsi_singkat && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-olive">Divisi</dt>
                  <dd className="leading-relaxed">{divisi.deskripsi_singkat}</dd>
                </div>
              )}
            </dl>

            {kanal.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {kanal.map(({ nama, href, Icon }) => (
                  <li key={nama}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex size-10 items-center justify-center rounded-xl border border-olive/25 text-olive transition-colors duration-200 hover:border-olive hover:bg-olive/10 hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
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
      )}
    </dialog>
  )
}
