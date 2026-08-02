import Link from 'next/link'
import React from 'react'
import { Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from 'lucide-react'

import { getCachedGlobal } from '@/utilities/getGlobals'
import { Logo } from '@/components/Logo/Logo'

/** Tautan navigasi bawaan selama global Footer masih kosong. */
const NAV_BAWAAN = [
  { label: 'Home', url: '/' },
  { label: 'About', url: '/about' },
  { label: 'Kegiatan', url: '/kegiatan' },
  { label: 'Kabinet', url: '/kabinet' },
  { label: 'News', url: '/posts' },
]

/** Tautan cepat bawaan selama kolom di admin masih kosong. */
const CEPAT_BAWAAN = [
  { label: 'Aspirasi', url: '/aspirasi' },
  { label: 'FAQ', url: '/faq' },
  { label: 'Kegiatan', url: '/kegiatan' },
]

/** Satu kolom daftar tautan di footer. */
const KolomTautan: React.FC<{ judul: string; items: { label: string; url: string }[] }> = ({
  judul,
  items,
}) => (
  <nav aria-label={judul}>
    <h2 className="font-heading text-sm font-bold text-cream">{judul}</h2>
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li key={`${judul}-${item.url}-${item.label}`}>
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
)

const petakan = (items?: { link?: { label?: string | null; url?: string | null; reference?: unknown } | null }[] | null) =>
  (items ?? [])
    .map(({ link }) => {
      const referensi = (link?.reference as { value?: { slug?: string } } | undefined)?.value
      const slug = typeof referensi === 'object' && referensi ? referensi.slug : null
      return { label: link?.label ?? '', url: link?.url || (slug ? `/${slug}` : '#') }
    })
    .filter((i) => i.label)

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()
  const settings = await getCachedGlobal('site-settings', 1)()

  const nav = petakan(footerData?.navItems)
  const cepat = petakan(footerData?.tautanCepat)
  const daftarNav = nav.length > 0 ? nav : NAV_BAWAAN
  const daftarCepat = cepat.length > 0 ? cepat : CEPAT_BAWAAN
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

  const kontak = footerData?.kontak
  const adaKontak = Boolean(kontak?.alamat || kontak?.email || kontak?.telepon)

  return (
    <footer className="mt-auto border-t border-forest-line bg-forest-deep text-cream">
      <div className="container grid gap-x-8 gap-y-10 py-12 sm:grid-cols-2 sm:py-14 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link
            href="/"
            className="inline-block rounded-lg text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            <Logo variant="lockup" />
          </Link>
          {footerData?.tentang && (
            <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-mist">
              {footerData.tentang}
            </p>
          )}

          {kanal.length > 0 && (
            <ul className="mt-5 flex gap-2">
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
          )}
        </div>

        <KolomTautan judul="Navigasi" items={daftarNav} />
        <KolomTautan judul="Tautan Cepat" items={daftarCepat} />

        <div>
          {adaKontak && (
            <>
              <h2 className="font-heading text-sm font-bold text-cream">Kontak</h2>
              <ul className="mt-3 space-y-2.5 text-sm text-mist">
                {kontak?.alamat && (
                  <li className="flex gap-2.5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                    <span className="max-w-[26ch] leading-relaxed">{kontak.alamat}</span>
                  </li>
                )}
                {kontak?.email && (
                  <li className="flex gap-2.5">
                    <Mail className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                    <a
                      href={`mailto:${kontak.email}`}
                      className="rounded break-all transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      {kontak.email}
                    </a>
                  </li>
                )}
                {kontak?.telepon && (
                  <li className="flex gap-2.5">
                    <Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                    <span>{kontak.telepon}</span>
                  </li>
                )}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-forest-line/60">
        <div className="container flex flex-col gap-1 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-mist">
            © {new Date().getFullYear()} Information Technology Student Association, Politeknik Caltex
            Riau.
          </p>
          <p className="text-xs text-mist/70">All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
