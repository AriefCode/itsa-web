/**
 * Konfigurasi PM2 untuk Website ITSA.
 *
 * Berekstensi .cjs, bukan .js — package.json memakai "type": "module",
 * sehingga berkas .js diperlakukan sebagai ESM sementara PM2 menuntut
 * CommonJS.
 *
 * Pemakaian di server:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save && pm2 startup      # supaya hidup lagi setelah server reboot
 *   pm2 logs itsa-web
 *
 * Jalankan `npx payload migrate` dan `npm run build` LEBIH DULU. PM2 hanya
 * menyalakan hasil build; ia tidak membangun apa pun.
 */

module.exports = {
  apps: [
    {
      name: 'itsa-web',

      // Memakai `npm start` supaya perilakunya sama persis dengan yang
      // dijalankan manual, termasuk cross-env di dalam script-nya.
      // `--` meneruskan argumen di belakangnya ke `next start`.
      script: 'npm',
      args: 'start -- --hostname 127.0.0.1 --port 3000',

      // Direktori kerja harus akar proyek: Next membaca .env dari sini, dan
      // DATABASE_URL berisi jalur relatif (file:./itsa-web.db).
      cwd: __dirname,

      /**
       * MODE FORK — SATU PROSES. JANGAN diubah ke cluster.
       *
       * Pembatasan laju pengiriman aspirasi disimpan di sebuah Map di memori
       * proses (src/app/(frontend)/next/aspirasi/route.ts). Map itu tidak
       * dibagi antar proses.
       *
       * Kalau mode diubah menjadi 'cluster' dengan N instance, tiap instance
       * punya hitungannya sendiri, sehingga batas efektifnya menjadi 5 x N
       * kiriman per 10 menit — bukan 5. Dengan 4 instance, pembatasan lajunya
       * melonggar empat kali lipat tanpa satu pun tanda di log.
       *
       * Kalau suatu saat memang perlu cluster (situs ini kecil, kemungkinan
       * besar tidak akan perlu), pindahkan hitungan itu ke Redis lebih dulu,
       * ATAU tegakkan batasnya di Nginx lewat limit_req_zone — lihat
       * deploy/nginx/itsa.pcr.ac.id.conf.
       */
      exec_mode: 'fork',
      instances: 1,

      env: {
        // Menentukan tiga hal sekaligus:
        //   1. cookie sesi admin diberi flag Secure (collections/Users)
        //   2. Payload tidak melakukan push skema — skema datang dari migrasi
        //   3. Next melayani hasil build produksi
        NODE_ENV: 'production',
      },

      // Nilai lain (PAYLOAD_SECRET, DATABASE_URL, TRUSTED_IP_HEADER, dst)
      // sengaja TIDAK ditaruh di sini. Berkas ini ter-commit ke repo publik;
      // rahasia hanya boleh ada di .env pada server, yang tidak ikut git.

      // Situs sekecil ini tidak seharusnya memakai memori sebanyak itu.
      // Kalau tercapai, hampir pasti ada kebocoran — restart menyelamatkan
      // layanan, tapi tetap periksa lognya.
      max_memory_restart: '512M',

      // Kalau proses mati berulang kali dalam waktu singkat, berhenti mencoba
      // supaya lognya tidak tenggelam dan masalahnya kelihatan.
      max_restarts: 10,
      min_uptime: '30s',
      restart_delay: 4000,

      // Beri waktu permintaan yang sedang berjalan untuk selesai saat restart.
      kill_timeout: 10000,

      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
}
