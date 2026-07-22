import React from 'react'

/**
 * Kerangka (skeleton) saat daftar aspirasi sedang diambil ulang dari server.
 *
 * Dipakai sebagai fallback <Suspense> di halaman: begitu saringan berubah,
 * kerangka ini muncul menggantikan daftar lama sehingga jelas ada yang sedang
 * dimuat, bukan halaman yang membeku.
 *
 * Denyutnya dimatikan otomatis untuk pengguna yang meminta gerak minimal —
 * `animate-pulse` bawaan Tailwind tidak melakukannya sendiri.
 */
const denyut = 'animate-pulse motion-reduce:animate-none rounded bg-olive/15'

export const KerangkaDaftar: React.FC<{ jumlah?: number }> = ({ jumlah = 5 }) => (
  <ul className="space-y-4" aria-hidden>
    {Array.from({ length: jumlah }, (_, i) => (
      <li key={i} className="rounded-2xl border border-olive/15 bg-cream-elevated p-5 shadow-sm">
        <div className="flex gap-4">
          <span className={`hidden size-11 shrink-0 sm:block ${denyut}`} />
          <div className="min-w-0 flex-1 space-y-2.5">
            <span className={`block h-4 w-2/3 ${denyut}`} />
            <span className={`block h-3 w-full ${denyut}`} />
            <span className={`block h-3 w-4/5 ${denyut}`} />
            <div className="flex gap-3 pt-1">
              <span className={`block h-5 w-28 ${denyut}`} />
              <span className={`block h-5 w-32 ${denyut}`} />
            </div>
          </div>
        </div>
      </li>
    ))}
  </ul>
)

export const KerangkaStatistik: React.FC = () => (
  <ul className="grid gap-4 sm:grid-cols-3" aria-hidden>
    {Array.from({ length: 3 }, (_, i) => (
      <li
        key={i}
        className="flex items-center gap-4 rounded-2xl border border-forest-line bg-forest p-5"
      >
        <span className="size-12 shrink-0 animate-pulse rounded-xl bg-forest-elevated motion-reduce:animate-none" />
        <div className="min-w-0 flex-1 space-y-2">
          <span className="block h-7 w-16 animate-pulse rounded bg-forest-elevated motion-reduce:animate-none" />
          <span className="block h-3 w-24 animate-pulse rounded bg-forest-elevated motion-reduce:animate-none" />
        </div>
      </li>
    ))}
  </ul>
)
