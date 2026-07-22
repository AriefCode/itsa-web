'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

import type { Header } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'

interface HeaderClientProps {
  data: Header
}

/** Menu bawaan, dipakai selama global Navbar di admin masih kosong. */
const MENU_BAWAAN = [
  { label: 'Home', url: '/' },
  { label: 'About', url: '/about' },
  { label: 'Kegiatan', url: '/kegiatan' },
  { label: 'Kabinet', url: '/kabinet' },
  { label: 'News', url: '/posts' },
]

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const pathname = usePathname()
  const [terbuka, setTerbuka] = useState(false)

  // Tutup menu mobile setiap pindah halaman, kalau tidak panelnya menggantung
  // menutupi halaman baru.
  useEffect(() => {
    setTerbuka(false)
  }, [pathname])

  // Kunci scroll latar selama panel mobile terbuka.
  useEffect(() => {
    document.body.style.overflow = terbuka ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [terbuka])

  const dariCms = (data?.navItems ?? [])
    .map(({ link }) => {
      // Link CMS bisa berupa URL langsung, atau referensi ke dokumen Pages/Posts.
      const referensi = link?.reference?.value
      const slug = typeof referensi === 'object' && referensi ? referensi.slug : null
      return {
        label: link?.label ?? '',
        url: link?.url || (slug ? `/${slug}` : '#'),
      }
    })
    .filter((i) => i.label)

  const menu = dariCms.length > 0 ? dariCms : MENU_BAWAAN
  const ctaLabel = data?.cta?.label ?? 'Aspirasi'
  const ctaUrl = data?.cta?.url ?? '/aspirasi'

  const aktif = (url: string) => (url === '/' ? pathname === '/' : pathname.startsWith(url))

  return (
    <header className="sticky top-0 z-40 border-b border-forest-line/60 bg-forest/95 backdrop-blur supports-[backdrop-filter]:bg-forest/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex shrink-0 rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          aria-label="ITSA, ke beranda"
        >
          <Logo priority />
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {menu.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              aria-current={aktif(item.url) ? 'page' : undefined}
              className="relative rounded-lg px-3 py-2 text-sm text-cream/85 transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {item.label}
              {/* Penanda aktif: garis gold tipis (DESIGN.md §2, gold sebagai isian) */}
              {aktif(item.url) && (
                <span
                  aria-hidden
                  className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {ctaLabel && (
            <Link
              href={ctaUrl}
              className="hidden rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-forest transition-transform hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream lg:inline-flex"
            >
              {ctaLabel}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setTerbuka((v) => !v)}
            aria-expanded={terbuka}
            aria-controls="menu-mobile"
            className="inline-flex items-center justify-center rounded-lg p-2 text-cream transition-colors hover:bg-forest-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:hidden"
          >
            <span className="sr-only">{terbuka ? 'Tutup menu' : 'Buka menu'}</span>
            {terbuka ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile: panel penuh di bawah navbar */}
      {terbuka && (
        <div
          id="menu-mobile"
          className="border-t border-forest-line/60 bg-forest lg:hidden"
        >
          <nav className="container flex flex-col py-2" aria-label="Navigasi utama">
            {menu.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                aria-current={aktif(item.url) ? 'page' : undefined}
                className="flex items-center justify-between rounded-lg px-2 py-3 text-base text-cream/90 transition-colors hover:bg-forest-elevated hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                {item.label}
                {aktif(item.url) && (
                  <span aria-hidden className="h-1.5 w-6 rounded-full bg-gold" />
                )}
              </Link>
            ))}
            {ctaLabel && (
              <Link
                href={ctaUrl}
                className="mt-2 mb-3 rounded-lg bg-gold px-4 py-3 text-center text-base font-semibold text-forest active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
              >
                {ctaLabel}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
