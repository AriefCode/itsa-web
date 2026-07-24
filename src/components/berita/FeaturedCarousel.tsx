'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

import type { Post } from '@/payload-types'
import { Media } from '@/components/Media'
import { badgeKategori, cuplikanPost, formatTanggalBerita, gambarPost } from '@/utilities/berita'

/**
 * Carousel berita unggulan di hero. Berganti sendiri tiap 7 detik, dan bisa
 * digeser manual lewat panah atau titik. Auto-advance berhenti kalau pengguna
 * memilih prefers-reduced-motion.
 */
export const FeaturedCarousel: React.FC<{ posts: Post[] }> = ({ posts }) => {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (posts.length <= 1) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setI((n) => (n + 1) % posts.length), 7000)
    return () => clearInterval(id)
  }, [posts.length])

  if (posts.length === 0) return null
  const post = posts[i % posts.length]
  const gambar = gambarPost(post)
  const badge = badgeKategori(post)
  const geser = (arah: number) => setI((n) => (n + arah + posts.length) % posts.length)

  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-forest-line bg-forest-elevated text-cream sm:aspect-[16/10] lg:aspect-[16/9]">
      {gambar && (
        <Media
          resource={gambar}
          imgClassName="absolute inset-0 h-full w-full object-cover"
          htmlElement={null}
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest-deep/70 to-forest-deep/20"
      />

      <Link
        href={`/posts/${post.slug}`}
        className="absolute inset-0 flex flex-col justify-center p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:p-8 lg:max-w-[62%]"
      >
        {badge && (
          <span className="mb-4 w-fit rounded bg-forest/80 px-2.5 py-1 font-aksen text-[11px] font-semibold uppercase tracking-wider text-cream ring-1 ring-forest-line backdrop-blur-sm">
            {badge}
          </span>
        )}
        <p className="font-aksen text-xs text-mist">{formatTanggalBerita(post.publishedAt)}</p>
        <h3 className="mt-2 max-w-[20ch] font-heading text-2xl font-bold leading-tight sm:text-3xl">
          {post.title}
        </h3>
        <p className="mt-3 hidden max-w-[46ch] text-sm leading-relaxed text-mist sm:line-clamp-3">
          {cuplikanPost(post, 160)}
        </p>
        <span className="mt-5 inline-flex w-fit items-center gap-1.5 font-semibold text-gold transition-transform group-hover:gap-2.5">
          Baca selengkapnya
          <ArrowRight className="size-4" aria-hidden />
        </span>
      </Link>

      {posts.length > 1 && (
        <>
          <div className="absolute bottom-6 left-6 z-10 flex gap-1.5 sm:bottom-8 sm:left-8">
            {posts.map((_, n) => (
              <button
                key={n}
                type="button"
                onClick={() => setI(n)}
                aria-label={`Ke slide ${n + 1}`}
                aria-current={n === i % posts.length}
                className={`h-1.5 rounded-full transition-all ${n === i % posts.length ? 'w-6 bg-gold' : 'w-2.5 bg-cream/40 hover:bg-cream/70'}`}
              />
            ))}
          </div>
          <div className="absolute bottom-6 right-6 z-10 flex gap-2 sm:bottom-8 sm:right-8">
            <button
              type="button"
              onClick={() => geser(-1)}
              className="inline-flex size-10 items-center justify-center rounded-full border border-cream/40 bg-forest/60 text-cream backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <span className="sr-only">Sebelumnya</span>
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => geser(1)}
              className="inline-flex size-10 items-center justify-center rounded-full border border-cream/40 bg-forest/60 text-cream backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <span className="sr-only">Berikutnya</span>
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
