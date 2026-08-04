import { existsSync, readFileSync, statSync } from 'fs'
import path from 'path'

import { describe, expect, it } from 'vitest'

import { generateMeta } from '@/utilities/generateMeta'

/**
 * Regresi untuk FE-01: sisa string bawaan template Payload yang tayang publik.
 *
 * Dua masalah yang ditutup di sini:
 *
 * 1. Judul meta setiap Berita dan Halaman berakhiran "| Payload Website
 *    Template" — nama template, bukan ITSA, dan ikut terbaca mesin pencari.
 * 2. og:image cadangan menunjuk /website-template-OG.webp, berkas bawaan
 *    template yang TIDAK PERNAH ADA di public/. Akibatnya tiap berita tanpa
 *    gambar meta menghasilkan kartu pratinjau kosong saat dibagikan.
 */

const AKHIRAN = '| ITSA PCR'
const CADANGAN_JUDUL = 'ITSA - Information Technology Student Association'
const BERKAS_OG = 'itsa-og.webp'

const dok = (isi: Record<string, unknown>) => isi as Parameters<typeof generateMeta>[0]['doc']

describe('FE-01 — judul meta memakai identitas ITSA', () => {
  it('menambahkan akhiran ITSA pada dokumen yang punya meta.title', async () => {
    const meta = await generateMeta({ doc: dok({ meta: { title: 'Mubes 2026' } }) })
    expect(meta.title).toBe(`Mubes 2026 ${AKHIRAN}`)
  })

  it('memakai cadangan yang sama dengan layout saat meta.title kosong', async () => {
    const meta = await generateMeta({ doc: dok({ meta: {} }) })
    expect(meta.title).toBe(CADANGAN_JUDUL)
  })

  it('tidak menyisakan nama template di judul maupun openGraph', async () => {
    for (const doc of [dok({ meta: { title: 'Oprec Staff' } }), dok({}), null]) {
      const meta = await generateMeta({ doc })
      const teks = JSON.stringify(meta)
      expect(teks).not.toMatch(/Payload Website Template/i)
      expect(teks).not.toMatch(/website-template-OG/i)
    }
  })
})

describe('FE-01 — og:image cadangan', () => {
  const ambilOg = async (doc: Parameters<typeof generateMeta>[0]['doc']) => {
    const meta = await generateMeta({ doc })
    const images = meta.openGraph?.images
    const pertama = Array.isArray(images) ? images[0] : images
    return typeof pertama === 'object' && pertama && 'url' in pertama ? String(pertama.url) : ''
  }

  it('memakai berkas ITSA saat dokumen belum punya meta.image', async () => {
    expect(await ambilOg(dok({ meta: { title: 'Tanpa gambar' } }))).toMatch(
      new RegExp(`/${BERKAS_OG}$`),
    )
  })

  it('memakai gambar dokumen saat meta.image terisi', async () => {
    const og = await ambilOg(
      dok({ meta: { title: 'Ada gambar', image: { url: '/api/media/file/foto.webp' } } }),
    )
    expect(og).toMatch(/\/api\/media\/file\/foto\.webp$/)
    expect(og).not.toMatch(new RegExp(BERKAS_OG))
  })
})

/**
 * Inilah kelas bug yang membuat FE-01 lolos begitu lama: kode menunjuk berkas
 * yang tidak pernah ada, dan tidak ada yang memeriksanya. Test di bawah membaca
 * public/ langsung — bukan mempercayai komentar di kode.
 */
describe('FE-01 — berkas og cadangan benar-benar ada dan berukuran benar', () => {
  const berkas = path.resolve(process.cwd(), 'public', BERKAS_OG)

  it('berkasnya ada di public/', () => {
    expect(existsSync(berkas)).toBe(true)
  })

  it('berukuran 1200x630 sesuai anjuran og:image', () => {
    // Dibaca dari header WebP mentah supaya tidak bergantung pustaka gambar.
    const b = readFileSync(berkas)
    expect(b.toString('ascii', 0, 4)).toBe('RIFF')
    expect(b.toString('ascii', 8, 12)).toBe('WEBP')

    const chunk = b.toString('ascii', 12, 16)
    let lebar = 0
    let tinggi = 0
    if (chunk === 'VP8 ') {
      lebar = b.readUInt16LE(26) & 0x3fff
      tinggi = b.readUInt16LE(28) & 0x3fff
    } else if (chunk === 'VP8X') {
      lebar = b.readUIntLE(24, 3) + 1
      tinggi = b.readUIntLE(27, 3) + 1
    } else if (chunk === 'VP8L') {
      const bits = b.readUInt32LE(21)
      lebar = (bits & 0x3fff) + 1
      tinggi = ((bits >> 14) & 0x3fff) + 1
    }

    expect({ lebar, tinggi }).toEqual({ lebar: 1200, tinggi: 630 })
  })

  it('ukuran berkasnya wajar untuk dibagikan', () => {
    // Beberapa layanan bagikan menolak gambar di atas ~5 MB.
    expect(statSync(berkas).size).toBeLessThan(5 * 1024 * 1024)
  })
})
