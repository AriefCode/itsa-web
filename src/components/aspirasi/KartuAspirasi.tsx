'use client'

import React, { useState } from 'react'
import { CalendarDays, ChevronDown, ImageIcon, MessageSquareQuote, Tag } from 'lucide-react'

import type { Aspirasi } from '@/payload-types'
import { Media } from '@/components/Media'
import { judulTampil, labelKategori, waktuRelatif } from '@/utilities/aspirasi'

const tanggalPanjang = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

/** Kartu bagian dalam saat detail dibuka: isi, tanggapan, dan lampiran terpisah. */
const Blok: React.FC<{ judul: string; Icon: typeof Tag; children: React.ReactNode }> = ({
  judul,
  Icon,
  children,
}) => (
  <section className="rounded-xl border border-olive/15 bg-cream p-4">
    <h4 className="flex items-center gap-2 font-aksen text-[11px] font-medium uppercase tracking-[0.14em] text-olive">
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {judul}
    </h4>
    <div className="mt-2.5 text-sm leading-relaxed text-forest">{children}</div>
  </section>
)

/**
 * Satu aspirasi dalam daftar.
 *
 * Yang tampil hanya kepala kartu: judul, cuplikan dua baris, kategori, dan
 * tanggal. Isi penuh beserta tanggapan pengurus baru dibuka lewat "Lihat
 * Detail" — halaman ini bisa memuat ratusan aspirasi, dan menampilkan semua
 * isinya sekaligus membuat daftarnya mustahil dipindai.
 *
 * Detailnya dibuka di tempat, bukan pindah halaman, supaya posisi gulir dan
 * saringan yang sedang dipakai tidak hilang.
 */
export const KartuAspirasi: React.FC<{ aspirasi: Aspirasi }> = ({ aspirasi }) => {
  const [terbuka, setTerbuka] = useState(false)

  const foto = aspirasi.respon_foto && typeof aspirasi.respon_foto === 'object'
    ? aspirasi.respon_foto
    : null
  const adaTanggapan = Boolean(aspirasi.respon_komentar?.trim()) || Boolean(foto)
  const idPanel = `aspirasi-detail-${aspirasi.id}`

  return (
    <li className="min-w-0 rounded-2xl border border-olive/15 bg-cream-elevated shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0">
      <div className="flex gap-4 p-5">
        <span
          aria-hidden
          className="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-forest text-gold sm:inline-flex"
        >
          <MessageSquareQuote className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <h3 className="font-heading text-base font-bold leading-snug text-forest">
              {judulTampil(aspirasi)}
            </h3>
            <span className="shrink-0 font-aksen text-[11px] tracking-wide text-olive">
              {waktuRelatif(aspirasi.createdAt)}
            </span>
          </div>

          {!terbuka && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-olive">{aspirasi.isi}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-olive/25 px-2.5 py-1 font-aksen text-[11px] font-medium uppercase tracking-wider text-olive">
              <Tag className="size-3 shrink-0" aria-hidden />
              {labelKategori(aspirasi.kategori)}
            </span>
            <span className="inline-flex items-center gap-1.5 font-aksen text-[11px] tracking-wide text-olive">
              <CalendarDays className="size-3.5 shrink-0" aria-hidden />
              {tanggalPanjang(aspirasi.createdAt)}
            </span>

            <button
              type="button"
              onClick={() => setTerbuka((v) => !v)}
              aria-expanded={terbuka}
              aria-controls={idPanel}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-forest transition-colors duration-200 hover:bg-olive/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
            >
              {terbuka ? 'Tutup Detail' : 'Lihat Detail'}
              <ChevronDown
                aria-hidden
                className={`size-4 transition-transform duration-200 ${terbuka ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {terbuka && (
        <div id={idPanel} className="space-y-3 border-t border-olive/15 p-5 pt-5">
          <Blok judul="Isi aspirasi" Icon={MessageSquareQuote}>
            <p className="whitespace-pre-line">{aspirasi.isi}</p>
          </Blok>

          {aspirasi.respon_komentar?.trim() && (
            <Blok judul="Tanggapan pengurus" Icon={MessageSquareQuote}>
              <p className="whitespace-pre-line">{aspirasi.respon_komentar}</p>
            </Blok>
          )}

          {foto && (
            <Blok judul="Lampiran" Icon={ImageIcon}>
              <Media
                resource={foto}
                // Tinggi dibatasi supaya satu foto tinggi tidak mendorong
                // aspirasi berikutnya jauh ke bawah.
                imgClassName="max-h-80 w-full rounded-lg object-cover"
                htmlElement={null}
              />
            </Blok>
          )}

          {!adaTanggapan && (
            <p className="rounded-xl border border-dashed border-olive/30 px-4 py-3 text-sm text-olive">
              Pengurus belum menuliskan tanggapan untuk aspirasi ini.
            </p>
          )}
        </div>
      )}
    </li>
  )
}
