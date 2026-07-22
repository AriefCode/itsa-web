'use client'

import React, { useRef, useState } from 'react'
import { CheckCircle2, Loader2, Send } from 'lucide-react'

const PANJANG_MAKSIMUM = 2000

/**
 * Form kirim aspirasi anonim.
 *
 * Dua pengaman spam ditanam di sini, sisanya dikerjakan di server
 * (lihat app/(frontend)/next/aspirasi/route.ts):
 *
 * - Field honeypot "website" disembunyikan dari manusia, tapi tetap ada di
 *   DOM sehingga bot pengisi-semua-kolom akan mengisinya. Disembunyikan
 *   dengan posisi di luar layar, bukan display:none, karena sebagian bot
 *   melewati field yang jelas-jelas disembunyikan.
 * - Waktu form dibuka dikirim bersama kiriman, supaya server bisa menolak
 *   pengiriman yang terlalu cepat untuk ditulis manusia.
 */
export const FormAspirasi: React.FC = () => {
  const [isi, setIsi] = useState('')
  const [status, setStatus] = useState<'diam' | 'mengirim' | 'berhasil'>('diam')
  const [galat, setGalat] = useState<string | null>(null)
  const dibukaRef = useRef(Date.now())
  const honeypotRef = useRef<HTMLInputElement>(null)

  const kirim = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'mengirim') return

    setGalat(null)
    setStatus('mengirim')

    try {
      const res = await fetch('/next/aspirasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isi,
          website: honeypotRef.current?.value ?? '',
          dibuka: dibukaRef.current,
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setGalat(data?.pesan ?? 'Gagal mengirim. Coba lagi.')
        setStatus('diam')
        return
      }

      setStatus('berhasil')
      setIsi('')
    } catch {
      setGalat('Tidak bisa terhubung ke server. Periksa koneksimu lalu coba lagi.')
      setStatus('diam')
    }
  }

  if (status === 'berhasil') {
    return (
      <div className="rounded-lg border border-forest-line bg-forest-elevated p-6">
        <p className="flex items-center gap-2 font-heading font-bold text-cream">
          <CheckCircle2 className="size-5 text-gold" aria-hidden />
          Aspirasi terkirim
        </p>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          Terima kasih. Aspirasimu masuk ke pengurus dan akan dibaca. Kalau ditanggapi dan layak
          dibagikan, aspirasi ini akan muncul di daftar bawah beserta jawabannya.
        </p>
        <button
          type="button"
          onClick={() => {
            dibukaRef.current = Date.now()
            setStatus('diam')
          }}
          className="mt-4 rounded-lg border border-forest-line px-4 py-2 text-sm text-cream transition-colors hover:bg-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Kirim aspirasi lagi
        </button>
      </div>
    )
  }

  const sisa = PANJANG_MAKSIMUM - isi.length

  return (
    <form onSubmit={kirim} className="rounded-lg border border-forest-line p-6">
      <label htmlFor="isi-aspirasi" className="block font-heading font-bold text-cream">
        Tulis aspirasimu
      </label>
      <p id="bantuan-isi" className="mt-1.5 text-sm leading-relaxed text-mist">
        Tidak perlu menuliskan nama. Pengurus tidak tahu siapa pengirimnya.
      </p>

      <textarea
        id="isi-aspirasi"
        name="isi"
        value={isi}
        onChange={(e) => setIsi(e.target.value)}
        required
        minLength={10}
        maxLength={PANJANG_MAKSIMUM}
        rows={6}
        aria-describedby="bantuan-isi sisa-karakter"
        aria-invalid={galat ? true : undefined}
        placeholder="Contoh: AC di lab TI lantai 2 sudah lama tidak dingin, mohon dicek."
        className="mt-4 w-full rounded-lg border border-forest-field bg-forest-elevated px-4 py-3 text-cream placeholder:text-mist/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p id="sisa-karakter" className="text-xs text-mist">
          {sisa} karakter tersisa
        </p>
        {galat && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {galat}
          </p>
        )}
      </div>

      {/* Honeypot: bukan untuk manusia. Disembunyikan di luar layar, dijauhkan
          dari urutan tab, dan diberi tahu pembaca layar untuk mengabaikannya. */}
      <div aria-hidden className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website-aspirasi">Jangan diisi</label>
        <input
          ref={honeypotRef}
          id="website-aspirasi"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <button
        type="submit"
        disabled={status === 'mengirim' || isi.trim().length < 10}
        // Saat nonaktif tombolnya berganti warna, bukan sekadar diredupkan:
        // gold ber-opacity 50% di atas hijau berubah jadi olive kusam yang
        // terbaca seperti salah warna, bukan seperti tombol yang belum siap.
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-forest transition-colors hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-forest-elevated disabled:text-mist disabled:hover:brightness-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
      >
        {status === 'mengirim' ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Mengirim...
          </>
        ) : (
          <>
            <Send className="size-4" aria-hidden />
            Kirim Aspirasi
          </>
        )}
      </button>
    </form>
  )
}
