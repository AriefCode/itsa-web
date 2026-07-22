import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'
import { MessageSquareQuote } from 'lucide-react'

import { FormAspirasi } from '@/components/aspirasi/FormAspirasi'
import { Media } from '@/components/Media'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'

// Aspirasi baru bisa masuk kapan saja, jadi halaman ini tidak dibekukan lama.
export const revalidate = 60

export default async function AspirasiPage() {
  const payload = await getPayload({ config: configPromise })

  // overrideAccess: false membuat query tunduk pada access control publik,
  // sehingga hanya aspirasi yang sudah ditandai tampil yang ikut terambil.
  // Yang belum dimoderasi tidak pernah sampai ke halaman ini.
  const { docs } = await payload.find({
    collection: 'aspirasi',
    limit: 50,
    depth: 1,
    sort: '-createdAt',
    overrideAccess: false,
  })

  return (
    <main className="bg-forest">
      <div className="container py-14 sm:py-20">
        <header className="max-w-[60ch]">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">
            Aspirasi
          </h1>
          <p className="mt-4 leading-relaxed text-mist">
            Punya keluhan, usulan, atau pertanyaan untuk ITSA? Kirim di sini. Pengirimannya anonim,
            jadi tidak perlu khawatir.
          </p>
        </header>

        <div className="mt-10 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <FormAspirasi />

            <div className="mt-6 space-y-2 text-sm leading-relaxed text-mist">
              <p className="font-medium text-cream">Yang terjadi setelah kamu kirim</p>
              <p>
                Aspirasi masuk ke panel pengurus. Tidak semuanya ditampilkan di halaman ini; hanya
                yang sudah ditanggapi dan layak dibagikan yang muncul di sebelah.
              </p>
              <p>
                Karena anonim, pengurus tidak bisa membalas ke orang tertentu. Kalau kamu butuh
                jawaban langsung, sebutkan kontakmu di dalam isi aspirasi.
              </p>
            </div>
          </div>

          <section className="lg:col-span-7" aria-labelledby="aspirasi-terjawab">
            <h2 id="aspirasi-terjawab" className="font-heading text-xl font-bold text-cream">
              Aspirasi yang sudah ditanggapi
            </h2>

            {docs.length === 0 ? (
              <p className="mt-6 rounded-lg border border-dashed border-forest-line px-6 py-12 text-center text-sm text-mist">
                Belum ada aspirasi yang ditanggapi. Yang sudah dijawab pengurus akan tampil di sini.
              </p>
            ) : (
              <ul className="mt-6 space-y-5">
                {docs.map((a) => (
                  <li key={a.id} className="overflow-hidden rounded-lg bg-cream text-forest">
                    <div className="p-5">
                      <p className="text-xs font-medium uppercase tracking-wider text-olive">
                        Aspirasi warga
                      </p>
                      <p className="mt-2 leading-relaxed">{a.isi}</p>
                      <p className="mt-3 text-xs text-olive">
                        {new Date(a.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {(a.respon_komentar || (a.respon_foto && typeof a.respon_foto === 'object')) && (
                      <div className="border-t border-olive/25 bg-olive/10 p-5">
                        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-olive">
                          <MessageSquareQuote className="size-3.5" aria-hidden />
                          Tanggapan pengurus
                        </p>
                        {a.respon_komentar && (
                          <p className="mt-2 leading-relaxed">{a.respon_komentar}</p>
                        )}
                        {a.respon_foto && typeof a.respon_foto === 'object' && (
                          <Media
                            resource={a.respon_foto}
                            // Tinggi dibatasi supaya satu foto tinggi tidak
                            // mendorong aspirasi berikutnya jauh ke bawah.
                            imgClassName="mt-4 max-h-80 w-full rounded object-cover"
                            htmlElement={null}
                          />
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: 'Aspirasi - ITSA',
  description: 'Kirim aspirasi anonim untuk ITSA Politeknik Caltex Riau.',
  openGraph: mergeOpenGraph({ title: 'Aspirasi - ITSA', url: '/aspirasi' }),
}
