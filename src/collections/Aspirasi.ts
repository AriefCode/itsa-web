import type { CollectionConfig, FieldAccess } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/**
 * Aspirasi anonim dari warga TI.
 *
 * Ini satu-satunya collection yang boleh ditulis publik, jadi aturannya
 * berbeda dari yang lain:
 *
 * - SIAPA PUN boleh membuat (form anonim, tanpa login).
 * - Publik hanya boleh MEMBACA aspirasi yang sudah ditandai tampil oleh
 *   pengurus. Yang belum dimoderasi tidak bocor ke API publik.
 * - Field moderasi (tanggapan & status tampil) dikunci di level FIELD, bukan
 *   cuma collection. Tanpa itu, siapa pun bisa menyertakan status_tampil:true
 *   di body POST dan menerbitkan aspirasinya sendiri tanpa moderasi.
 *
 * Tanggal pengiriman memakai `createdAt` bawaan Payload, bukan field terpisah,
 * supaya pengirim anonim tidak bisa memalsukan tanggal.
 */

/** Hanya pengurus yang login boleh menyentuh field ini. */
const hanyaPengurus: FieldAccess = ({ req: { user } }) => Boolean(user)

export const Aspirasi: CollectionConfig<'aspirasi'> = {
  slug: 'aspirasi',
  labels: {
    singular: 'Aspirasi',
    plural: 'Aspirasi',
  },
  access: {
    // Form publik: tidak perlu login untuk mengirim.
    create: anyone,
    // Pengurus melihat semua; publik hanya yang sudah dimoderasi.
    read: ({ req: { user } }) => {
      if (user) return true
      return { status_tampil: { equals: true } }
    },
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'isi',
    defaultColumns: ['isi', 'status_tampil', 'createdAt'],
    description:
      'Kiriman anonim dari warga TI. Tandai "Tampilkan di situs" setelah ditanggapi.',
  },
  defaultSort: '-createdAt',
  fields: [
    {
      name: 'isi',
      type: 'textarea',
      required: true,
      maxLength: 2000,
      label: 'Isi Aspirasi',
      admin: {
        description: 'Ditulis oleh pengirim anonim. Ubah hanya untuk menyensor hal yang tidak pantas.',
      },
    },
    {
      name: 'status_tampil',
      type: 'checkbox',
      defaultValue: false,
      label: 'Tampilkan di situs',
      access: {
        // Publik tidak boleh menerbitkan aspirasinya sendiri.
        create: hanyaPengurus,
        update: hanyaPengurus,
      },
      admin: {
        position: 'sidebar',
        description:
          'Default mati. Centang setelah aspirasi ditanggapi dan layak tampil di halaman publik.',
      },
    },
    {
      name: 'respon_komentar',
      type: 'textarea',
      label: 'Tanggapan Pengurus',
      access: {
        create: hanyaPengurus,
        update: hanyaPengurus,
      },
      admin: {
        description: 'Jawaban pengurus yang tampil di bawah aspirasi ini.',
      },
    },
    {
      name: 'respon_foto',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto Tanggapan',
      access: {
        create: hanyaPengurus,
        update: hanyaPengurus,
      },
      admin: {
        description: 'Opsional. Misalnya bukti tindak lanjut atau dokumentasi.',
      },
    },
  ],
}
