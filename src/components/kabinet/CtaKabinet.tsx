import Link from 'next/link'
import React from 'react'
import { ArrowRight, UsersRound } from 'lucide-react'

/**
 * Ajakan di bawah halaman Kabinet: arahkan pengunjung mengirim aspirasi.
 */
export const CtaKabinet: React.FC = () => (
  <section className="container pb-16 sm:pb-20">
    <div className="relative overflow-hidden rounded-2xl border border-forest-line bg-forest-elevated/60 px-6 py-8 sm:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-6 size-40 opacity-40 [background-image:radial-gradient(var(--color-gold)_1px,transparent_1px)] [background-size:12px_12px]"
      />
      <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="hidden size-12 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold sm:inline-flex">
            <UsersRound className="size-6" aria-hidden />
          </span>
          <div>
            <h2 className="font-heading text-xl font-bold text-cream sm:text-2xl">
              Tertarik bergabung bersama kami?
            </h2>
            <p className="mt-1.5 max-w-[56ch] text-sm leading-relaxed text-mist">
              Mari jadi bagian dari ITSA dan wujudkan ide serta kontribusi terbaikmu.
            </p>
          </div>
        </div>
        <Link
          href="/aspirasi"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-forest transition-transform hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
        >
          Sampaikan Aspirasi
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  </section>
)
