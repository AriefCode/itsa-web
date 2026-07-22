'use client'

import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

/**
 * Memunculkan isinya dengan fade dan naik sedikit saat masuk viewport
 * (DESIGN.md §5).
 *
 * Memakai IntersectionObserver, bukan pendengar event scroll: observer hanya
 * berjalan saat elemennya benar-benar melintas, sementara listener scroll
 * dipanggil di tiap frame dan bikin tersendat.
 *
 * Pengguna dengan prefers-reduced-motion langsung melihat isinya tanpa
 * animasi sama sekali.
 */
export const Reveal: React.FC<{
  children: React.ReactNode
  className?: string
  /** Jeda mulai, dalam milidetik. Untuk memunculkan beberapa item berurutan. */
  delay?: number
}> = ({ children, className, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [tampil, setTampil] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTampil(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTampil(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-reveal=""
      className={clsx(
        'motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out',
        tampil ? 'opacity-100 translate-y-0' : 'opacity-0 motion-safe:translate-y-4',
        className,
      )}
      style={tampil && delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
