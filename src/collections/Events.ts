import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'

/**
 * Kegiatan ITSA.
 *
 * Satu dokumen Event menyalakan empat tampilan sekaligus (lihat CLAUDE.md):
 * timeline Kegiatan, tampilan Kalender, blok recap di Home, dan halaman
 * detail /kegiatan/[slug]. Jadi field di sini sengaja lengkap — jangan bikin
 * collection terpisah untuk recap.
 */
export const Events: CollectionConfig<'events'> = {
  slug: 'events',
  labels: {
    singular: 'Kegiatan',
    plural: 'Kegiatan',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    // Draft hanya terlihat pengurus yang login; publik cuma lihat yang published.
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'judul',
    defaultColumns: ['judul', 'tanggalMulai', 'status', 'lokasi', 'divisi'],
    description:
      'Kegiatan himpunan. Satu entri dipakai bersama oleh timeline, kalender, dan halaman detail.',
  },
  // Terbaru dulu, supaya kegiatan yang relevan ada di atas daftar admin.
  defaultSort: '-tanggalMulai',
  // Dipakai saat Event direferensikan dari tempat lain (mis. blok recap Home).
  defaultPopulate: {
    judul: true,
    slug: true,
    tanggalMulai: true,
    status: true,
    thumbnail: true,
    lokasi: true,
    gratis: true,
    htm: true,
  },
  fields: [
    {
      name: 'judul',
      type: 'text',
      required: true,
      label: 'Judul Kegiatan',
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Detail',
          fields: [
            {
              name: 'thumbnail',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Thumbnail',
              admin: {
                description: 'Gambar utama di kartu kegiatan dan halaman detail.',
              },
            },
            {
              name: 'lokasi',
              type: 'text',
              required: true,
              label: 'Lokasi',
              admin: {
                description:
                  'Contoh: Aula PCR, Lab TI Gedung C, atau "Online (Zoom)" kalau daring.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'gratis',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Kegiatan ini gratis',
                  admin: { width: '50%' },
                },
                {
                  name: 'htm',
                  type: 'number',
                  min: 0,
                  label: 'HTM (Rp)',
                  admin: {
                    width: '50%',
                    step: 1000,
                    // Pola yang sama dengan tab Dokumentasi & Recap: field baru
                    // muncul kalau memang relevan.
                    condition: (data) => data?.gratis === false,
                    description: 'Harga tiket masuk per peserta, angka saja tanpa titik.',
                  },
                  // Kalau tidak gratis, harga wajib diisi — mencegah kegiatan
                  // berbayar tayang tanpa mencantumkan biaya.
                  validate: (value: number | null | undefined, { siblingData }: any) => {
                    if (siblingData?.gratis) return true
                    if (value === null || value === undefined)
                      return 'Isi HTM, atau centang "Kegiatan ini gratis".'
                    return true
                  },
                },
              ],
            },
            {
              name: 'deskripsi',
              type: 'richText',
              required: true,
              label: 'Deskripsi',
            },
          ],
        },
        {
          label: 'Dokumentasi & Recap',
          // Field di tab ini baru relevan setelah kegiatan selesai.
          fields: [
            {
              name: 'linkDokumentasi',
              type: 'text',
              label: 'Link Dokumentasi (Google Drive)',
              admin: {
                description:
                  'URL folder Google Drive berisi foto/video kegiatan. Pastikan izin akses sudah "anyone with the link".',
                condition: (data) => data?.status === 'completed',
              },
              validate: (value: string | null | undefined) => {
                if (!value) return true
                return /^https?:\/\//.test(value)
                  ? true
                  : 'Link harus diawali http:// atau https://'
              },
            },
            {
              name: 'recap',
              type: 'richText',
              label: 'Recap',
              admin: {
                description:
                  'Ringkasan setelah kegiatan selesai. Tampil di halaman detail dan blok recap di Home.',
                condition: (data) => data?.status === 'completed',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'upcoming',
      label: 'Status',
      options: [
        { label: 'Akan Datang', value: 'upcoming' },
        { label: 'Selesai', value: 'completed' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Diatur manual. Ingat mengubahnya jadi "Selesai" setelah kegiatan lewat, kalau tidak kegiatan lama akan terus tampil sebagai akan datang.',
      },
    },
    {
      name: 'tanggalMulai',
      type: 'date',
      required: true,
      label: 'Tanggal Mulai',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'tanggalSelesai',
      type: 'date',
      label: 'Tanggal Selesai',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Kosongkan kalau kegiatan hanya satu hari.',
      },
      validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => {
        const mulai = siblingData?.tanggalMulai
        if (!value || !mulai) return true
        return new Date(value as string) >= new Date(mulai as string)
          ? true
          : 'Tanggal selesai tidak boleh sebelum tanggal mulai.'
      },
    },
    {
      name: 'divisi',
      type: 'relationship',
      relationTo: 'divisi',
      required: true,
      label: 'Divisi Penyelenggara',
      admin: {
        position: 'sidebar',
      },
    },
    slugField({ useAsSlug: 'judul' }),
  ],
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
}
