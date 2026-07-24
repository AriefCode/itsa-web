import Link from 'next/link'
import React from 'react'
import { ArrowRight, MessageSquareHeart } from 'lucide-react'

import type { Event, Faq } from '@/payload-types'
import { KartuKegiatanFoto } from './KartuKegiatanFoto'
import { Reveal } from '@/components/motion/Reveal'
import { AccordionFaq } from '@/components/faq/AccordionFaq'

/** Label kecil di atas judul section, dengan garis gold pendek (DESIGN.md §2). */
const Eyebrow: React.FC<{ children: React.ReactNode; terang?: boolean }> = ({
  children,
  terang = false,
}) => (
  <p
    className={`flex items-center gap-3 font-aksen text-xs uppercase tracking-[0.18em] ${terang ? 'text-mist' : 'text-olive'}`}
  >
    <span aria-hidden className="h-px w-8 bg-gold" />
    {children}
  </p>
)

/** Pesan saat data belum ada. Nadanya menjelaskan, bukan menyalahkan. */
const Kosong: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="rounded-lg border border-dashed border-forest-line px-6 py-10 text-center text-sm text-mist">
    {children}
  </p>
)

/**
 * Kegiatan mendatang (latar hijau): pengantar di atas, grid kartu foto-latar
 * dengan panah gold di bawahnya.
 */
export const KegiatanMendatang: React.FC<{ events: Event[] }> = ({ events }) => (
  <section className="bg-forest" aria-labelledby="kegiatan-mendatang">
    <div className="container py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow terang>Kegiatan Mendatang</Eyebrow>
          <h2
            id="kegiatan-mendatang"
            className="mt-4 max-w-[16ch] font-heading text-3xl font-bold leading-tight text-cream sm:text-4xl"
          >
            Jangan lewatkan kesempatan berikutnya.
          </h2>
        </div>
        <Link
          href="/kegiatan"
          className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-cream underline-offset-4 transition-colors hover:text-gold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Lihat Semua Kegiatan
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-10">
        {events.length === 0 ? (
          <Kosong>Belum ada kegiatan yang dijadwalkan. Nantikan pengumuman berikutnya.</Kosong>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e, i) => (
              <Reveal key={e.id} delay={i * 80}>
                <KartuKegiatanFoto event={e} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  </section>
)

/**
 * FAQ ringkas (latar cream): judul di kiri, accordion di kanan. Accordion
 * memakai varian terang agar terbaca di atas cream.
 */
export const FaqRingkas: React.FC<{ faq: Faq[] }> = ({ faq }) => (
  <section className="bg-cream text-forest" aria-labelledby="faq-ringkas">
    <div className="container grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-14">
      <div>
        <Eyebrow>Pertanyaan Umum</Eyebrow>
        <h2
          id="faq-ringkas"
          className="mt-4 max-w-[14ch] font-heading text-3xl font-bold leading-tight sm:text-4xl"
        >
          Ada yang ingin ditanyakan?
        </h2>
        <Link
          href="/faq"
          className="mt-6 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-forest underline-offset-4 transition-colors hover:text-olive hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          Lihat Semua Pertanyaan
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div>
        {faq.length === 0 ? (
          <p className="rounded-lg border border-dashed border-olive/30 px-6 py-10 text-center text-sm text-olive">
            Belum ada pertanyaan yang ditambahkan.
          </p>
        ) : (
          <AccordionFaq faq={faq} ringkas terang />
        )}
      </div>
    </div>
  </section>
)

/**
 * Ajakan mengirim aspirasi: banner hijau membulat di atas band cream, band
 * terakhir sebelum footer.
 */
export const CtaAspirasi: React.FC = () => (
  <section className="bg-cream">
    <div className="container pb-16 sm:pb-20">
      <div className="relative overflow-hidden rounded-2xl bg-forest px-6 py-10 text-cream sm:px-10 sm:py-12">
        {/* Cahaya lembut di sudut, memberi kedalaman tanpa gambar. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-forest-elevated/60 blur-3xl"
        />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-forest-elevated text-gold sm:inline-flex">
              <MessageSquareHeart className="size-6" aria-hidden />
            </span>
            <div>
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">
                Punya masukan untuk ITSA?
              </h2>
              <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-mist">
                Kirim aspirasi, saran, atau ide kamu untuk ITSA yang lebih baik lagi.
              </p>
            </div>
          </div>
          <Link
            href="/aspirasi"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-forest transition-transform hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
          >
            Kirim Aspirasi Sekarang
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  </section>
)
