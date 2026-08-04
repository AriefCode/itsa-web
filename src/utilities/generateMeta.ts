import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  // Cadangan saat dokumen belum punya meta.image. Berkas sebelumnya
  // (/website-template-OG.webp) bawaan template dan TIDAK ADA di public/,
  // sehingga setiap berita tanpa gambar meta menghasilkan og:image 404 —
  // kartu pratinjaunya kosong saat ditempel di WhatsApp atau Instagram.
  // /itsa-og.webp ada, berukuran 1200x630 (diverifikasi dengan membaca
  // berkasnya), dan sama dengan yang dipakai mergeOpenGraph untuk halaman
  // statis, jadi seluruh situs kini memakai satu gambar bagikan yang sama.
  let url = serverUrl + '/itsa-og.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL(doc?.meta?.image)

  // Akhiran dan cadangan disamakan dengan generateTitle di plugins/index.ts
  // serta title.default di app/(frontend)/layout.tsx. Ketiganya harus sepakat;
  // kalau tidak, judul sebuah berita berbeda-beda tergantung jalur mana yang
  // kebetulan dipakai untuk merendernya.
  const title = doc?.meta?.title
    ? `${doc.meta.title} | ITSA PCR`
    : 'ITSA - Information Technology Student Association'

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
