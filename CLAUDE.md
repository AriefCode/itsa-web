# CLAUDE.md — Website ITSA

File ini dibaca otomatis oleh Claude Code tiap sesi. Isinya konteks & aturan proyek. Sistem desain ada di `DESIGN.md` (di root repo yang sama) — selalu ikuti keduanya.

## Proyek
Website untuk **ITSA (Information Technology Student Association)** di Politeknik Caltex Riau — himpunan mahasiswa Teknologi Informasi. Situs berisi profil, kegiatan, kabinet, berita, dan aspirasi. Ini proyek besar pertama pemiliknya: **tulis kode bersih & maintainable, jelaskan tiap langkah, kerja dalam langkah kecil yang bisa direview, dan berhenti untuk konfirmasi sebelum lanjut ke fase berikutnya.**

## Tech stack (final)
- Next.js (App Router, TypeScript)
- Payload CMS di dalam app Next.js yang sama (**satu repo**)
- Database **SQLite** (`@payloadcms/db-sqlite`)
- Tailwind untuk styling
- Deploy: **VPS Linux kampus** (Node + PM2 + Nginx + HTTPS), subdomain `itsa.pcr.ac.id`

## Skill Payload (bawaan template — JANGAN dihapus)
Scaffold sudah menyertakan skill Payload CMS resmi di `.claude/skills/payload/`. Mulai dari `.claude/skills/payload/SKILL.md` untuk referensi cepat, lalu `.claude/skills/payload/reference/` untuk dokumentasi detail. **Selalu konsultasi skill ini saat bekerja dengan Payload** supaya kodenya benar & up-to-date.

## Basis proyek (template Website Payload)
Di-scaffold dari **template Website** Payload — jadi kita **mengadaptasi**, bukan mulai dari kosong.
- **Pakai ulang bawaan:** `Posts` → jadikan **News** (pakai `Categories` bawaan untuk Oprec/Prestasi/Umum); `Pages` (layout builder) → untuk **About** & halaman fleksibel; `Media` & `Users` dipakai apa adanya; global `Header`/`Footer` → atur navbar & footer di sini.
- **Bersihkan konten demo** bawaan template di awal.
- **Theme bawaan di-reshape** ke `DESIGN.md` (hijau-dominan) — bukan bikin dari nol.

## Desain
Ikuti `DESIGN.md`. Ringkas: **hijau-dominan 70/20/10, latar gelap teks terang**. Inspirasi tampilan & animasi: hmtc-its.com. Jangan hardcode warna — pakai token Tailwind sesuai DESIGN.md. Kalau ragu, tanya dulu sebelum menyimpang.

## Tools desain (pihak ketiga — dipakai)
Dua alat bantu aktif. **`DESIGN.md` tetap sumber kebenaran** — output kedua alat ini WAJIB diselaraskan ke palet hijau & aturan kita; kalau bentrok, DESIGN.md menang.
- **taste-skill** (di `.claude/skills/`): dipakai saat styling / reshaping UI biar gak generik — bantu hierarki, spacing, tipografi, motion. Panggil saat menggarap tampilan sebuah halaman. Jangan biarkan estetika generiknya menimpa brand ITSA; dia buat memperbaiki *eksekusi*, bukan mengganti arah.
- **21st.dev**: registry komponen React + Tailwind. Dipakai saat butuh komponen jadi (hero beranimasi, card, navbar, timeline). Ambil dari 21st.dev lalu **adaptasi** ke palet & stack kita (komponennya berbasis shadcn/Radix — sesuaikan, jangan telan mentah). Jangan tambah dependency berat kalau tak perlu.

## Navbar
Home · About · Kegiatan · Kabinet · News + tombol **Aspirasi** yang menonjol. FAQ ada di footer + blok ringkas di Home (tidak di navbar).

## Halaman
- **Home** — splash, hero, stat counter, recaps terbaru, kegiatan mendatang, FAQ ringkas.
- **About** — visi & misi (sejarah ketua/quote pendiri: nanti).
- **Kegiatan** — timeline dengan filter Upcoming/Completed + tampilan Kalender.
- **Detail Event** (`/kegiatan/[slug]`) — deskripsi, link dokumentasi Google Drive, recap (kalau completed).
- **Kabinet** — grid pengurus per divisi, pagination, deskripsi divisi singkat.
- **News** — feed dengan kategori Oprec/Prestasi/Umum; post Oprec nge-link ke Google Form eksternal.
- **FAQ** — accordion lengkap.
- **Aspirasi** — form anonim + tampilan aspirasi yang direspons pengurus (foto + komentar).
- **/admin** — panel Payload, otomatis; login khusus pengurus.

