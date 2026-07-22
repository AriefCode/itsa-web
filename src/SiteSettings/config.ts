import type { GlobalConfig } from 'payload'

import { authenticated } from '../access/authenticated'

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
                  name: 'akhiran',
                  type: 'text',
                  label: 'Akhiran',
                  admin: {
                    description: 'Opsional, ditempel di belakang angka. Contoh: + atau %.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
