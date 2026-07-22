const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://itsa.pcr.ac.id'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  // Semua URL disajikan lewat sitemap dinamis di app/(frontend)/(sitemaps),
  // karena isinya berasal dari database. next-sitemap di sini hanya bertugas
  // membuat robots.txt dan menunjuk ke berkas-berkas tersebut.
  exclude: ['/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        // Panel admin dan rute internal tidak perlu diindeks. /next/aspirasi
        // adalah endpoint penerima form, bukan halaman yang bisa dibaca.
        disallow: ['/admin/*', '/next/*', '/api/*'],
      },
    ],
    additionalSitemaps: [
      `${SITE_URL}/pages-sitemap.xml`,
      `${SITE_URL}/posts-sitemap.xml`,
      `${SITE_URL}/kegiatan-sitemap.xml`,
    ],
  },
}
