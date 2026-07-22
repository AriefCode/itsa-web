import Link from 'next/link'
import React from 'react'
import { Instagram, Linkedin, Mail, Youtube } from 'lucide-react'

import { getCachedGlobal } from '@/utilities/getGlobals'
import { Logo } from '@/components/Logo/Logo'

/** Tautan navigasi bawaan selama global Footer masih kosong. */
const NAV_BAWAAN = [
  { label: 'Home', url: '/' },
  { label: 'About', url: '/about' },
  { label: 'Kegiatan', url: '/kegiatan' },
  { label: 'Kabinet', url: '/kabinet' },
  { label: 'News', url: '/posts' },
  { label: 'FAQ', url: '/faq' },
]

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()
  const settings = await getCachedGlobal('site-settings', 1)()

  const dariCms = (footerData?.navItems ?? [])
    .map(({ link }) => {
      const referensi = link?.reference?.value
      const slug = typeof referensi === 'object' && referensi ? referensi.slug : null
      return { label: link?.label ?? '', url: link?.url || (slug ? `/${slug}` : '#') }
    })
    .filter((i) => i.label)

  const nav = dariCms.length > 0 ? dariCms : NAV_BAWAAN
  const sosial = settings?.sosial ?? {}

  // Hanya kanal yang diisi yang tampil. Ikon dipetakan eksplisit supaya tidak
  // ada ikon salah pasang saat kanal baru ditambahkan nanti.
  const kanal = [
    sosial.instagram && {
      nama: 'Instagram',
      href: `https://instagram.com/${String(sosial.instagram).replace(/^@/, '')}`,
      Icon: Instagram,
    },
    sosial.youtube && { nama: 'YouTube', href: sosial.youtube, Icon: Youtube },
    sosial.linkedin && { nama: 'LinkedIn', href: sosial.linkedin, Icon: Linkedin },
    sosial.email && { nama: 'Email', href: `mailto:${sosial.email}`, Icon: Mail },
  ].filter(Boolean) as { nama: string; href: string; Icon: typeof Mail }[]

  const adaKontak = Boolean(footerData?.kontak?.alamat || footerData?.kontak?.email)

  return (
    <footer className="mt-auto border-t border-forest-line bg-forest-deep text-cream">
      <div className="container grid gap-x-8 gap-y-10 py-10 sm:grid-cols-2 sm:py-12 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link
            href="/"
            className="inline-block rounded-lg text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            <Logo variant="lockup" />
          </Link>
          {footerData?.tentang && (
            <p className="mt-4 max-w-[45ch] text-sm leading-relaxed text-mist">
              {footerData.tentang}
            </p>
          )}
        </div>

        <nav aria-labelledby="footer-navigasi">
          <h2 id="footer-navigasi" className="font-heading text-sm font-bold text-cream">
            Navigasi
          </h2>
          <ul className="mt-3 space-y-1.5">
            {nav.map((item) => (
              <li key={item.url}>
                <Link
                  href={item.url}
                  className="rounded text-sm text-mist transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          {/* Judul kolom hanya tampil kalau ada isinya, supaya tidak ada
              heading menggantung saat Kontak belum diisi di admin. */}
          {adaKontak && (
            <>
              <h2 className="font-heading text-sm font-bold text-cream">Kontak</h2>
              <div className="mt-3 space-y-1.5 text-sm text-mist">
                {footerData?.kontak?.alamat && (
                  <p className="max-w-[30ch] leading-relaxed">{footerData.kontak.alamat}</p>
                )}
                {footerData?.kontak?.email && (
                  <a
                    href={`mailto:${footerData.kontak.email}`}
                    className="block rounded transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    {footerData.kontak.email}
                  </a>
                )}
              </div>
            </>
          )}

          {kanal.length > 0 && (
            <>
              <h2
                className={`font-heading text-sm font-bold text-cream ${adaKontak ? 'mt-6' : ''}`}
              >
                Ikuti Kami
              </h2>
              <ul className="mt-3 flex gap-2">
                {kanal.map(({ nama, href, Icon }) => (
                  <li key={nama}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-forest-line text-mist transition-colors hover:border-gold hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      <span className="sr-only">{nama}</span>
                      <Icon className="size-4" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-forest-line/60">
        <div className="container py-5">
          <p className="text-xs text-mist">
            Information Technology Student Association, Politeknik Caltex Riau.
          </p>
        </div>
      </div>
    </footer>
  )
}
