import Link from 'next/link'
import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Paginasi berbasis tautan, bukan tombol berstate.
 *
 * Setiap halaman punya URL sendiri sehingga bisa dibagikan, di-bookmark, dan
 * dibuka mesin pencari. Karena hanya <a>, paginasi tetap berfungsi meski
 * JavaScript gagal dimuat.
 */
export const Paginasi: React.FC<{
  halaman: number
  totalHalaman: number
  /** Membangun URL untuk nomor halaman tertentu, termasuk query lain. */
  buatHref: (halaman: number) => string
  /** Penanda untuk pembaca layar; sebutkan daftar apa yang dinavigasi. */
  label?: string
  /**
   * Latar tempat paginasi ini dipasang. Warnanya HARUS ikut latarnya: gaya
   * gelap (teks cream) di atas band cream membuat nomor halamannya lenyap.
   */
  nada?: 'gelap' | 'terang'
}> = ({ halaman, totalHalaman, buatHref, label = 'Halaman', nada = 'gelap' }) => {
  if (totalHalaman <= 1) return null

  // Tampilkan halaman pertama, terakhir, dan tetangga halaman aktif.
  const nomor: (number | 'jeda')[] = []
  for (let i = 1; i <= totalHalaman; i++) {
    if (i === 1 || i === totalHalaman || Math.abs(i - halaman) <= 1) nomor.push(i)
    else if (nomor[nomor.length - 1] !== 'jeda') nomor.push('jeda')
  }

  const gaya =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

  const terang = nada === 'terang'
  const tautan = terang
    ? 'border border-olive/30 text-forest hover:bg-olive/10'
    : 'border border-forest-line text-cream hover:bg-forest-elevated'
  const mati = terang ? 'border border-olive/15 text-olive/40' : 'border border-forest-line/40 text-mist/40'
  const jeda = terang ? 'text-olive' : 'text-mist'

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label={label}>
      {halaman > 1 ? (
        <Link
          href={buatHref(halaman - 1)}
          className={`${gaya} ${tautan}`}
        >
          <span className="sr-only">Halaman sebelumnya</span>
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
      ) : (
        <span className={`${gaya} ${mati}`} aria-hidden>
          <ChevronLeft className="size-4" />
        </span>
      )}

      {nomor.map((n, i) =>
        n === 'jeda' ? (
          <span key={`jeda-${i}`} className={`px-1 ${jeda}`} aria-hidden>
            ...
          </span>
        ) : n === halaman ? (
          <span key={n} aria-current="page" className={`${gaya} bg-gold font-semibold text-forest`}>
            {n}
          </span>
        ) : (
          <Link
            key={n}
            href={buatHref(n)}
            className={`${gaya} ${tautan}`}
          >
            {n}
          </Link>
        ),
      )}

      {halaman < totalHalaman ? (
        <Link
          href={buatHref(halaman + 1)}
          className={`${gaya} ${tautan}`}
        >
          <span className="sr-only">Halaman berikutnya</span>
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span className={`${gaya} ${mati}`} aria-hidden>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  )
}
