import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import React from 'react'

// Tipografi — DESIGN.md §3. Heading: Plus Jakarta Sans (600–800),
// Body: Inter (400–500).
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { Splash } from '@/components/Splash'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html
      className={cn(inter.variable, jakarta.variable, GeistMono.variable)}
      lang="id"
      suppressHydrationWarning
    >
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          {/* Lompat ke konten: tersembunyi sampai difokus keyboard. Tanpa ini,
              pengguna keyboard dan pembaca layar harus menyusuri seluruh
              navbar di setiap halaman sebelum sampai ke isi. */}
          <a
            href="#konten"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-forest"
          >
            Lompat ke konten
          </a>

          <Splash />
          <Header />
          <div id="konten">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    default: 'ITSA - Information Technology Student Association',
    template: '%s',
  },
  description:
    'Himpunan mahasiswa Teknologi Informasi Politeknik Caltex Riau. Kegiatan, kabinet, berita, dan aspirasi.',
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