## Data model (Payload collections)
Prinsip: **satu objek Event** menyalakan timeline, kalender, recap home, dan halaman detail. Sebagian numpang bawaan template (lihat Basis proyek); yang lain ditambah baru.
- **Event** (baru): judul, slug, tanggal_mulai, tanggal_selesai, status (upcoming/completed), divisi, deskripsi (rich text), thumbnail, link_dokumentasi (gdrive), recap.
- **Pengurus** (baru): nama, foto, jabatan, divisi, sosial, periode.
- **Divisi** (baru): nama, deskripsi_singkat, urutan.
- **News** = `Posts` bawaan + kategori (Oprec/Prestasi/Umum via `Categories`) + link_eksternal (buat Oprec).
- **FAQ** (baru): pertanyaan, jawaban, urutan.
- **Aspirasi** (baru): isi (anonim), tanggal, respon_foto, respon_komentar, status_tampil.
- **About** = `Pages` bawaan (layout builder). **Site Settings** (baru/global): link sosmed, angka statistik.

## Konvensi / guardrail
- **Satu halaman/fitur per sesi.** Jangan bangun seluruh situs sekaligus; selesai → review → lanjut.
- **Commit ke git** setelah tiap langkah yang jalan.
- **Access control:** konten publik boleh dibaca; menulis hanya admin login; Aspirasi = publik boleh membuat (anonim), hanya admin yang merespons/menampilkan.
- Jaga aksesibilitas: kontras benar, `alt` di gambar, fokus keyboard.
- Kalau tampilan kurang pas, minta deskripsi spesifik dari pemilik (mis. "hero terlalu polos, tiru gaya hero HMTC ITS").

## Urutan build (fase)
1. **Adaptasi & fondasi** (lihat Bootstrap di bawah).
2. **Home** — hero, stat counter, recaps preview, kegiatan mendatang, FAQ ringkas.
3. **Kegiatan** — timeline + filter + detail event (gdrive, recap) + kalender.
4. **Kabinet** — grid per divisi, pagination, deskripsi divisi.
5. **News** — filter kategori; Oprec → tombol Google Form.
6. **About & FAQ**.
7. **Aspirasi** — submit anonim + tampilan respons (moderasi via admin).
8. **Poles** — animasi, responsif/mobile, aksesibilitas, SEO dasar, konten contoh.
9. **Deploy** — build produksi, PM2, Nginx reverse proxy, HTTPS. Setelah spesifikasi server kampus dikonfirmasi.

## Bootstrap (Fase 1 — adaptasi & fondasi)
Proyek sudah di-scaffold dari **template Website** + opsi Claude Code. Jalankan langkah ini, berhenti untuk dijelaskan & direview:
1. Pastikan `.claude/skills/payload/`, `CLAUDE.md`, dan `DESIGN.md` ada di root. `npm install`; init git kalau belum.
2. Salin `.env.example` → `.env`; set `PAYLOAD_SECRET` dan `DATABASE_URI` (SQLite). Pastikan `npm run dev` jalan & `/admin` kebuka (bikin user admin pertama).
3. **Reshape theme bawaan** ke `DESIGN.md`: ganti token warna Tailwind jadi palet kita (forest `#143a28`, cream `#fff7e6`, gold `#ffd500`, olive `#576238`, elevasi `#1c4a34`) + font Plus Jakarta Sans (heading) & Inter (body) via `next/font`. Terapkan aturan kontras & rasio 70/20/10.
4. **Rekonsiliasi data model:** bersihkan konten demo; atur `Posts` → News (tambah kategori Oprec/Prestasi/Umum + link_eksternal), pakai `Pages` untuk About; **tambah** collections baru: Event, Pengurus, Divisi, FAQ, Aspirasi + global Site Settings.
5. **Atur navbar & footer** lewat global `Header`/`Footer` sesuai DESIGN.md (hijau, bersih, tombol Aspirasi gold); tambah overlay **splash video** (sekali per sesi, ada skip).
6. Pastikan situs jalan di `localhost:3000` dan `/admin` berfungsi. Lalu **berhenti** dan tunjukkan hasil.
