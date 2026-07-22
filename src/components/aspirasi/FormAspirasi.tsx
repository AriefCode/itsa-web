'use client'

import React, { useRef, useState } from 'react'
import { CheckCircle2, Loader2, PenLine, Send, ShieldCheck } from 'lucide-react'

import {
  KATEGORI_ASPIRASI,
  PANJANG_ISI_MAKSIMUM,
  PANJANG_JUDUL_MAKSIMUM,
} from '@/utilities/aspirasi'

/** Kelas isian yang dipakai berulang oleh select, input, dan textarea. */
const ISIAN =
  'w-full rounded-xl border border-olive/30 bg-cream px-4 py-3 text-sm text-forest transition-colors duration-200 placeholder:text-olive/60 hover:border-olive/50 focus-visible:border-olive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

const LABEL = 'block text-sm font-medium text-forest'

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
  const [judul, setJudul] = useState('')
  const [kategori, setKategori] = useState('')
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
          judul,
          kategori,
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
      setJudul('')
      setKategori('')
      setIsi('')
    } catch {
      setGalat('Tidak bisa terhubung ke server. Periksa koneksimu lalu coba lagi.')
      setStatus('diam')
    }
  }

  if (status === 'berhasil') {
    return (
      <div className="rounded-2xl border border-olive/15 bg-cream-elevated p-6 shadow-sm sm:p-8">
        <p className="flex items-center gap-2 font-heading text-lg font-bold text-forest">
          <CheckCircle2 className="size-5 text-olive" aria-hidden />
          Aspirasi terkirim
        </p>
        <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-olive">
          Terima kasih. Aspirasimu masuk ke pengurus dan akan dibaca. Kalau ditanggapi dan layak
          dibagikan, aspirasi ini akan muncul di daftar di bawah beserta jawabannya.
        </p>
        <button
          type="button"
          onClick={() => {
            dibukaRef.current = Date.now()
            setStatus('diam')
          }}
          className="mt-5 rounded-xl border border-olive/30 px-5 py-2.5 text-sm font-medium text-forest transition-colors duration-200 hover:bg-olive/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          Kirim aspirasi lagi
        </button>
      </div>
    )
  }

  const sisa = PANJANG_ISI_MAKSIMUM - isi.length
  const belumLengkap = judul.trim().length < 4 || !kategori || isi.trim().length < 10

  return (
    <form
      onSubmit={kirim}
      className="rounded-2xl border border-olive/15 bg-cream-elevated p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-forest text-gold"
        >
          <PenLine className="size-5" />
        </span>
        <div>
          <h2 className="font-heading text-xl font-bold text-forest">Tulis Aspirasi</h2>
          <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-olive">
            Sampaikan aspirasimu secara anonim. Pengurus tidak pernah tahu siapa pengirimnya.
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="kategori-aspirasi" className={LABEL}>
            Kategori
          </label>
          <select
            id="kategori-aspirasi"
            name="kategori"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            required
            className={`${ISIAN} mt-2`}
          >
            <option value="">Pilih kategori</option>
            {KATEGORI_ASPIRASI.map((k) => (
              <option key={k.nilai} value={k.nilai}>
                {k.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="judul-aspirasi" className={LABEL}>
            Judul
          </label>
          <input
            id="judul-aspirasi"
            name="judul"
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            required
            minLength={4}
            maxLength={PANJANG_JUDUL_MAKSIMUM}
            placeholder="Tuliskan judul singkat"
            className={`${ISIAN} mt-2`}
          />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="isi-aspirasi" className={LABEL}>
          Isi Aspirasi
        </label>
        <textarea
          id="isi-aspirasi"
          name="isi"
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
          required
          minLength={10}
          maxLength={PANJANG_ISI_MAKSIMUM}
          rows={5}
          aria-describedby="sisa-karakter"
          aria-invalid={galat ? true : undefined}
          placeholder="Contoh: AC di lab TI lantai 2 sudah lama tidak dingin, mohon dicek."
          className={`${ISIAN} mt-2 resize-y`}
        />
        <p id="sisa-karakter" className="mt-2 font-aksen text-xs text-olive">
          {sisa} karakter tersisa
        </p>
      </div>

      {/* Honeypot: bukan untuk manusia. Disembunyikan di luar layar, dijauhkan
          dari urutan tab, dan diberi tahu pembaca layar untuk mengabaikannya. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden"
      >
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

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <button
          type="submit"
          disabled={status === 'mengirim' || belumLengkap}
          // Saat nonaktif tombolnya berganti warna, bukan sekadar diredupkan:
          // gold ber-opacity 50% berubah jadi kuning kusam yang terbaca
          // seperti salah warna, bukan seperti tombol yang belum siap.
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-forest shadow-sm transition duration-200 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-olive/15 disabled:text-olive disabled:shadow-none disabled:hover:brightness-100 motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
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

        {/* Bukan saklar yang bisa dimatikan: form ini memang tidak pernah
            meminta identitas, jadi menampilkannya sebagai centang aktif yang
            terkunci lebih jujur ketimbang pilihan yang sebenarnya semu. */}
        <p className="inline-flex items-center gap-2 rounded-xl border border-olive/25 bg-olive/5 px-3.5 py-2 text-xs font-medium text-olive">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          Dikirim sebagai anonim — identitasmu tidak pernah diminta
        </p>
      </div>

      {galat && (
        <p role="alert" className="mt-4 text-sm font-medium text-destructive">
          {galat}
        </p>
      )}
    </form>
  )
}
