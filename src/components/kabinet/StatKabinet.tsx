import React from 'react'
import { ClipboardList, Target, Users2, Boxes } from 'lucide-react'

/**
 * Band statistik ringkas di bawah hero Kabinet.
 *
 * Dua angka pertama diturunkan dari data (jumlah pengurus & divisi); dua
 * terakhir bersifat naratif/brand — bukan dari koleksi tersendiri, jadi
 * ditulis langsung di sini.
 */
export const StatKabinet: React.FC<{
  jumlahPengurus: number
  jumlahDivisi: number
}> = ({ jumlahPengurus, jumlahDivisi }) => {
  const item = [
    {
      Ikon: Users2,
      nilai: String(jumlahPengurus),
      label: 'Pengurus Aktif',
      sub: 'Berdedikasi menjalankan program kerja himpunan',
    },
    {
      Ikon: Boxes,
      nilai: String(jumlahDivisi),
      label: 'Departemen',
      sub: 'Dikelompokkan berdasarkan fungsi dan bidang kerja',
    },
    {
      Ikon: ClipboardList,
      nilai: '11+',
      label: 'Program Kerja',
      sub: 'Dirancang untuk memberikan manfaat nyata',
    },
    {
      Ikon: Target,
      nilai: '1',
      label: 'Tujuan',
      sub: 'Mewujudkan ITSA yang solid dan berdampak',
    },
  ]

  return (
    <div className="container">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-forest-line bg-forest-line sm:grid-cols-2 lg:grid-cols-4">
        {item.map(({ Ikon, nilai, label, sub }) => (
          <div key={label} className="bg-forest-deep p-5 sm:p-6">
            <Ikon className="size-6 text-gold" strokeWidth={1.75} aria-hidden />
            <p className="mt-3 font-aksen text-2xl font-bold leading-none text-cream tabular-nums sm:text-3xl">
              {nilai}
            </p>
            <p className="mt-2 font-heading text-sm font-bold text-cream">{label}</p>
            <p className="mt-1 text-xs leading-relaxed text-mist">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
