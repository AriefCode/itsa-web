# Website ITSA

Website resmi **ITSA** (Information Technology Student Association), himpunan mahasiswa Teknologi Informasi Politeknik Caltex Riau.

Berisi profil himpunan, kegiatan, kabinet pengurus, berita, dan kanal aspirasi anonim.

**Tech stack:** Next.js (App Router, TypeScript) + Payload CMS dalam satu repo, database SQLite, Tailwind CSS.

---

## Daftar Isi

- [Persiapan awal](#persiapan-awal)
- [Menjalankan di komputer sendiri](#menjalankan-di-komputer-sendiri)
- [Struktur proyek](#struktur-proyek)
- [Alur kontribusi](#alur-kontribusi)
- [Aturan penulisan kode](#aturan-penulisan-kode)
- [Masalah yang sering muncul](#masalah-yang-sering-muncul)

---

## Persiapan awal

Yang perlu terpasang di komputermu:

| Kebutuhan | Versi | Cara cek |
| --- | --- | --- |
| Node.js | 20.9 ke atas | `node -v` |
| npm | bawaan Node | `npm -v` |
| Git | apa saja | `git --version` |

> **Catatan:** proyek ini memakai **npm**, bukan pnpm. Beberapa script bawaan template masih menyebut `pnpm`; abaikan dan pakai `npm`.

Kamu juga butuh akses ke repositori. Kalau belum punya, minta pengurus pemegang repo menambahkanmu sebagai kolaborator.

---

## Menjalankan di komputer sendiri

### 1. Ambil kodenya

```bash
git clone git@github.com:AriefCode/itsa-web.git
cd itsa-web
```

Kalau belum menyiapkan SSH key di GitHub, pakai HTTPS:

```bash
git clone https://github.com/AriefCode/itsa-web.git
```

### 2. Pasang dependensi

```bash
npm install
```

### 3. Siapkan berkas `.env`

```bash
cp .env.example .env
```

Buka `.env`, lalu isi `PAYLOAD_SECRET` dengan nilai acak:

```bash
openssl rand -hex 32
```

Salin hasilnya ke `PAYLOAD_SECRET`. Isi juga `CRON_SECRET` dan `PREVIEW_SECRET` dengan cara yang sama.

> **`.env` tidak boleh di-commit.** Berkas ini sudah masuk `.gitignore`. Isinya berbeda di tiap komputer dan memuat kunci rahasia.

### 4. Jalankan

```bash
npm run dev
```

Buka <http://localhost:3000>.

### 5. Buat akun admin pertama

Database yang baru dibuat masih kosong, termasuk daftar penggunanya.

1. Buka <http://localhost:3000/admin>
2. Payload menampilkan form **"Create first user"**
3. Isi email dan password, lalu simpan

Akun ini hanya ada di database lokalmu. Setiap orang membuat akunnya sendiri.

> **Ingat password-mu.** Reset password lewat email belum diaktifkan, jadi satu-satunya cara pulih adalah menghapus berkas `itsa-web.db` dan mulai dari nol.

### 6. Isi data contoh

Database lokalmu kosong, jadi banyak halaman menampilkan pesan "belum ada data". Itu normal. Isi beberapa data lewat `/admin` supaya halaman ada isinya.

Urutan pengisian yang disarankan, karena saling bergantung:

1. **Media** — unggah beberapa gambar dulu
2. **Divisi** — Kegiatan dan Pengurus wajib menunjuk ke sebuah divisi
3. **Pengurus** dan **Kegiatan**
4. **FAQ**, **Berita**, **Pengaturan Situs**

---

## Struktur proyek

```
src/
├── app/
│   ├── (frontend)/          # Halaman yang dilihat pengunjung
│   │   ├── page.tsx         # Beranda
│   │   ├── kegiatan/        # Daftar dan detail kegiatan
│   │   └── kabinet/         # Daftar pengurus
│   └── (payload)/           # Panel admin, dibuat otomatis
├── collections/             # Definisi data: Events, Pengurus, Divisi, Faq, ...
├── components/              # Komponen React
├── Header/  Footer/         # Navbar dan footer, terhubung ke panel admin
├── SiteSettings/            # Pengaturan global situs
├── utilities/               # Fungsi bantu
└── payload.config.ts        # Konfigurasi utama Payload
```

Dua berkas acuan di root yang **wajib dibaca sebelum ngoding**:

- **`CLAUDE.md`** — konteks proyek, rencana build, dan aturan kerja
- **`DESIGN.md`** — sistem desain: warna, tipografi, komponen

---

## Alur kontribusi

Alur di bawah dipakai untuk semua perubahan, sekecil apa pun.

### Langkah 1: Pastikan `main` terbaru

Tarik perubahan terakhir dulu supaya tidak bekerja di atas kode usang.

```bash
git checkout main
git pull origin main
```

### Langkah 2: Buat branch baru

**Jangan pernah ngoding langsung di `main`.** Buat branch sendiri untuk tiap pekerjaan.

```bash
git checkout -b jenis/nama-singkat
```

Format nama branch:

| Awalan | Untuk | Contoh |
| --- | --- | --- |
| `feat/` | fitur baru | `feat/halaman-aspirasi` |
| `fix/` | perbaikan bug | `fix/kalender-bulan-kosong` |
| `style/` | perubahan tampilan saja | `style/rapikan-footer` |
| `docs/` | dokumentasi | `docs/panduan-deploy` |
| `refactor/` | rapikan kode tanpa ubah perilaku | `refactor/pisah-util-tanggal` |

### Langkah 3: Ngoding

Jalankan `npm run dev` dan kerjakan perubahanmu.

Sebelum commit, pastikan tidak ada error tipe:

```bash
npx tsc --noEmit
```

### Langkah 4: Commit

Commit per satu perubahan yang utuh. Jangan menumpuk banyak hal berbeda dalam satu commit.

```bash
git add .
git status          # cek dulu apa saja yang akan masuk
git commit -m "feat(aspirasi): tambah form kirim aspirasi anonim"
```

Format pesan commit:

```
jenis(bagian): penjelasan singkat pakai huruf kecil
```

Contoh yang baik:

```
feat(kabinet): tambah pemilih periode kepengurusan
fix(kegiatan): perbaiki urutan timeline yang terbalik
style(footer): sejajarkan kolom navigasi
```

Kalau perlu penjelasan lebih panjang, tulis di baris terpisah setelah satu baris kosong. **Jelaskan _kenapa_, bukan _apa_** — bagian "apa" sudah terlihat dari diff.

### Langkah 5: Push branch-mu

```bash
git push -u origin nama-branch-mu
```

`-u` cukup sekali di push pertama. Selanjutnya `git push` saja.

### Langkah 6: Buka Pull Request

1. Buka repositori di GitHub
2. Akan muncul tawaran **"Compare & pull request"**, klik itu
3. Beri judul yang jelas dan jelaskan isi perubahanmu
4. Kalau mengubah tampilan, **lampirkan screenshot**
5. Klik **Create pull request**

Tunggu direview. Kalau ada permintaan perbaikan, lanjutkan commit di branch yang sama lalu push lagi; PR ikut ter-update otomatis.

### Langkah 7: Setelah PR digabung

```bash
git checkout main
git pull origin main
git branch -d nama-branch-mu
```

---

## Aturan penulisan kode

- **Jangan hardcode warna.** Pakai token yang sudah ada (`bg-forest`, `text-cream`, `bg-gold`) sesuai `DESIGN.md`. Jangan tulis `#143a28` langsung di komponen.
- **Ikuti pola yang sudah ada.** Sebelum bikin komponen baru, lihat komponen serupa dan tiru gayanya.
- **Jaga aksesibilitas.** Semua gambar punya `alt`, tombol bisa dijangkau keyboard, kontras teks memadai.
- **Setelah mengubah collection**, jalankan `npm run generate:types` supaya tipe TypeScript ikut ter-update.
- **Tulis komentar untuk hal yang tidak jelas dari kodenya.** Jelaskan alasan, jangan mengulang isi kode.

---

## Masalah yang sering muncul

### `npm run dev` diam saja, halaman lama sekali dimuat

Kemungkinan besar Payload sedang menunggu jawaban di terminal. Kalau kamu mengubah struktur collection, Payload bertanya:

```
· You're about to delete ... column
DATA LOSS WARNING: Accept warnings and push schema to database? › (y/N)
```

Lihat terminal tempat `npm run dev` berjalan dan jawab pertanyaannya. Selama belum dijawab, server tidak melayani permintaan dengan normal.

Kalau ragu jawabannya, **jangan asal ketik `y`** — tanya dulu, karena bisa menghapus data.

### Panel admin tidak bisa login, muncul "Failed to fetch"

Nilai `NEXT_PUBLIC_SERVER_URL` di `.env` tidak cocok dengan port yang dipakai. Samakan keduanya, lalu:

```bash
rm -rf .next
npm run dev
```

Folder `.next` harus dihapus karena nilai `NEXT_PUBLIC_*` sudah ikut tertanam di hasil build sebelumnya.

### Port 3000 sudah dipakai

```bash
# Linux / macOS
pkill -f "next dev"
```

Atau jalankan di port lain, tapi ingat menyesuaikan `NEXT_PUBLIC_SERVER_URL` (lihat masalah di atas).

### Perubahan collection tidak muncul di panel admin

Hentikan server, jalankan `npm run generate:types`, lalu jalankan ulang `npm run dev`.

### Berkas `itsa-web.db` muncul di `git status`

Seharusnya tidak, karena sudah masuk `.gitignore`. Kalau tetap muncul, berarti berkas itu terlanjur terlacak:

```bash
git rm --cached itsa-web.db
```

**Database tidak boleh di-commit.** Isinya berbeda di tiap komputer dan memuat data pengguna.

---

## Perintah yang sering dipakai

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Jalankan server pengembangan |
| `npm run build` | Build untuk produksi |
| `npm run generate:types` | Regenerasi tipe setelah mengubah collection |
| `npm run lint` | Cek gaya penulisan kode |
| `npx tsc --noEmit` | Cek error tipe TypeScript |

---

## Butuh bantuan?

Buka **Issue** di GitHub, atau tanyakan langsung ke pengurus divisi Ristek.
