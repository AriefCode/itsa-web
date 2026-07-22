import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  access: {
    read: () => true,
  },
  admin: {
    description:
      'Tautan sosial media footer diambil dari Pengaturan Situs, bukan diatur di sini.',
  },
  fields: [
    {
      name: 'tentang',
      type: 'textarea',
      label: 'Tentang Singkat',
      maxLength: 300,
      admin: {
        description: 'Satu-dua kalimat tentang ITSA, tampil di kolom pertama footer.',
      },
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Tautan Navigasi',
      maxRows: 6,
      fields: [
        link({
          appearances: false,
        }),
      ],
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'kontak',
      type: 'group',
      label: 'Kontak',
      fields: [
        {
          name: 'alamat',
          type: 'textarea',
          label: 'Alamat',
          admin: { description: 'Contoh: Jl. Umbansari No. 1, Rumbai, Pekanbaru.' },
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
