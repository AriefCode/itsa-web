import Link from 'next/link'
import React from 'react'

import type { Event, Faq } from '@/payload-types'
import { KartuKegiatan } from './KartuKegiatan'
import { Reveal } from '@/components/motion/Reveal'
import { ambilTeks } from '@/utilities/lexicalText'

/** Judul section beserta tautan opsional ke halaman lengkapnya. */
const KepalaSeksi: React.FC<{ judul: string; tautan?: { label: string; href: string } }> = ({
  judul,
  tautan,
}) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <h2 className="font-heading text-2xl font-bold text-cream sm:text-3xl">{judul}</h2>
    {tautan && (
      <Link
        href={tautan.href}
        className="rounded text-sm text-mist underline-offset-4 transition-colors hover:text-cream hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        {tautan.label}
      </Link>
    )}
  </div>
)

/** Pesan saat data belum ada. Nadanya menjelaskan, bukan menyalahkan. */
const Kosong: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="rounded-lg border border-dashed border-forest-line px-6 py-10 text-center text-sm text-mist">
    {children}
  </p>
)

/** Kegiatan mendatang: grid kartu. */
export const KegiatanMendatang: React.FC<{ events: Event[] }> = ({ events }) => (
  <section className="bg-forest" aria-labelledby="kegiatan-mendatang">
    <div className="container py-16 sm:py-20">
      <span id="kegiatan-mendatang" className="sr-only">
        Kegiatan mendatang
      </span>
      <KepalaSeksi judul="Kegiatan Mendatang" tautan={{ label: 'Semua kegiatan', href: '/kegiatan' }} />

      <div className="mt-8">
        {events.length === 0 ? (
          <Kosong>Belum ada kegiatan yang dijadwalkan. Nantikan pengumuman berikutnya.</Kosong>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e, i) => (
              <Reveal key={e.id} delay={i * 80}>
                <KartuKegiatan event={e} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  </section>
)

/**
 * Recap terbaru: kegiatan paling akhir disorot sebagai kartu melebar
 * (gambar kiri, teks kanan), sisanya menyusul sebagai kartu biasa.
 * Susunannya sengaja berbeda dari grid Kegiatan Mendatang supaya halaman
 * tidak terasa berulang.
 */
export const RecapTerbaru: React.FC<{ events: Event[] }> = ({ events }) => {
  const [utama, ...sisanya] = events

  return (
    <section className="bg-forest-elevated" aria-labelledby="recap-terbaru">
      <div className="container py-16 sm:py-20">
        <span id="recap-terbaru" className="sr-only">
          Recap kegiatan terbaru
        </span>
        <KepalaSeksi judul="Recap Terbaru" tautan={{ label: 'Arsip kegiatan', href: '/kegiatan' }} />

        <div className="mt-8">
          {!utama ? (
            <Kosong>
              Belum ada kegiatan yang selesai. Recap muncul di sini setelah kegiatan berlangsung.
            </Kosong>
          ) : (
            <div className="space-y-6">
              {/* Recap terbaru disorot melebar; ini juga membuat susunannya
                  tetap rapi walau baru ada satu kegiatan selesai. */}
              <Reveal>
                <KartuKegiatan event={utama} selesai lebar />
              </Reveal>
              {sisanya.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  {sisanya.map((e, i) => (
                    <Reveal key={e.id} delay={(i + 1) * 80}>
                      <KartuKegiatan event={e} selesai />
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/** FAQ ringkas: accordion native <details>, tanpa JavaScript tambahan. */
export const FaqRingkas: React.FC<{ faq: Faq[] }> = ({ faq }) => (
  <section className="bg-forest" aria-labelledby="faq-ringkas">
    <div className="container py-16 sm:py-20">
      <span id="faq-ringkas" className="sr-only">
        Pertanyaan yang sering diajukan
      </span>
      <KepalaSeksi judul="Pertanyaan Umum" tautan={{ label: 'Semua pertanyaan', href: '/faq' }} />

      <div className="mt-8 max-w-[70ch]">
        {faq.length === 0 ? (
          <Kosong>Belum ada pertanyaan yang ditambahkan.</Kosong>
        ) : (
          <div className="divide-y divide-forest-line rounded-lg border border-forest-line">
            {faq.map((f) => (
              <details key={f.id} className="group px-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-cream marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
                  <span className="font-medium">{f.pertanyaan}</span>
                  {/* Tanda buka/tutup dari CSS, bukan ikon: satu elemen, dua keadaan */}
                  <span
                    aria-hidden
                    className="relative size-4 shrink-0 before:absolute before:left-0 before:top-1/2 before:h-0.5 before:w-4 before:-translate-y-1/2 before:bg-gold after:absolute after:left-1/2 after:top-0 after:h-4 after:w-0.5 after:-translate-x-1/2 after:bg-gold after:transition-transform group-open:after:rotate-90 group-open:after:opacity-0"
                  />
                </summary>
                <div className="pb-5 text-sm leading-relaxed text-mist">
                  <RichTextRingkas data={f.jawaban} />
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  </section>
)

/**
 * Menampilkan jawaban FAQ sebagai teks biasa.
 * Blok FAQ di beranda memang ringkas; format lengkap ada di halaman /faq.
 */
const RichTextRingkas: React.FC<{ data: Faq['jawaban'] }> = ({ data }) => (
  <p>{ambilTeks(data)}</p>
)

/** Ajakan mengirim aspirasi, band terakhir sebelum footer. */
export const CtaAspirasi: React.FC = () => (
  <section className="bg-cream text-forest">
    <div className="container flex flex-col items-start gap-6 py-16 sm:flex-row sm:items-center sm:justify-between sm:py-20">
      <div>
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">Punya masukan untuk ITSA?</h2>
        <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-olive">
          Kirim aspirasimu secara anonim. Pengurus membaca dan menanggapi setiap masukan yang
          masuk.
        </p>
      </div>
      <Link
        href="/aspirasi"
        className="shrink-0 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-forest transition-transform hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        Kirim Aspirasi
      </Link>
    </div>
  </section>
)
