import React from 'react'
import { PenLine } from 'lucide-react'

/**
 * Tombol mengambang "Tulis Aspirasi".
 *
 * Berupa <a> ke anchor form, bukan tombol ber-JavaScript: gulirannya sudah
 * ditangani browser (halus atau langsung, mengikuti setelan gerak pengguna
 * lewat aturan di globals.css), tetap jalan tanpa JS, dan pengguna bisa
 * membukanya di tab baru kalau mau.
 *
 * Disembunyikan dari pembaca layar lewat aria-hidden karena tautan yang sama
 * persis sudah ada di hero dan di sidebar; menyuarakannya tiga kali cuma
 * menambah kebisingan tanpa menambah jalan.
 */
export const TombolMengambang: React.FC = () => (
  <a
    href="#tulis-aspirasi"
    aria-hidden
    tabIndex={-1}
    className="fixed bottom-5 right-5 z-40 inline-flex size-16 flex-col items-center justify-center gap-0.5 rounded-full bg-gold text-center text-[10px] font-bold leading-tight text-forest shadow-lg transition duration-200 hover:scale-105 hover:brightness-105 active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:size-auto sm:flex-row sm:gap-2 sm:px-5 sm:py-3.5 sm:text-sm"
  >
    <PenLine className="size-5 sm:size-4" aria-hidden />
    <span className="sm:whitespace-nowrap">Tulis Aspirasi</span>
  </a>
)
