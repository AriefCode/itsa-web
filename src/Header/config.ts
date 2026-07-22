import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Navbar',
  access: {
    read: () => true,
  },
  admin: {
    description:
      'Menu navigasi utama. Kalau dikosongkan, situs memakai menu bawaan (Home, About, Kegiatan, Kabinet, News).',
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: 'Menu',
      // Lima menu utama; DESIGN.md §4 minta navbar tetap satu baris dan bersih.
      maxRows: 5,
      fields: [
        link({
          appearances: false,
        }),
      ],
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Tombol Aspirasi',
      admin: {
        description:
          'Tombol gold yang menonjol di kanan navbar. Kosongkan labelnya untuk menyembunyikan tombol.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Label',
              defaultValue: 'Aspirasi',
              admin: { width: '50%' },
            },
            {
              name: 'url',
              type: 'text',
              label: 'Tautan',
              defaultValue: '/aspirasi',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
