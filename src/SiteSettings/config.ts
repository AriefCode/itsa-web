import type { GlobalConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'
import { OPSI_IKON } from '../components/home/ikonOpsi'

/**
 * Pengaturan situs yang dipakai lintas halaman.
 *
 * Isinya hal yang cuma ada satu di seluruh situs: tautan media sosial (footer)
 * dan angka statistik (band stat counter di Home, DESIGN.md §4).
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Pengaturan Situs',
  access: {
    read: () => true,
    update: authenticated,
  },
  admin: {
    description: 'Tautan sosial media dan angka statistik yang tampil di Home & footer.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Beranda',
          description: 'Bagian paling atas halaman depan. Kosongkan untuk memakai teks bawaan.',
          fields: [
            {
              name: 'hero',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'judul',
                  type: 'text',
                  label: 'Judul Hero',
                  admin: {
                    description: 'Singkat dan tegas, idealnya di bawah 8 kata.',
                  },
                },
                {
                  name: 'judul_aksen',
                  type: 'text',
                  label: 'Aksen Judul (disorot gold)',
                  admin: {
                    description:
                      'Potongan akhir judul yang ditampilkan warna gold. Contoh: "Teknologi Informasi.". Kosongkan kalau tak perlu.',
                  },
                },
                {
                  name: 'subjudul',
                  type: 'textarea',
                  label: 'Subjudul',
                  maxLength: 160,
                  admin: {
                    description: 'Satu kalimat penjelas, maksimal sekitar 20 kata.',
                  },
                },
                {
                  name: 'gambar',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Foto Latar Hero',
                  admin: {
                    description:
                      'Foto lebar (landscape) di belakang teks hero. Sebaiknya agak gelap agar teks terbaca. Kalau kosong, hero tampil hijau polos.',
                  },
                },
                {
                  name: 'video_url',
                  type: 'text',
                  label: 'Link Video Profil',
                  admin: {
                    description:
                      'URL YouTube video profil ITSA untuk tombol "Lihat Perjalanan Kami". Kosongkan untuk menyembunyikan tombolnya.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Tentang',
          description: 'Section "Tentang ITSA" di beranda. Kosongkan untuk menyembunyikannya.',
          fields: [
            {
              name: 'tentang',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'judul',
                  type: 'text',
                  label: 'Judul',
                  admin: { description: 'Contoh: "Lebih dari sekadar organisasi."' },
                },
                {
                  name: 'paragraf',
                  type: 'textarea',
                  label: 'Paragraf',
                  maxLength: 400,
                  admin: { description: 'Satu paragraf pendek yang menjelaskan ITSA.' },
                },
                {
                  name: 'gambar',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Foto',
                  admin: { description: 'Foto kebersamaan/kegiatan untuk mendampingi teks.' },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'kartu_judul',
                      type: 'text',
                      label: 'Judul Kartu Sorot',
                      admin: {
                        width: '40%',
                        description: 'Kartu kecil melayang di atas foto. Contoh: "Komunitas Solid".',
                      },
                    },
                    {
                      name: 'kartu_teks',
                      type: 'text',
                      label: 'Teks Kartu Sorot',
                      admin: { width: '60%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Kabinet',
          description: 'Foto yang tampil bergantian di bagian atas halaman Kabinet.',
          fields: [
            {
              name: 'kabinet',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'foto_hero',
                  type: 'array',
                  label: 'Foto Sorotan Kabinet',
                  labels: { singular: 'Foto', plural: 'Foto' },
                  maxRows: 8,
                  admin: {
                    description:
                      'Foto kebersamaan/panitia lengkap, ditampilkan bergantian sebagai carousel di hero Kabinet. Rasio lanskap (16:9). Kalau kosong, hero memakai mozaik foto pengurus.',
                  },
                  fields: [
                    {
                      name: 'gambar',
                      type: 'upload',
                      relationTo: 'media',
                      required: true,
                      label: 'Foto',
                    },
                    {
                      name: 'keterangan',
                      type: 'text',
                      label: 'Keterangan',
                      admin: { description: 'Opsional. Teks kecil di pojok foto.' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Media Sosial',
          description: 'Kosongkan yang tidak dipakai — ikonnya tidak akan tampil di footer.',
          fields: [
            {
              name: 'sosial',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'instagram',
                  type: 'text',
                  label: 'Instagram',
                  admin: { description: 'Username saja, tanpa @. Contoh: itsa.pcr' },
                },
                {
                  name: 'tiktok',
                  type: 'text',
                  label: 'TikTok',
                  admin: { description: 'Username saja, tanpa @.' },
                },
                {
                  name: 'youtube',
                  type: 'text',
                  label: 'YouTube',
                  admin: { description: 'URL lengkap channel.' },
                },
                {
                  name: 'linkedin',
                  type: 'text',
                  label: 'LinkedIn',
                  admin: { description: 'URL lengkap halaman.' },
                },
                {
                  name: 'email',
                  type: 'email',
                  label: 'Email Kontak',
                },
              ],
            },
          ],
        },
        {
          label: 'Statistik',
          description:
            'Angka yang dianimasikan di Home. Isi seperlunya — tampilannya paling rapi di 3 sampai 4 angka.',
          fields: [
            {
              name: 'statistik',
              type: 'array',
              label: 'Angka Statistik',
              maxRows: 4,
              labels: { singular: 'Angka', plural: 'Angka' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      label: 'Label',
                      admin: {
                        width: '60%',
                        description: 'Contoh: Anggota Aktif, Kegiatan Tahun Ini.',
                      },
                    },
                    {
                      name: 'nilai',
                      type: 'number',
                      required: true,
                      min: 0,
                      label: 'Nilai',
                      admin: { width: '40%', description: 'Angka saja.' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'akhiran',
                      type: 'text',
                      label: 'Akhiran',
                      admin: {
                        width: '30%',
                        description: 'Ditempel di belakang angka. Contoh: + atau %.',
                      },
                    },
                    {
                      name: 'ikon',
                      type: 'select',
                      label: 'Ikon',
                      options: OPSI_IKON,
                      admin: { width: '70%', description: 'Ikon kecil di atas angka.' },
                    },
                  ],
                },
                {
                  name: 'sub',
                  type: 'text',
                  label: 'Sub-keterangan',
                  admin: {
                    description: 'Baris kecil di bawah label. Contoh: "Bergabung & bertumbuh bersama".',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
}
