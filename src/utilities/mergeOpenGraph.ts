import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  locale: 'id_ID',
  siteName: 'ITSA Politeknik Caltex Riau',
  title: 'ITSA - Information Technology Student Association',
  description:
    'Himpunan mahasiswa Teknologi Informasi Politeknik Caltex Riau. Kegiatan, kabinet, berita, dan aspirasi.',
  images: [
    {
      url: `${getServerSideURL()}/itsa-og.webp`,
      width: 1200,
      height: 630,
      alt: 'Logo ITSA, Information Technology Student Association, Politeknik Caltex Riau',
    },
  ],
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
