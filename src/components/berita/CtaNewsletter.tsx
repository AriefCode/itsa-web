'use client'

import React, { useState } from 'react'
import { CheckCircle2, Mail } from 'lucide-react'

/**
 * Ajakan berlangganan berita. Belum ada backend/integrasi email, jadi
 * pengiriman hanya menampilkan konfirmasi di sisi klien dan tidak mengirim
 * data ke mana pun.
 */
export const CtaNewsletter: React.FC = () => {
  const [email, setEmail] = useState('')
  const [terkirim, setTerkirim] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setTerkirim(true)
  }

  return (
    <section className="bg-forest">
      <div className="container pb-16 sm:pb-20">
        <div className="relative overflow-hidden rounded-2xl border border-forest-line bg-forest-elevated/60 px-6 py-8 sm:px-10">
          {/* Pola titik dekoratif di sudut kanan. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-4 -top-4 size-40 opacity-40 [background-image:radial-gradient(var(--color-gold)_1px,transparent_1px)] [background-size:12px_12px]"
          />
          <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="hidden size-12 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold sm:inline-flex">
                <Mail className="size-6" aria-hidden />
              </span>
              <div>
                <h2 className="font-heading text-xl font-bold text-cream sm:text-2xl">
                  Jangan lewatkan <span className="text-gold">berita terbaru</span> dari ITSA!
                </h2>
                <p className="mt-1.5 max-w-[56ch] text-sm leading-relaxed text-mist">
                  Dapatkan update kegiatan, prestasi, dan pengumuman penting langsung ke email kamu.
                </p>
              </div>
            </div>

            {terkirim ? (
              <p className="flex items-center gap-2 rounded-lg bg-forest px-4 py-3 text-sm font-medium text-cream ring-1 ring-forest-line">
                <CheckCircle2 className="size-5 text-gold" aria-hidden />
                Terima kasih! Fitur langganan segera aktif.
              </p>
            ) : (
              <form onSubmit={submit} className="flex w-full max-w-md shrink-0 gap-2">
                <label htmlFor="email-langganan" className="sr-only">
                  Alamat email
                </label>
                <input
                  id="email-langganan"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email kamu"
                  className="min-w-0 flex-1 rounded-lg border border-forest-line bg-forest px-4 py-3 text-sm text-cream placeholder:text-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-forest transition-transform hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                >
                  Berlangganan
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
