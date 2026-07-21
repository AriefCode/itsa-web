import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/**
 * Anggota kepengurusan ITSA — sumber data halaman Kabinet.
 *
 * Satu dokumen = satu orang pada satu periode. Kalau orang yang sama menjabat
 * lagi di periode berikutnya, buat dokumen baru; dengan begitu kabinet lama
 * tetap utuh dan bisa ditampilkan sebagai arsip.
 */
export const Pengurus: CollectionConfig<'pengurus'> = {
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
    defaultColumns: ['nama', 'jabatan', 'divisi', 'periode'],
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
      name: 'periode',
      type: 'text',
      required: true,
      label: 'Periode',
      defaultValue: String(new Date().getFullYear()),
      admin: {
        position: 'sidebar',
        description: 'Contoh: 2025 atau 2025/2026. Dipakai untuk memisahkan kabinet antar tahun.',
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
