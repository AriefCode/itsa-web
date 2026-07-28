import React from 'react'
import { Check, Compass, Flag } from 'lucide-react'

const MISI = [
  'Mewadahi dan menyalurkan minat, bakat, serta aspirasi mahasiswa Teknologi Informasi.',
  'Menumbuhkan budaya belajar, riset, dan prestasi di lingkungan mahasiswa.',
  'Mempererat kebersamaan dan solidaritas antar anggota.',
  'Menjalin kolaborasi dengan pihak internal maupun eksternal kampus.',
  'Memberikan kontribusi dan kepedulian nyata bagi masyarakat.',
]

/**
 * Visi & Misi ITSA.
 *
 * ISI MASIH PLACEHOLDER — teks ini perlu diselaraskan dengan AD/ART ITSA
 * yang sebenarnya. Ditandai lewat catatan kecil di bawah section.
 */
export const VisiMisi: React.FC = () => (
  <section className="bg-forest">
    <div className="container py-14 sm:py-16">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-forest-line bg-forest-elevated/50 p-8">
          <span className="inline-flex size-12 items-center justify-center rounded-full border border-gold/50 text-gold">
            <Compass className="size-6" aria-hidden />
          </span>
          <h2 className="mt-5 font-heading text-2xl font-bold text-cream">Visi</h2>
          <p className="mt-3 text-lg leading-relaxed text-mist">
            Menjadi himpunan mahasiswa Teknologi Informasi yang{' '}
            <span className="text-cream">solid, kolaboratif, dan berdampak nyata</span> bagi
            mahasiswa serta lingkungan.
          </p>
        </div>

        <div className="rounded-3xl border border-forest-line bg-forest-elevated/50 p-8">
          <span className="inline-flex size-12 items-center justify-center rounded-full border border-gold/50 text-gold">
            <Flag className="size-6" aria-hidden />
          </span>
          <h2 className="mt-5 font-heading text-2xl font-bold text-cream">Misi</h2>
          <ul className="mt-4 space-y-3">
            {MISI.map((m) => (
              <li key={m} className="flex gap-3 text-sm leading-relaxed text-mist">
                <Check className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 text-center font-aksen text-xs text-mist/70">
        Catatan: visi &amp; misi di atas masih placeholder — sesuaikan dengan AD/ART ITSA.
      </p>
    </div>
  </section>
)
