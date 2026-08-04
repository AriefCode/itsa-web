import type { PayloadRequest } from 'payload'
import { getPayload } from 'payload'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import configPromise from '@payload-config'

export type PreviewSearchParams = {
  path: string
  previewSecret: string
}

/**
 * Path pratinjau yang aman diteruskan ke `redirect()`.
 *
 * "Diawali garis miring" saja tidak cukup. `//evil.com` dan `/\evil.com`
 * lolos pemeriksaan itu, tapi peramban memperlakukan keduanya sebagai alamat
 * EKSTERNAL: `//host` adalah URL protokol-relatif, dan garis miring terbalik
 * dinormalkan menjadi garis miring biasa. Next tidak menyaringnya —
 * `redirect()` hanya meneruskan nilainya apa adanya ke header `Location`
 * (lihat next/dist/client/components/redirect.js:51-53).
 *
 * Jadi syaratnya: diawali `/`, dan karakter berikutnya BUKAN `/` maupun `\`.
 * Path `/` tunggal tetap lolos.
 */
const pathAman = (p: string): boolean => /^\/(?![/\\])/.test(p)

export async function GET(req: NextRequest): Promise<Response> {
  const payload = await getPayload({ config: configPromise })

  const { searchParams } = new URL(req.url)

  const path = searchParams.get('path')
  const previewSecret = searchParams.get('previewSecret')

  // Rahasia yang tidak diset ATAU kosong tidak boleh dianggap cocok dengan apa
  // pun. Tanpa penjagaan ini, PREVIEW_SECRET bernilai '' membuat '' !== ''
  // bernilai salah, sehingga ?previewSecret= lolos begitu saja.
  const rahasia = process.env.PREVIEW_SECRET
  if (!rahasia || previewSecret !== rahasia) {
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  if (!path) {
    return new Response('Insufficient search params', { status: 404 })
  }

  if (!pathAman(path)) {
    return new Response('This endpoint can only be used for relative previews', { status: 500 })
  }

  try {
    const { user } = await payload.auth({
      req: req as unknown as PayloadRequest,
      headers: req.headers,
    })

    const draft = await draftMode()

    // payload.auth() mengembalikan AuthResult — SEBUAH OBJEK, bahkan untuk
    // pengunjung anonim. Sebelumnya hasilnya ditampung utuh lalu diperiksa
    // `if (!user)`, yang tidak pernah bernilai benar sehingga penolakannya
    // menjadi kode mati dan siapa pun pemegang PREVIEW_SECRET bisa menyalakan
    // draft mode tanpa login. Yang menentukan ada di `.user`.
    if (!user) {
      draft.disable()
      return new Response('You are not allowed to preview this page', { status: 403 })
    }

    draft.enable()
  } catch (error) {
    payload.logger.error({ err: error }, 'Error verifying token for live preview')
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  redirect(path)
}
