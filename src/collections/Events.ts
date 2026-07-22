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
 *
 * CATATAN STATUS: `status` TIDAK disimpan di database. Dia dihitung dari
 * tanggal setiap kali dibaca, supaya tidak pernah basi gara-gara pengurus
 * lupa mengubahnya. Konsekuensinya `status` tidak bisa dipakai untuk query
 * atau sort — frontend memfilter Upcoming/Completed lewat `tanggal_selesai`
 * (lihat helper `hitungStatus` di bawah).
 */

/**
 * Kegiatan dianggap selesai kalau tanggal berakhirnya sudah lewat.
 *
 * Mengembalikan teks berbahasa Indonesia karena field ini murni untuk dibaca
 * manusia di panel admin. Frontend JANGAN membandingkan string ini — hitung
 * sendiri dari tanggal (lihat catatan status di atas), supaya tidak rapuh
 * kalau kalimatnya diubah.
 */
const hitungStatus = (tanggalMulai?: unknown, tanggalSelesai?: unknown): string => {
  const akhir = tanggalSelesai || tanggalMulai
  if (!akhir) return 'Akan Datang'
  const waktu = new Date(akhir as string).getTime()
  if (Number.isNaN(waktu)) return 'Akan Datang'
  return waktu < Date.now() ? 'Selesai' : 'Akan Datang'
}

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
    defaultColumns: ['judul', 'tanggal_mulai', 'lokasi', 'divisi'],
    description:
      'Kegiatan himpunan. Satu entri dipakai bersama oleh timeline, kalender, dan halaman detail.',
  },
  // Terbaru dulu, supaya kegiatan yang relevan ada di atas daftar admin.
  defaultSort: '-tanggal_mulai',
  // Dipakai saat Event direferensikan dari tempat lain (mis. blok recap Home).
  defaultPopulate: {
    judul: true,
    slug: true,
    tanggal_mulai: true,
    tanggal_selesai: true,
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
          // Field di tab ini muncul sendiri begitu tanggal kegiatan sudah lewat.
          // Kondisinya menghitung ulang dari tanggal (bukan dari field status)
          // karena status tidak lagi disimpan.
          fields: [
            {
              name: 'link_dokumentasi',
              type: 'text',
              label: 'Link Dokumentasi (Google Drive)',
              admin: {
                description:
                  'URL folder Google Drive berisi foto/video kegiatan. Pastikan izin akses sudah "anyone with the link".',
                condition: (data) => {
                  const akhir = data?.tanggal_selesai || data?.tanggal_mulai
                  return akhir ? new Date(akhir).getTime() < Date.now() : false
                },
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
                condition: (data) => {
                  const akhir = data?.tanggal_selesai || data?.tanggal_mulai
                  return akhir ? new Date(akhir).getTime() < Date.now() : false
                },
              },
            },
          ],
        },
      ],
    },
    {
      // Virtual: dihitung saat dibaca, tidak pernah tersimpan. Lihat catatan
      // di atas file soal kenapa dan apa konsekuensinya buat query.
      name: 'status',
      type: 'text',
      virtual: true,
      label: 'Status',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Dihitung otomatis dari tanggal. Tidak perlu (dan tidak bisa) diubah manual.',
      },
      hooks: {
        afterRead: [({ data }) => hitungStatus(data?.tanggal_mulai, data?.tanggal_selesai)],
      },
    },
    {
      name: 'tanggal_mulai',
      type: 'date',
      required: true,
      label: 'Tanggal Mulai',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'tanggal_selesai',
      type: 'date',
      label: 'Tanggal Selesai',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Kosongkan kalau kegiatan hanya satu hari.',
      },
      validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => {
        const mulai = siblingData?.tanggal_mulai
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
    slugField({
      useAsSlug: 'judul',
      // Tahun ikut masuk ke slug supaya kegiatan tahunan yang judulnya sama
      // ("Workshop Git" 2026 & 2027) tidak bentrok di index unik.
      slugify: ({ data, valueToSlugify }) => {
        // Sumbernya SELALU judul, bukan valueToSlugify. Saat dokumen disunting,
        // Payload mengirim slug yang sudah ada sebagai valueToSlugify; kalau
        // itu dipakai sebagai dasar, tahunnya menempel lagi di tiap penyuntingan
        // dan menghasilkan slug seperti "mubes-2026-2026-2026".
        const sumber = String(data?.judul ?? valueToSlugify ?? '')
        const dasar = sumber
          .toLowerCase()
          .trim()
          .replace(/&/g, ' dan ')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          // Buang tahun di ujung judul, supaya "Mubes 2026" tidak jadi
          // "mubes-2026-2026" setelah tahunnya ditambahkan di bawah.
          .replace(/-(19|20)\d{2}$/, '')

        if (!dasar) return dasar

        const mulai = data?.tanggal_mulai
        const tahun = mulai ? new Date(mulai as string).getFullYear() : null
        return tahun && !Number.isNaN(tahun) ? `${dasar}-${tahun}` : dasar
      },
    }),
  ],
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
}
