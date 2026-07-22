import React from 'react'
import { CheckCircle2, Clock, MessageSquare } from 'lucide-react'

type Props = {
  total: number
  ditanggapi: number
}

/**
 * Ringkasan angka aspirasi yang tampil di halaman publik.
 *
 * Semuanya dihitung dari data yang sama dengan yang dipakai daftar di
 * bawahnya — bukan angka yang ditulis tangan — jadi tidak mungkin melenceng
 * dari isi halaman.
 */
export const StatistikAspirasi: React.FC<Props> = ({ total, ditanggapi }) => {
  const belum = Math.max(0, total - ditanggapi)
  const persen = (n: number) => (total === 0 ? '0%' : `${((n / total) * 100).toFixed(1)}%`)

  const kartu = [
    {
      Icon: MessageSquare,
      nilai: total,
      label: 'Total Aspirasi',
      catatan: 'Yang tayang di halaman ini',
      warna: 'text-gold',
    },
    {
      Icon: CheckCircle2,
      nilai: ditanggapi,
      label: 'Sudah Ditanggapi',
      catatan: persen(ditanggapi),
      warna: 'text-forest-field',
    },
    {
      Icon: Clock,
      nilai: belum,
      label: 'Menunggu Tanggapan',
      catatan: persen(belum),
      warna: 'text-mist',
    },
  ]

  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {kartu.map(({ Icon, nilai, label, catatan, warna }) => (
        <li
          key={label}
          className="flex items-center gap-4 rounded-2xl border border-forest-line bg-forest p-5 text-cream shadow-[0_12px_28px_-18px_rgb(20_58_40/0.5)]"
        >
          <span
            aria-hidden
            className={`inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-forest-elevated ${warna}`}
          >
            <Icon className="size-6" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="font-aksen text-3xl font-bold leading-none tabular-nums">{nilai}</p>
            <p className="mt-1.5 text-sm font-medium">{label}</p>
            <p className="font-aksen text-[11px] uppercase tracking-[0.12em] text-mist">
              {catatan}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
