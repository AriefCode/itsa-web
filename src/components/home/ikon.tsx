import {
  Users,
  Megaphone,
  Cpu,
  Lightbulb,
  Palette,
  HeartHandshake,
  CalendarDays,
  LayoutGrid,
  Trophy,
  Star,
  Rocket,
  BookOpen,
  Code2,
  Camera,
  Laptop,
  Newspaper,
  type LucideIcon,
} from 'lucide-react'

/**
 * Registri ikon bersama untuk konten yang dikelola di admin (Divisi, Statistik).
 *
 * Field Payload hanya menyimpan teks, jadi admin memilih sebuah kunci (lihat
 * `ikonOpsi.ts`) dan frontend menerjemahkannya ke komponen lucide di sini.
 */
export const IKON: Record<string, LucideIcon> = {
  anggota: Users,
  komunikasi: Megaphone,
  teknologi: Cpu,
  wirausaha: Lightbulb,
  'minat-bakat': Palette,
  sosial: HeartHandshake,
  kalender: CalendarDays,
  divisi: LayoutGrid,
  prestasi: Trophy,
  bintang: Star,
  roket: Rocket,
  buku: BookOpen,
  kode: Code2,
  kamera: Camera,
  akademik: Laptop,
  berita: Newspaper,
}

/** Ambil komponen ikon dari kunci; jatuh ke `bintang` kalau kunci tak dikenal. */
export const ikonDari = (kunci?: string | null): LucideIcon => IKON[kunci ?? ''] ?? Star
