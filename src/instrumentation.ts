/**
 * Pemeriksaan konfigurasi saat proses start.
 *
 * Next.js memanggil `register()` sekali ketika server dinyalakan, jadi ini
 * tempat yang tepat untuk menolak konfigurasi yang berbahaya SEBELUM ada
 * permintaan yang dilayani. Pemeriksaan yang sama kalau hanya ditaruh di level
 * modul baru meledak saat modulnya pertama kali di-import — yaitu saat
 * pengunjung pertama datang, bukan saat deploy.
 *
 * Aturannya: yang membuat sistem tidak aman → berhenti keras. Yang membuat
 * sistem terlalu ketat tapi tetap aman → peringatan mencolok.
 */

const garis = '='.repeat(72)

export async function register(): Promise<void> {
  // Hook ini juga dijalankan untuk runtime edge; pemeriksaan di bawah hanya
  // relevan untuk proses Node yang benar-benar melayani permintaan.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  // --- Berhenti keras: tanpa ini token anti-spam tidak bisa ditandatangani ---
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error(
      [
        '',
        garis,
        'KONFIGURASI TIDAK LENGKAP: PAYLOAD_SECRET kosong.',
        '',
        'Dipakai untuk menandatangani token anti-spam aspirasi dan mengamankan',
        'sesi Payload. Tanpa nilai ini token bisa ditempa siapa pun.',
        '',
        'Buat nilai acak lalu isikan ke .env:',
        '  openssl rand -hex 32',
        garis,
        '',
      ].join('\n'),
    )
  }

  const headerIp = process.env.TRUSTED_IP_HEADER?.trim().toLowerCase()

  // --- Peringatan: konfigurasi tidak aman, diabaikan aplikasi ---
  if (headerIp === 'x-forwarded-for' || headerIp === 'forwarded') {
    console.warn(
      [
        '',
        garis,
        `PERINGATAN: TRUSTED_IP_HEADER diisi "${headerIp}" — nilai ini DIABAIKAN.`,
        '',
        'Header tersebut berisi daftar beruas koma yang boleh ditambahi klien,',
        'sehingga pengirim bisa mengarang alamat sebanyak yang ia mau dan',
        'pembatasan lajunya lolos begitu saja.',
        '',
        'Aplikasi memperlakukannya seolah TRUSTED_IP_HEADER kosong: tidak ada',
        'header yang dibaca, semua pengunjung berbagi satu jatah.',
        '',
        'Pakai header yang DITIMPA proxy, bukan yang ditambahi:',
        '  TRUSTED_IP_HEADER=x-real-ip         (Nginx)',
        '  TRUSTED_IP_HEADER=cf-connecting-ip  (Cloudflare)',
        '',
        'Lihat README bagian "Deploy".',
        garis,
        '',
      ].join('\n'),
    )
    return
  }

  // --- Peringatan: aman tapi membuat pembatasan laju berlaku global ---
  if (!headerIp) {
    console.warn(
      [
        '',
        garis,
        'PERINGATAN: TRUSTED_IP_HEADER belum diisi.',
        '',
        'Pembatasan laju pengiriman aspirasi tidak bisa membedakan pengirim,',
        'sehingga SELURUH pengunjung berbagi satu jatah 5 kiriman / 10 menit.',
        'Situs tetap aman — tapi orang bisa saling menghabiskan jatah.',
        '',
        'Isi sesuai topologi yang benar-benar berjalan:',
        '  TRUSTED_IP_HEADER=x-real-ip         (Nginx, dengan',
        '                                       proxy_set_header X-Real-IP $remote_addr;)',
        '  TRUSTED_IP_HEADER=cf-connecting-ip  (ada Cloudflare di depan Nginx)',
        '',
        'JANGAN diisi kalau tidak ada proxy yang menimpa header tersebut:',
        'header yang tidak ditimpa proxy dikirim langsung oleh klien, sehingga',
        'pembatasan lajunya bisa dilewati dengan mengganti-ganti nilainya.',
        '',
        'Lihat README bagian "Deploy".',
        garis,
        '',
      ].join('\n'),
    )
  }
}
