import clsx from 'clsx'
import Image from 'next/image'
import React from 'react'

interface Props {
  className?: string
  /**
   * `mark` = emblem globe + wordmark teks, untuk navbar (ruang vertikal sempit).
   * `lockup` = logo penuh termasuk "Politeknik Caltex Riau", untuk footer.
   */
  variant?: 'mark' | 'lockup'
  priority?: boolean
}

/**
 * Logo ITSA.
 *
 * CATATAN PENTING soal keterbacaan: file logo yang ada dirancang untuk latar
 * TERANG. Teks melingkar "Information Technology Student Association" berwarna
 * abu-abu dan wordmark "Politeknik Caltex Riau" biru tua, jadi keduanya nyaris
 * hilang kalau ditaruh langsung di atas hijau tua.
 *
 * Solusinya mengikuti DESIGN.md §2: "Logo ditaruh di area cream/putih biar
 * kebaca bersih." Logo selalu dialasi chip cream, bukan ditempel langsung ke
 * latar hijau.
 *
 * Kalau nanti versi logo terang/putih tersedia (DESIGN.md §8 mencatat ini masih
 * perlu dibuat), chip cream-nya bisa dilepas dan logo terang dipakai langsung
 * di atas hijau.
 */
export const Logo = ({ className, variant = 'mark', priority = false }: Props) => {
  if (variant === 'lockup') {
    return (
      <span className={clsx('inline-flex rounded-lg bg-cream p-3', className)}>
        <Image
          src="/logo-itsa.png"
          alt="ITSA, Information Technology Student Association, Politeknik Caltex Riau"
          width={1120}
          height={879}
          priority={priority}
          className="h-auto w-[150px]"
        />
      </span>
    )
  }

  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-cream p-1">
        <Image
          src="/logo-itsa-emblem.png"
          alt=""
          width={694}
          height={708}
          priority={priority}
          className="size-8"
        />
      </span>
      <span className="font-heading text-xl font-extrabold leading-none tracking-tight text-current">
        ITSA
      </span>
    </span>
  )
}
