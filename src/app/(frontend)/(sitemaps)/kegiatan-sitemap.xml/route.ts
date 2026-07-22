import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

/**
 * Sitemap halaman detail kegiatan.
 *
 * Dipisah dari pages-sitemap mengikuti pola template (posts punya sitemap
 * sendiri): tiap collection yang punya halaman detail dapat berkasnya
 * sendiri, sehingga jumlah URL per berkas tetap wajar saat isinya bertambah.
 */
const getKegiatanSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://itsa.pcr.ac.id'

    const results = await payload.find({
      collection: 'events',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: { _status: { equals: 'published' } },
      select: { slug: true, updatedAt: true },
    })

    const dateFallback = new Date().toISOString()

    return (results.docs ?? [])
      .filter((e) => Boolean(e?.slug))
      .map((e) => ({
        loc: `${SITE_URL}/kegiatan/${e.slug}`,
        lastmod: e.updatedAt || dateFallback,
      }))
  },
  ['kegiatan-sitemap'],
  { tags: ['kegiatan-sitemap'] },
)

export async function GET() {
  return getServerSideSitemap(await getKegiatanSitemap())
}
