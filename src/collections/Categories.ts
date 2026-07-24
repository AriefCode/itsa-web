import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { OPSI_IKON } from '../components/home/ikonOpsi'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'seksi', 'urutan'],
  },
  // Ikon, urutan, dan penanda seksi ikut terbawa saat kategori direferensikan
  // dari Posts, supaya halaman Berita bisa merender seksi per kategori tanpa
  // query tambahan.
  defaultPopulate: {
    title: true,
    slug: true,
    ikon: true,
    seksi: true,
    urutan: true,
    deskripsi: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'deskripsi',
      type: 'text',
      label: 'Deskripsi Singkat',
      admin: { description: 'Opsional. Tampil di bawah judul seksi pada halaman Berita.' },
    },
    {
      name: 'ikon',
      type: 'select',
      label: 'Ikon',
      options: OPSI_IKON,
      admin: { description: 'Ikon di sebelah judul seksi kategori pada halaman Berita.' },
    },
    {
      name: 'seksi',
      type: 'checkbox',
      label: 'Tampilkan sebagai seksi di halaman Berita',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Kalau dicentang, kategori ini punya blok tersendiri di halaman Berita. Kalau tidak, hanya jadi label pada kartu.',
      },
    },
    {
      name: 'urutan',
      type: 'number',
      label: 'Urutan',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Angka kecil tampil lebih dulu.' },
    },
    slugField({
      position: undefined,
    }),
  ],
}
