/**
 * Daftar kunci ikon sebagai teks murni — sengaja tanpa impor lucide-react.
 *
 * Dipakai dua tempat: field `select` di Payload config (server, tidak boleh
 * menarik komponen React ke bundle config) dan registri komponen di `ikon.tsx`.
 * Memisahnya di sini menjaga config tetap ringan sekaligus satu sumber kebenaran
 * untuk deretan pilihan.
 */
export const OPSI_IKON: { label: string; value: string }[] = [
  { label: 'Anggota / orang', value: 'anggota' },
  { label: 'Komunikasi / pengeras suara', value: 'komunikasi' },
  { label: 'Teknologi / chip', value: 'teknologi' },
  { label: 'Wirausaha / ide', value: 'wirausaha' },
  { label: 'Minat & bakat / palet', value: 'minat-bakat' },
  { label: 'Sosial / uluran tangan', value: 'sosial' },
  { label: 'Kalender', value: 'kalender' },
  { label: 'Divisi / kotak', value: 'divisi' },
  { label: 'Prestasi / piala', value: 'prestasi' },
  { label: 'Bintang', value: 'bintang' },
  { label: 'Roket', value: 'roket' },
  { label: 'Buku', value: 'buku' },
  { label: 'Kode', value: 'kode' },
  { label: 'Kamera', value: 'kamera' },
  { label: 'Akademik / laptop', value: 'akademik' },
  { label: 'Berita / koran', value: 'berita' },
]
