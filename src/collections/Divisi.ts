import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { OPSI_IKON } from '../components/home/ikonOpsi'
import {
  revalidateKabinet,
  revalidateKabinetSetelahHapus,
} from './hooks/revalidateKabinet'


/**
 * Divisi kepengurusan ITSA.
 *
 * Dipakai sebagai pengelompok di halaman Kabinet (grid pengurus per divisi)
 * dan sebagai penanda penyelenggara di Kegiatan. Karena dua collection lain
 * merujuk ke sini, buat isinya lebih dulu sebelum mengisi Pengurus/Kegiatan.
 */
export const Divisi: CollectionConfig<'divisi'> = {
  hooks: {
    afterChange: [revalidateKabinet],
    afterDelete: [revalidateKabinetSetelahHapus],
  },
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
  // dapat datanya tanpa query tambahan.
  //
  // `urutan`, `deskripsi_singkat`, dan `ikon` WAJIB ada di sini: halaman Kabinet
  // mengurutkan divisi memakai `urutan` dan menampilkan deskripsinya, sementara
  // section Divisi di beranda menampilkan ikonnya. Tanpa ini, relasi divisi
  // hanya membawa nama dan sisanya hilang tanpa pesan error.
  defaultPopulate: {
    nama: true,
    slug: true,
    urutan: true,
    deskripsi_singkat: true,
    ikon: true,
  },
  fields: [
    {
      name: 'nama',
      type: 'text',
      required: true,
      label: 'Nama Divisi',
    },
    {
      name: 'deskripsi_singkat',
      type: 'textarea',
      required: true,
      label: 'Deskripsi Singkat',
      admin: {
        description:
          'Satu-dua kalimat, tampil di bawah judul divisi pada halaman Kabinet & beranda.',
      },
    },
    {
      name: 'ikon',
      type: 'select',
      label: 'Ikon',
      options: OPSI_IKON,
      admin: {
        description: 'Ikon yang mewakili divisi di section Divisi beranda.',
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
