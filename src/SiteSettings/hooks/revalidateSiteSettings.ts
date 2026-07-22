import type { GlobalAfterChangeHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Menyegarkan cache setelah Pengaturan Situs diubah.
 *
 * Tanpa hook ini situs akan terus menampilkan versi lama tanpa batas waktu:
 * getCachedGlobal membungkus pembacaan global dengan unstable_cache yang hanya
 * kedaluwarsa ketika tag-nya di-revalidasi. Header dan Footer sudah punya hook
 * serupa; Pengaturan Situs sempat terlewat, sehingga mengubah teks hero,
 * tautan sosial, atau angka statistik di panel admin tidak pernah terlihat di
 * halaman depan.
 *
 * Beranda ikut di-revalidasi karena di situlah hero dan band statistik tampil.
 */
export const revalidateSiteSettings: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Menyegarkan cache Pengaturan Situs')
    revalidateTag('global_site-settings', 'max')
    revalidatePath('/')
  }

  return doc
}
