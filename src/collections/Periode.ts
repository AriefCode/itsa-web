import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateKabinet, revalidateKabinetSetelahHapus } from './hooks/revalidateKabinet'

/**
 * Periode kepengurusan ITSA (mis. "2025/2026").
 *
 * Menjadi tulang punggung struktur yang bisa berbeda tiap tahun: setiap Divisi
 * milik satu Periode, dan Pengurus menempel ke Divisi tersebut. Dengan begitu
 * satu tahun bisa punya susunan divisi yang sama sekali beda dari tahun lain —
 * termasuk divisi yang berganti nama, dilebur, atau baru dibentuk — tanpa
 * merusak arsip kabinet lama.
 *
 * Halaman Kabinet menampilkan periode `aktif` secara default, dan tiap periode
 * punya URL sendiri (`?periode=<slug>`) supaya bisa dibagikan.
 */
export const Periode: CollectionConfig<'periode'> = {
  hooks: {
    afterChange: [revalidateKabinet],
    afterDelete: [revalidateKabinetSetelahHapus],
  },
  slug: 'periode',
  labels: {
    singular: 'Periode',
    plural: 'Periode',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'tahun_mulai', 'aktif', 'updatedAt'],
    description:
      'Tahun kepengurusan. Buat satu untuk tiap periode; tandai yang sedang berjalan sebagai Aktif.',
  },
  // Periode terbaru lebih dulu.
  defaultSort: '-tahun_mulai',
  // Dipakai saat Periode direferensikan dari Divisi, supaya frontend dapat
  // labelnya tanpa query tambahan.
  defaultPopulate: {
    label: true,
    slug: true,
    tahun_mulai: true,
    aktif: true,
    tagline: true,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      label: 'Label Periode',
      admin: {
        description: 'Contoh: 2025/2026. Ini yang tampil sebagai judul kabinet.',
      },
    },
    {
      name: 'tahun_mulai',
      type: 'number',
      required: true,
      label: 'Tahun Mulai',
      admin: {
        position: 'sidebar',
        description: 'Contoh: 2025. Dipakai untuk mengurutkan periode (terbaru dulu).',
      },
      validate: (value: number | null | undefined) => {
        if (value === null || value === undefined) return 'Tahun mulai wajib diisi.'
        return value >= 2000 && value <= new Date().getFullYear() + 1
          ? true
          : 'Tahun harus masuk akal, contoh 2025.'
      },
    },
    {
      name: 'aktif',
      type: 'checkbox',
      label: 'Periode Aktif',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Centang HANYA pada periode yang sedang berjalan. Ini yang tampil default di halaman Kabinet.',
      },
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline / Tema',
      admin: {
        description: 'Opsional. Motto atau tema kabinet periode ini. Tampil di bawah judul.',
      },
    },
    slugField({ useAsSlug: 'label' }),
  ],
}
