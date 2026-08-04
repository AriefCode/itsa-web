import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: {
    cookies: {
      // Cookie sesi hanya diberi flag Secure di produksi.
      //
      // Tanpa Secure, peramban bersedia mengirim cookie ini lewat HTTP polos.
      // Di jaringan kampus, satu permintaan http:// yang tak sengaja sudah
      // cukup untuk membocorkan sesi — dan setiap akun yang bisa login adalah
      // admin penuh, jadi taruhannya besar.
      //
      // Dikondisikan, BUKAN dipatok true: saat `next dev` situs berjalan di
      // http://localhost. Chrome dan Firefox memberi pengecualian untuk
      // localhost, tapi tidak semua peramban begitu — mengunci ini ke true
      // berarti mempertaruhkan kemampuan login di laptop pengembang pada
      // kemurahan hati peramban. NODE_ENV diisi Next sendiri: 'development'
      // saat `next dev`, 'production' saat `next start`.
      //
      // httpOnly sudah dipatok true oleh Payload dan tidak bisa dimatikan;
      // sameSite sudah 'Lax' dari default. Keduanya tidak perlu diatur di sini
      // — default tetap termerge meski `auth` berbentuk objek.
      secure: process.env.NODE_ENV === 'production',
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
  timestamps: true,
}
