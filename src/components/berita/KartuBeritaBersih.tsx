import Link from 'next/link'
import React from 'react'
import { Clock } from 'lucide-react'

import type { Post } from '@/payload-types'
import { Media } from '@/components/Media'
import { TombolSimpan } from './TombolSimpan'
import { badgeKategori, formatTanggalBerita, gambarPost, waktuBaca } from '@/utilities/berita'

/**
 * Kartu berita bersih: foto di atas dengan badge kategori, lalu badan gelap
 * berisi tanggal, judul, waktu baca, dan tombol simpan. Susunannya lapang dan
 * mudah dipindai — satu pola kartu untuk seluruh grid berita.
 */
export const KartuBeritaBersih: React.FC<{ post: Post }> = ({ post }) => {
  const gambar = gambarPost(post)
  const badge = badgeKategori(post)

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-forest-line bg-forest-elevated/60 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 motion-reduce:hover:translate-y-0">
      <Link
        href={`/posts/${post.slug}`}
        className="relative block aspect-[16/10] overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        {gambar && (
          <Media
            resource={gambar}
            imgClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
            htmlElement={null}
          />
        )}
        {badge && (
          <span className="absolute left-3 top-3 rounded bg-forest-deep/85 px-2.5 py-1 font-aksen text-[10px] font-semibold uppercase tracking-wider text-cream backdrop-blur-sm">
            {badge}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="font-aksen text-xs text-mist">{formatTanggalBerita(post.publishedAt)}</p>
        <h3 className="mt-1.5 font-heading text-base font-bold leading-snug text-cream">
          <Link
            href={`/posts/${post.slug}`}
            className="line-clamp-2 rounded transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            {post.title}
          </Link>
        </h3>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="flex items-center gap-1.5 text-xs text-mist">
            <Clock className="size-3.5 shrink-0" aria-hidden />
            {waktuBaca(post)} menit baca
          </span>
          <TombolSimpan slug={post.slug ?? ''} />
        </div>
      </div>
    </article>
  )
}
