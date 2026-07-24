import type { Category, Media, Post } from '@/payload-types'
import { ambilTeks, potongTeks } from '@/utilities/lexicalText'

/** Gambar utama sebuah post: meta.image dulu, lalu heroImage. */
export const gambarPost = (post: Post): Media | null => {
  if (post.meta?.image && typeof post.meta.image === 'object') return post.meta.image
  if (post.heroImage && typeof post.heroImage === 'object') return post.heroImage
  return null
}

/** Estimasi waktu baca (menit), ~200 kata/menit, minimal 1 menit. */
export const waktuBaca = (post: Post): number => {
  const kata = ambilTeks(post.content).trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(kata / 200))
}

/** Cuplikan singkat: pakai meta.description kalau ada, kalau tidak potong konten. */
export const cuplikanPost = (post: Post, panjang = 120): string =>
  post.meta?.description || potongTeks(ambilTeks(post.content), panjang)

/** Kategori-kategori yang sudah ter-populate pada sebuah post. */
export const kategoriPost = (post: Post): Category[] =>
  (post.categories ?? []).filter((c): c is Category => typeof c === 'object')

/** Label kategori pertama sebagai badge (uppercase). Null kalau tak ada. */
export const badgeKategori = (post: Post): string | null => kategoriPost(post)[0]?.title ?? null

export const formatTanggalBerita = (nilai?: string | null): string | null =>
  nilai
    ? new Date(nilai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

/** Apakah post punya kategori dengan id tertentu. */
export const punyaKategori = (post: Post, id: number): boolean =>
  (post.categories ?? []).some((c) => (typeof c === 'object' ? c.id : c) === id)
