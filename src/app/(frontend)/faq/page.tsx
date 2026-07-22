import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import React from 'react'

import { AccordionFaq } from '@/components/faq/AccordionFaq'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

export const revalidate = 600

export default async function FaqPage() {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'faq',
    limit: 200,
    depth: 0,
    sort: 'urutan',
  })

  return (
    <main className="bg-forest">
      <div className="container py-14 sm:py-20">
        <header className="max-w-[60ch]">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">
            Pertanyaan Umum
          </h1>
          <p className="mt-4 leading-relaxed text-mist">
            Hal yang paling sering ditanyakan seputar ITSA, kegiatan, dan kepengurusan.
          </p>
        </header>

        <div className="mt-10">
          {docs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-forest-line px-6 py-12 text-center text-sm text-mist">
              Belum ada pertanyaan yang ditambahkan.
            </p>
          ) : (
            <AccordionFaq faq={docs} />
          )}
        </div>

        {/* Pertanyaan yang tidak terjawab di sini diarahkan ke kanal aspirasi,
            supaya halaman ini tidak jadi jalan buntu. */}
        <div className="mt-12 rounded-lg border border-forest-line p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h2 className="font-heading text-lg font-bold text-cream">
              Pertanyaanmu belum terjawab?
            </h2>
            <p className="mt-1.5 max-w-[52ch] text-sm leading-relaxed text-mist">
              Kirim lewat kanal aspirasi. Boleh anonim, dan akan ditanggapi pengurus.
            </p>
          </div>
          <Link
            href="/aspirasi"
            className="mt-4 inline-flex shrink-0 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-forest transition-transform hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:mt-0"
          >
            Kirim Aspirasi
          </Link>
        </div>
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: 'Pertanyaan Umum - ITSA',
  description: 'Pertanyaan yang sering diajukan seputar ITSA Politeknik Caltex Riau.',
  openGraph: mergeOpenGraph({ title: 'Pertanyaan Umum - ITSA', url: '/faq' }),
}
