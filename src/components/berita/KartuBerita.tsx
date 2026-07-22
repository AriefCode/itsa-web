import Link from 'next/link'
import React from 'react'
import { ExternalLink } from 'lucide-react'

import type { Post } from '@/payload-types'
import { Media } from '@/components/Media'
import { ambilTeks, potongTeks } from '@/utilities/lexicalText'

const formatTanggal = (nilai?: string | null) =>
  nilai
    ? new Date(nilai).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

/**
 * Kartu berita: kartu cream di atas latar hijau.
 *
 * Berita Oprec biasanya mengarah ke Google Form pendaftaran. Tautan itu
 * ditandai di kartu supaya pembaca tahu ada langkah lanjutan, tapi kartunya
 * tetap menuju halaman berita, bukan langsung keluar situs. Membuang pembaca
 * ke domain lain tanpa membaca isinya dulu terlalu memaksa.
 */
export const KartuBerita: React.FC<{ post: Post }> = ({ post }) => {
  const tanggal = formatTanggal(post.publishedAt)
  const kategori = (post.categories ?? []).filter((c) => typeof c === 'object')
  const cuplikan = post.meta?.description || potongTeks(ambilTeks(post.content), 120)

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg bg-cream text-forest transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold motion-reduce:hover:translate-y-0"
    >
      {post.meta?.image && typeof post.meta.image === 'object' ? (
        <Media
          resource={post.meta.image}
          imgClassName="aspect-[16/10] w-full object-cover"
          htmlElement={null}
        />
      ) : post.heroImage && typeof post.heroImage === 'object' ? (
        <Media
          resource={post.heroImage}
          imgClassName="aspect-[16/10] w-full object-cover"
          htmlElement={null}
        />
      ) : null}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {kategori.map((c) => (
            <span
              key={c.id}
              className="rounded bg-forest px-2 py-0.5 font-aksen text-[11px] font-medium uppercase tracking-wider text-cream"
            >
              {c.title}
            </span>
          ))}
          {post.link_eksternal && (
            <span className="inline-flex items-center gap-1 rounded bg-gold px-2 py-0.5 font-aksen text-[11px] font-bold tracking-wider text-forest">
              Pendaftaran
              <ExternalLink className="size-3" aria-hidden />
            </span>
          )}
        </div>

        <h3 className="mt-3 font-heading text-lg font-bold leading-snug">{post.title}</h3>

        {cuplikan && <p className="mt-2 text-sm leading-relaxed text-olive">{cuplikan}</p>}

        {tanggal && (
          <p className="mt-auto pt-4 font-aksen text-xs tracking-wide text-olive">{tanggal}</p>
        )}
      </div>
    </Link>
  )
}
