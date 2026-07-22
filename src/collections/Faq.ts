import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/**
 * Pertanyaan yang sering diajukan.
 *
 * Dipakai di halaman FAQ (accordion lengkap) dan blok FAQ ringkas di Home.
 * Home cukup mengambil beberapa entri teratas berdasarkan `urutan`.
 */
export const Faq: CollectionConfig<'faq'> = {
  slug: 'faq',
  labels: {
    singular: 'FAQ',
    plural: 'FAQ',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'pertanyaan',
    defaultColumns: ['pertanyaan', 'urutan', 'updatedAt'],
    description:
      'Pertanyaan umum. Urutan kecil tampil lebih dulu; beberapa teratas ikut muncul di Home.',
  },
  defaultSort: 'urutan',
  fields: [
    {
      name: 'pertanyaan',
      type: 'text',
      required: true,
      label: 'Pertanyaan',
    },
    {
      name: 'jawaban',
      type: 'richText',
      required: true,
      label: 'Jawaban',
      admin: {
        description:
          'Boleh pakai tautan, misalnya ke Google Form pendaftaran atau halaman Kegiatan.',
      },
    },
    {
      name: 'urutan',
      type: 'number',
      required: true,
      defaultValue: 0,
      label: 'Urutan',
      admin: {
        position: 'sidebar',
        description: 'Angka kecil tampil lebih dulu.',
      },
    },
  ],
}
