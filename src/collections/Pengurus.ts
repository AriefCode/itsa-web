import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import {
  revalidateKabinet,
  revalidateKabinetSetelahHapus,
} from './hooks/revalidateKabinet'


/**
 * Anggota kepengurusan ITSA — sumber data halaman Kabinet.
 *
 * Satu dokumen = satu orang pada satu periode. Kalau orang yang sama menjabat
 * lagi di periode berikutnya, buat dokumen baru; dengan begitu kabinet lama
 * tetap utuh dan bisa ditampilkan sebagai arsip.
 *
 * PERIODE diwarisi dari Divisi (tiap Divisi milik satu Periode), jadi tidak
 * perlu diisi manual di sini — pilih Divisi yang benar, periode ikut otomatis.
 */
export const Pengurus: CollectionConfig<'pengurus'> = {
  hooks: {
    afterChange: [revalidateKabinet],
    afterDelete: [revalidateKabinetSetelahHapus],
  },
  slug: 'pengurus',
  labels: {
    singular: 'Pengurus',
    plural: 'Pengurus',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'nama',
    defaultColumns: ['nama', 'jabatan', 'divisi', 'angkatan'],
    description: 'Anggota kepengurusan. Tampil di halaman Kabinet, dikelompokkan per divisi.',
  },
  // Grid Kabinet diurutkan berdasarkan divisi lalu urutan jabatan.
  defaultSort: 'urutan',
  fields: [
    {
      name: 'nama',
      type: 'text',
      required: true,
      label: 'Nama Lengkap',
    },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Foto',
      admin: {
        description:
          'Pakai rasio potret yang seragam (mis. 3:4) supaya grid Kabinet rapi.',
      },
    },
    {
      name: 'jabatan',
      type: 'text',
      required: true,
      label: 'Jabatan',
      admin: {
        description: 'Contoh: Ketua Umum, Sekretaris, Staff Divisi Media.',
      },
    },
    {
      name: 'divisi',
      type: 'relationship',
      relationTo: 'divisi',
      required: true,
      label: 'Divisi',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'angkatan',
      type: 'number',
      // Sengaja TIDAK required. Pengurus tidak memakai draft, jadi `required`
      // menghasilkan kolom NOT NULL — dan itu tidak bisa ditambahkan ke tabel
      // yang sudah berisi data tanpa nilai default, sehingga schema push
      // berhenti di prompt "DATA LOSS WARNING" dan menggantungkan dev server.
      // Setelah semua Pengurus terisi angkatannya, ini aman dijadikan required.
      label: 'Angkatan',
      admin: {
        position: 'sidebar',
        description: 'Tahun masuk kuliah, contoh: 2023.',
      },
      validate: (value: number | null | undefined) => {
        if (value === null || value === undefined) return true
        return value >= 2000 && value <= new Date().getFullYear() + 1
          ? true
          : 'Angkatan harus berupa tahun yang masuk akal, contoh 2023.'
      },
    },
    {
      // USANG: periode kini diturunkan dari Divisi (lihat catatan di atas file).
      // Field ini disembunyikan dari admin dan tidak lagi dipakai frontend, tapi
      // KOLOMNYA sengaja dipertahankan agar tidak memicu migrasi destruktif
      // (drop kolom = prompt "DATA LOSS" yang menggantungkan dev server).
      // `defaultValue` + `hidden` membuat pembuatan Pengurus baru tetap jalan
      // tanpa perlu mengisinya. Aman dihapus total di pembersihan terpisah.
      name: 'periode',
      type: 'text',
      required: true,
      label: 'Periode (usang)',
      defaultValue: String(new Date().getFullYear()),
      admin: {
        hidden: true,
        position: 'sidebar',
        description: 'Tidak dipakai lagi — periode mengikuti Divisi.',
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
        description: 'Urutan dalam divisi. Ketua/koordinator biasanya 1.',
      },
    },
    {
      name: 'sosial',
      type: 'group',
      label: 'Media Sosial',
      admin: {
        description: 'Semua opsional. Yang dikosongkan tidak akan tampil ikonnya.',
      },
      fields: [
        {
          name: 'instagram',
          type: 'text',
          label: 'Instagram',
          admin: { description: 'Username saja, tanpa @. Contoh: itsa.pcr' },
        },
        {
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn',
          admin: { description: 'URL lengkap profil LinkedIn.' },
        },
        {
          name: 'github',
          type: 'text',
          label: 'GitHub',
          admin: { description: 'Username saja.' },
        },
      ],
    },
  ],
}
