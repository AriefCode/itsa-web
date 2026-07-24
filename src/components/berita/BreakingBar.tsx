import Link from 'next/link'
import React from 'react'
import { ArrowRight, Megaphone } from 'lucide-react'

import type { Post } from '@/payload-types'

/**
 * Bilah di paling atas halaman Berita yang menyorot satu berita terbaru.
 * Tidak ditampilkan kalau belum ada berita.
 */
export const BreakingBar: React.FC<{ post: Post | null }> = ({ post }) => {
  if (!post) return null
  return (
    <div className="border-b border-forest-line bg-forest-elevated/50">
      <div className="container flex items-center gap-4 py-2.5">
        <span className="inline-flex shrink-0 items-center gap-1.5 font-aksen text-xs font-bold uppercase tracking-wider text-gold">
          <Megaphone className="size-4" aria-hidden />
          <span className="hidden sm:inline">Berita Terbaru</span>
        </span>
        <Link
          href={`/posts/${post.slug}`}
          className="min-w-0 flex-1 truncate rounded text-sm text-cream transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {post.title}
        </Link>
        <Link
          href="/posts"
          className="hidden shrink-0 items-center gap-1.5 rounded text-sm text-mist transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:inline-flex"
        >
          Lihat semua berita
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  )
}
