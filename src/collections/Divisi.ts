import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/**
 * Divisi kepengurusan ITSA.
 *
 * Dipakai sebagai pengelompok di halaman Kabinet (grid pengurus per divisi)
 * dan sebagai penanda penyelenggara di Kegiatan. Karena dua collection lain
 * merujuk ke sini, buat isinya lebih dulu sebelum mengisi Pengurus/Kegiatan.
 */
export const Divisi: CollectionConfig<'divisi'> = {
  slug: 'divisi',
  labels: {
    singular: 'Divisi',
    plural: 'Divisi',
  },
  access: {
    // Konten publik boleh dibaca siapa saja; menulis hanya pengurus yang login.
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'nama',
    defaultColumns: ['nama', 'urutan', 'updatedAt'],
    description: 'Daftar divisi. Urutan menentukan susunan tampil di halaman Kabinet.',
  },
  defaultSort: 'urutan',
  // Dipakai saat Divisi direferensikan dari Pengurus/Kegiatan, supaya frontend
  // dapat nama & slug tanpa perlu query tambahan.
  defaultPopulate: {
    nama: true,
    slug: true,
  },
  fields: [
    {
      name: 'nama',
      type: 'text',
      required: true,
      label: 'Nama Divisi',
    },
    {
      name: 'deskripsiSingkat',
      type: 'textarea',
      required: true,
      label: 'Deskripsi Singkat',
      admin: {
        description:
          'Satu-dua kalimat, tampil di bawah judul divisi pada halaman Kabinet.',
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
        description: 'Angka kecil tampil lebih dulu. Divisi inti biasanya 1, 2, 3, ...',
      },
    },
    slugField({ useAsSlug: 'nama' }),
  ],
}
