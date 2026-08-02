import React from 'react'
import { CheckCircle2, Clock3 } from 'lucide-react'

import type { Event } from '@/payload-types'
import { statusEvent, type StatusEvent } from '@/utilities/kegiatan'

const LABEL: Record<StatusEvent, string> = {
  berlangsung: 'Sedang Berlangsung',
  selesai: 'Selesai',
  'akan-datang': 'Akan Datang',
}

/**
 * SATU sumber kebenaran warna badge status kegiatan — supaya tidak lagi ada
 * "Selesai" yang gold di satu kartu tapi cream di kartu lain, atau "Akan
 * Datang" yang maknanya kebalik antar halaman.
 *
 * Pemetaan makna → warna:
 * - Selesai     : netral kalem (arsip, tak menonjol).
 * - Akan Datang : aksen gold (yang dinanti).
 * - Berlangsung : gold penuh + titik berdenyut (paling menonjol, sedang live).
 *
 * Varian `foto` dipakai saat badge duduk di atas gambar: latar gelap ber-blur
 * demi keterbacaan, sementara warna teks tetap membawa makna yang sama.
 */
const WARNA: Record<'solid' | 'foto', Record<StatusEvent, string>> = {
  solid: {
    berlangsung: 'bg-gold text-forest',
    selesai: 'bg-cream/15 text-cream',
    'akan-datang': 'border border-gold/60 text-gold',
  },
  foto: {
    berlangsung: 'bg-gold text-forest backdrop-blur-sm',
    selesai: 'bg-forest-deep/75 text-cream backdrop-blur-sm',
    'akan-datang': 'bg-forest-deep/75 text-gold backdrop-blur-sm',
  },
}

const UKURAN = {
  sm: 'gap-1 px-2 py-0.5 text-[11px] tracking-wider',
  md: 'gap-1.5 px-3 py-1.5 text-xs tracking-[0.12em]',
}

/**
 * Badge status kegiatan (Selesai / Akan Datang / Sedang Berlangsung).
 *
 * @param varian `solid` di atas permukaan hijau, `foto` di atas gambar.
 * @param ukuran `sm` (default) untuk kartu; `md` untuk hero detail.
 * @param ikon   tampilkan ikon centang/jam (dipakai di hero detail).
 */
export const BadgeStatus: React.FC<{
  event: Event
  varian?: 'solid' | 'foto'
  ukuran?: 'sm' | 'md'
  ikon?: boolean
}> = ({ event, varian = 'solid', ukuran = 'sm', ikon = false }) => {
  const status = statusEvent(event)
  const berat = status === 'berlangsung' ? 'font-bold' : 'font-medium'

  return (
    <span
      className={`inline-flex w-fit items-center rounded font-aksen uppercase ${UKURAN[ukuran]} ${WARNA[varian][status]} ${berat}`}
    >
      {status === 'berlangsung' && (
        <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-forest" />
      )}
      {ikon && status === 'selesai' && <CheckCircle2 className="size-3.5" aria-hidden />}
      {ikon && status === 'akan-datang' && <Clock3 className="size-3.5" aria-hidden />}
      {LABEL[status]}
    </span>
  )
}
