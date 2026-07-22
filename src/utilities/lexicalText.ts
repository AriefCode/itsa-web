/**
 * Menarik teks polos dari struktur rich text Lexical.
 *
 * Dipakai untuk cuplikan singkat (kartu, ringkasan), bukan untuk merender isi
 * lengkap. Untuk tampilan penuh dengan format, pakai komponen RichText.
 */
export function ambilTeks(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as { text?: string; children?: unknown[]; root?: unknown }
  if (n.root) return ambilTeks(n.root)
  if (typeof n.text === 'string') return n.text
  if (Array.isArray(n.children)) return n.children.map(ambilTeks).join(' ')
  return ''
}

/**
 * Memecah rich text jadi daftar paragraf berupa teks polos.
 *
 * Dipakai saat isi yang sama perlu ditampilkan sebagai beberapa langkah
 * (mis. recap kegiatan yang dirender sebagai timeline), bukan sebagai satu
 * blok. Paragraf kosong dibuang supaya baris kosong di editor tidak jadi
 * langkah hampa.
 */
export function ambilParagraf(node: unknown): string[] {
  if (!node || typeof node !== 'object') return []
  const n = node as { root?: { children?: unknown[] }; children?: unknown[] }
  const anak = n.root?.children ?? n.children
  if (!Array.isArray(anak)) return []
  return anak.map((blok) => ambilTeks(blok).replace(/\s+/g, ' ').trim()).filter(Boolean)
}

/** Memotong teks di batas kata terdekat supaya tidak terputus di tengah kata. */
export function potongTeks(teks: string, maks: number): string {
  const bersih = teks.replace(/\s+/g, ' ').trim()
  if (bersih.length <= maks) return bersih
  const potong = bersih.slice(0, maks)
  const spasi = potong.lastIndexOf(' ')
  return `${(spasi > 0 ? potong.slice(0, spasi) : potong).replace(/[.,;:]$/, '')}...`
}
