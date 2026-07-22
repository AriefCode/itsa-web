import clsx from 'clsx'
import Image from 'next/image'
import React from 'react'

interface Props {
  className?: string
  /**
   * `mark` = emblem globe saja, untuk navbar (ruang vertikal sempit).
   * `lockup` = logo penuh termasuk "Politeknik Caltex Riau", untuk footer.
   */
  variant?: 'mark' | 'lockup'
  priority?: boolean
}

/**
 * Logo ITSA.
 *
 * Ditempel langsung tanpa alas: berkas PNG-nya sudah transparan.
 *
 * CATATAN untuk revisi akhir: berkas logo yang ada dirancang untuk latar
 * terang. Teks melingkar "Information Technology Student Association" berwarna
 * abu-abu dan wordmark "Politeknik Caltex Riau" biru tua, jadi keterbacaannya
 * menurun di atas hijau tua. Pemilik sudah tahu dan menunda ini ke revisi
 * terakhir. Solusinya nanti: versi logo terang/putih (DESIGN.md §8).
 */
export const Logo = ({ className, variant = 'mark', priority = false }: Props) => {
  if (variant === 'lockup') {
    return (
      <Image
        src="/logo-itsa.png"
        alt="ITSA, Information Technology Student Association, Politeknik Caltex Riau"
        width={1120}
        height={879}
        priority={priority}
        className={clsx('h-auto w-[150px]', className)}
      />
    )
  }

  return (
    <Image
      src="/logo-itsa-emblem.png"
      alt="ITSA"
      width={694}
      height={708}
      priority={priority}
      className={clsx('size-11 w-auto', className)}
    />
  )
}
