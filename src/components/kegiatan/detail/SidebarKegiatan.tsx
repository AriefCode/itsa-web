import React from 'react'
import { CalendarDays, Clock, Info, MapPin, Tag, Users } from 'lucide-react'

import type { Event } from '@/payload-types'
import { formatBiaya, formatRentang, formatWaktu, sudahSelesai } from '@/utilities/kegiatan'
import { AksiKegiatan, type Poster } from './AksiKegiatan'

/** Satu baris informasi: ikon, label kecil, lalu nilainya. */
const Baris: React.FC<{ Icon: typeof MapPin; label: string; children: React.ReactNode }> = ({
  Icon,
  label,
  children,
}) => (
  <div className="flex gap-3">
    <Icon className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
    <div className="min-w-0">
      <dt className="font-aksen text-[11px] uppercase tracking-[0.14em] text-mist">{label}</dt>
      <dd className="mt-0.5 text-sm leading-relaxed text-cream">{children}</dd>
    </div>
  </div>
)

/**
 * Panel informasi kegiatan yang mengikuti gulungan di layar lebar.
 *
 * Isinya ringkasan yang paling sering dicari (kapan, di mana, berapa) plus
 * aksi cepat, jadi pengunjung tidak perlu menggulir balik ke hero setelah
 * membaca deskripsi panjang.
 */
export const SidebarKegiatan: React.FC<{ event: Event; poster: Poster }> = ({ event, poster }) => {
  const selesai = sudahSelesai(event)
  const tanggal = formatRentang(event.tanggal_mulai, event.tanggal_selesai)
  const waktu = formatWaktu(event)
  const divisi = event.divisi && typeof event.divisi === 'object' ? event.divisi : null
  const linkDokumentasi = selesai ? event.link_dokumentasi : null

  return (
    <aside className="lg:sticky lg:top-8">
      <div className="rounded-2xl border border-forest-line bg-forest p-6 text-cream shadow-[0_12px_32px_-16px_rgb(20_58_40/0.45)] sm:p-7">
        <h2 className="font-heading text-lg font-bold">Informasi Kegiatan</h2>

        <dl className="mt-5 space-y-4">
          {tanggal && (
            <Baris Icon={CalendarDays} label="Tanggal">
              {tanggal}
            </Baris>
          )}
          {waktu && (
            <Baris Icon={Clock} label="Waktu">
              {waktu}
            </Baris>
          )}
          {event.lokasi && (
            <Baris Icon={MapPin} label="Lokasi">
              {event.lokasi}
            </Baris>
          )}
          {divisi && (
            <Baris Icon={Users} label="Penyelenggara">
              {divisi.nama}
            </Baris>
          )}
          <Baris Icon={Tag} label="Biaya">
            {formatBiaya(event)}
          </Baris>
        </dl>

        <div className="mt-7 border-t border-forest-line pt-6">
          <h3 className="font-heading text-base font-bold">Aksi Cepat</h3>
          <div className="mt-4">
            <AksiKegiatan
              judul={event.judul}
              linkDokumentasi={linkDokumentasi}
              poster={poster}
              varian="sidebar"
            />
          </div>

          {linkDokumentasi && (
            <p className="mt-4 flex gap-2.5 rounded-xl border border-forest-line bg-forest-elevated p-3.5 text-xs leading-relaxed text-mist">
              <Info className="mt-px size-4 shrink-0 text-gold" aria-hidden />
              Dokumentasi berupa foto dan video tersimpan di Google Drive.
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}
