import React from 'react'
import { PenLine } from 'lucide-react'

/**
 * Ilustrasi gelembung percakapan.
 *
 * Digambar sebagai SVG sebaris, bukan berkas gambar: bentuknya sederhana,
 * ikut warna tema lewat token, dan tidak menambah permintaan jaringan atau
 * aset yang harus ikut di-deploy.
 */
const Ilustrasi: React.FC = () => (
  <svg
    viewBox="0 0 240 180"
    fill="none"
    aria-hidden
    className="h-auto w-full max-w-[18rem] text-cream"
  >
    <rect x="70" y="14" width="150" height="86" rx="18" fill="currentColor" opacity="0.92" />
    <path d="M104 100l-4 26 30-26z" fill="currentColor" opacity="0.92" />
    <circle cx="126" cy="57" r="8" className="fill-forest" />
    <circle cx="152" cy="57" r="8" className="fill-forest" />
    <circle cx="178" cy="57" r="8" className="fill-forest" />
    <rect x="14" y="72" width="104" height="62" rx="16" fill="currentColor" opacity="0.45" />
    <path d="M40 134l2 20-22-20z" fill="currentColor" opacity="0.45" />
    <rect x="36" y="120" width="58" height="48" rx="14" fill="currentColor" opacity="0.28" />
    <circle cx="206" cy="132" r="12" className="stroke-gold" strokeWidth="3" />
    <path d="M201 132l4 4 7-8" className="stroke-gold" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

/**
 * Hero halaman Aspirasi.
 *
 * Tingginya dijaga sekitar 300px — cukup untuk memberi bobot, tidak sampai
 * mendorong form ke bawah lipatan. Tombolnya menuju anchor form di bawah,
 * jadi tetap bekerja walau JavaScript gagal dimuat.
 */
export const HeroAspirasi: React.FC = () => (
  <header className="relative isolate overflow-hidden bg-forest">
    {/* Pola diagonal halus supaya bidang hijau besar tidak terasa kosong.
        Digambar dengan gradien berulang, bukan gambar latar. */}
    <div
      aria-hidden
      className="absolute inset-0 -z-10 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,var(--color-cream)_0px,var(--color-cream)_1px,transparent_1px,transparent_22px)]"
    />
    <div
      aria-hidden
      className="pointer-events-none absolute -right-24 -top-28 -z-10 size-[26rem] rounded-full bg-forest-elevated/60 blur-[2px]"
    />

    <div className="container flex min-h-[18rem] items-center py-12 sm:py-14 lg:min-h-[20rem]">
      <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_auto]">
        <div>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-cream sm:text-5xl">
            Aspirasi ITSA
          </h1>
          <p className="mt-4 max-w-[46ch] leading-relaxed text-mist">
            Punya masukan, kritik, atau ide untuk ITSA? Sampaikan secara anonim kepada pengurus.
          </p>
          <a
            href="#tulis-aspirasi"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-forest shadow-sm transition duration-200 hover:brightness-105 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
          >
            <PenLine className="size-4" aria-hidden />
            Tulis Aspirasi
          </a>
        </div>

        <div className="hidden justify-self-end lg:block">
          <Ilustrasi />
        </div>
      </div>
    </div>
  </header>
)
