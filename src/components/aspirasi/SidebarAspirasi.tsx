import React from 'react'
import { HeartHandshake, HelpCircle, ListOrdered } from 'lucide-react'

import type { Faq } from '@/payload-types'
import { AccordionFaq } from '@/components/faq/AccordionFaq'

/**
 * Empat langkah perjalanan sebuah aspirasi.
 *
 * Ini bukan hiasan: alurnya menjelaskan kenapa aspirasi yang baru dikirim
 * tidak langsung muncul di daftar. Tanpa penjelasan ini, pengirim mengira
 * kiriman mereka hilang.
 */
const LANGKAH = [
  { judul: 'Tulis', teks: 'Sampaikan masukanmu lewat form di atas, tanpa perlu identitas.' },
  { judul: 'Ditinjau', teks: 'Pengurus membaca dan meneruskannya ke divisi yang mengurus.' },
  { judul: 'Dipublikasikan', teks: 'Aspirasi yang layak dibagikan ditampilkan di halaman ini.' },
  { judul: 'Ditanggapi', teks: 'Pengurus menuliskan jawaban resminya di bawah aspirasi.' },
]

const KARTU = 'rounded-2xl border border-forest-line bg-forest p-5 text-cream'

export const SidebarAspirasi: React.FC<{ faq: Faq[] }> = ({ faq }) => (
  <aside className="space-y-5 lg:sticky lg:top-8">
    <section className={KARTU} aria-labelledby="cara-kerja-aspirasi">
      <h2
        id="cara-kerja-aspirasi"
        className="flex items-center gap-2 font-heading text-base font-bold"
      >
        <ListOrdered className="size-4 text-gold" aria-hidden />
        Cara Kerja Aspirasi
      </h2>

      <ol className="mt-5 space-y-4">
        {LANGKAH.map((l, i) => (
          <li key={l.judul} className="flex gap-3">
            <span
              aria-hidden
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-gold font-aksen text-xs font-bold text-forest"
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{l.judul}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-mist">{l.teks}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>

    {faq.length > 0 && (
      // Accordion-nya bergaya untuk latar hijau (teks cream), jadi kartunya
      // WAJIB berlatar forest. Ditaruh langsung di atas band cream, seluruh
      // pertanyaannya jadi cream-di-atas-cream alias tak terbaca.
      <section className={`${KARTU} p-4`} aria-labelledby="faq-aspirasi">
        <h2 id="faq-aspirasi" className="flex items-center gap-2 px-1 font-heading text-base font-bold">
          <HelpCircle className="size-4 text-gold" aria-hidden />
          Pertanyaan Umum
        </h2>
        <div className="mt-3">
          {/* Komponen accordion yang sama dengan halaman FAQ dan beranda —
              satu perilaku buka-tutup untuk seluruh situs. */}
          <AccordionFaq faq={faq} ringkas />
        </div>
      </section>
    )}

    <section className={KARTU} aria-labelledby="ikut-berkontribusi">
      <h2
        id="ikut-berkontribusi"
        className="flex items-center gap-2 font-heading text-base font-bold"
      >
        <HeartHandshake className="size-4 text-gold" aria-hidden />
        Ikut Berkontribusi
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-mist">
        Setiap aspirasi yang masuk dibaca pengurus. Masukan kecil pun membantu ITSA berbenah.
      </p>
      <a
        href="#tulis-aspirasi"
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-forest transition duration-200 hover:brightness-105 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
      >
        Tulis Aspirasi
      </a>
    </section>
  </aside>
)
