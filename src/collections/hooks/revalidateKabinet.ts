import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

/**
 * Menyegarkan halaman Kabinet setelah Pengurus atau Divisi diubah.
 *
 * Tanpa hook ini, menambah pengurus atau divisi baru di panel admin tidak
 * terlihat sampai 10 menit kemudian: halaman /kabinet memakai
 * `export const revalidate = 600`, jadi hasil render-nya dibekukan selama itu.
 * Gejalanya persis seperti data yang gagal tersimpan — padahal datanya sudah
 * masuk, cuma halamannya yang masih versi lama.
 *
 * Divisi ikut dipasangi hook yang sama karena kartu divisi (nama, deskripsi,
 * urutan) juga ikut ter-render di halaman itu.
 */
const segarkan = (payload: { logger: { info: (pesan: string) => void } }) => {
  payload.logger.info('Menyegarkan cache halaman Kabinet')
  revalidatePath('/kabinet')
}

export const revalidateKabinet: CollectionAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) segarkan(payload)
  return doc
}

export const revalidateKabinetSetelahHapus: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) segarkan(payload)
  return doc
}
