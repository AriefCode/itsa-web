import React from 'react'

import type { Faq } from '@/payload-types'
import RichText from '@/components/RichText'
import { ambilTeks } from '@/utilities/lexicalText'

/**
 * Accordion FAQ, dipakai bersama oleh blok ringkas di beranda dan halaman
 * /faq lengkap.
 *
 * Memakai <details>/<summary> bawaan HTML, bukan komponen JavaScript: buka
 * tutupnya jalan tanpa JS, sudah benar untuk pembaca layar, dan bisa dicari
 * lewat Ctrl+F browser karena isinya tetap ada di DOM.
 */
export const AccordionFaq: React.FC<{ faq: Faq[]; ringkas?: boolean }> = ({
  faq,
  ringkas = false,
}) => (
  <div className="divide-y divide-forest-line rounded-lg border border-forest-line">
    {faq.map((f) => (
      <details key={f.id} className="group px-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-cream marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
          <span className="font-medium">{f.pertanyaan}</span>
          {/* Tanda buka/tutup digambar dari CSS: satu elemen, dua keadaan */}
          <span
            aria-hidden
            className="relative size-4 shrink-0 before:absolute before:left-0 before:top-1/2 before:h-0.5 before:w-4 before:-translate-y-1/2 before:bg-gold after:absolute after:left-1/2 after:top-0 after:h-4 after:w-0.5 after:-translate-x-1/2 after:bg-gold after:transition-transform group-open:after:rotate-90 group-open:after:opacity-0"
          />
        </summary>
        <div className="max-w-[75ch] pb-5 text-sm leading-relaxed text-mist">
          {ringkas ? (
            <RichTextPolos data={f.jawaban} />
          ) : (
            <RichText data={f.jawaban} enableGutter={false} enableProse={false} />
          )}
        </div>
      </details>
    ))}
  </div>
)

/** Versi teks polos untuk blok ringkas di beranda. */
const RichTextPolos: React.FC<{ data: Faq['jawaban'] }> = ({ data }) => (
  <p>{ambilTeks(data)}</p>
)
