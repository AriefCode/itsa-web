import React from 'react'
import { HeartHandshake, Lightbulb, ShieldCheck, Users } from 'lucide-react'

const NILAI = [
  { Ikon: Users, judul: 'Kolaboratif', teks: 'Tumbuh bersama lewat kerja sama dan kebersamaan.' },
  { Ikon: Lightbulb, judul: 'Inovatif', teks: 'Berani mencoba, belajar, dan menciptakan hal baru.' },
  { Ikon: ShieldCheck, judul: 'Berintegritas', teks: 'Jujur, bertanggung jawab, dan amanah dalam berkarya.' },
  { Ikon: HeartHandshake, judul: 'Peduli', teks: 'Hadir dan bermanfaat bagi sesama dan lingkungan.' },
]

/**
 * Motto ITSA (nyata, sama dengan footer) diikuti kartu nilai-nilai inti.
 */
export const NilaiInti: React.FC = () => (
  <section className="bg-forest-deep">
    <div className="container py-14 sm:py-16">
      <figure className="mx-auto max-w-3xl text-center">
        <blockquote className="font-heading text-2xl font-bold leading-snug text-cream sm:text-3xl">
          &ldquo;Mendengar untuk memahami, <span className="text-gold">memimpin untuk memberdayai.</span>&rdquo;
        </blockquote>
        <figcaption className="mt-3 font-aksen text-xs uppercase tracking-[0.16em] text-mist">
          Semangat ITSA
        </figcaption>
      </figure>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {NILAI.map(({ Ikon, judul, teks }) => (
          <div
            key={judul}
            className="rounded-2xl border border-forest-line bg-forest-elevated/40 p-6 text-center transition-colors hover:border-gold/40"
          >
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-forest text-gold ring-1 ring-gold/30">
              <Ikon className="size-6" aria-hidden />
            </span>
            <h3 className="mt-4 font-heading text-base font-bold text-cream">{judul}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-mist">{teks}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)
