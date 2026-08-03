# Website ITSA

Website resmi **ITSA** (Information Technology Student Association), himpunan mahasiswa Teknologi Informasi Politeknik Caltex Riau.

Berisi profil himpunan, kegiatan, kabinet pengurus, berita, dan kanal aspirasi anonim.

**Tech stack:** Next.js (App Router, TypeScript) + Payload CMS dalam satu repo, database SQLite, Tailwind CSS.

---

## Daftar Isi

README ini dibagi dua. Pilih sesuai peranmu:

### 🧑‍💻 Untuk Programmer — mengembangkan kode situs

- [Persiapan awal](#persiapan-awal)
- [Menjalankan di komputer sendiri](#menjalankan-di-komputer-sendiri)
- [Struktur proyek](#struktur-proyek)
- [Alur kontribusi](#alur-kontribusi)
- [Aturan penulisan kode](#aturan-penulisan-kode)
- [Deploy](#deploy) — **wajib dibaca sebelum menayangkan ke server**
- [Masalah yang sering muncul](#masalah-yang-sering-muncul)
- [Perintah yang sering dipakai](#perintah-yang-sering-dipakai)

### 🧑‍💼 Untuk Admin / Pengurus — mengelola isi lewat `/admin`

- [Panduan Admin (`/admin`)](#panduan-admin-admin)
  - [Masuk ke panel](#masuk-ke-panel)
  - [Mengenal tata letak panel](#mengenal-tata-letak-panel)
  - [Koleksi dan fungsinya](#koleksi-dan-fungsinya)
  - [Panduan tiap koleksi](#panduan-tiap-koleksi) — Kegiatan, Pengurus, Divisi, Berita, FAQ, Aspirasi, Media, Kategori
  - [Pengaturan Situs, Header, dan Footer](#pengaturan-situs-header-dan-footer)
  - [Draft dan Terbit](#draft-dan-terbit)
  - [Menambah atau mengganti akun pengurus](#menambah-atau-mengganti-akun-pengurus)
  - [Etika dan tips mengisi konten](#etika-dan-tips-mengisi-konten)
  - [Masalah yang sering ditemui admin](#masalah-yang-sering-ditemui-admin)

> Programmer sebaiknya juga membaca Panduan Admin — kamu perlu paham cara pengurus memakai panel yang kamu bangun.

---

# 🧑‍💻 Bagian 1 — Panduan Programmer

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

## Deploy

Bagian ini **wajib dibaca sebelum menayangkan situs ke server**. Ada satu
pengaturan yang, kalau salah, membuat pembatasan laju pengiriman aspirasi bisa
dilewati — dan salahnya tidak kelihatan dari tampilan situs.

### Variabel environment di server

Selain yang sudah ada di `.env.example`, ada satu yang khusus untuk deploy:

| Variabel | Wajib? | Keterangan |
|---|---|---|
| `PAYLOAD_SECRET` | **Ya** | Menandatangani sesi admin dan token anti-spam aspirasi. Aplikasi **berhenti dengan error saat start** kalau kosong. Buat dengan `openssl rand -hex 32`. |
| `TRUSTED_IP_HEADER` | Tidak, tapi baca dulu | Nama header yang dipercaya sebagai alamat pengunjung. Bawaannya kosong. |

### `TRUSTED_IP_HEADER` — cara mengisinya

Pengiriman aspirasi dibatasi **5 kiriman per 10 menit per pengunjung**. Untuk
membedakan pengunjung, aplikasi perlu tahu alamat IP-nya. Masalahnya, aplikasi
Next.js tidak bisa membaca alamat socket secara langsung — satu-satunya sumber
adalah header HTTP, dan **header bisa dikirim siapa saja**.

Sebuah header hanya bisa dipercaya kalau ada proxy di depan yang **menimpanya**.
Karena itu variabel ini sengaja kosong secara bawaan, dan harus diisi sesuai
topologi yang **benar-benar berjalan**:

| Topologi | Isi dengan | Konfigurasi yang harus ada |
|---|---|---|
| Nginx saja | `x-real-ip` | `proxy_set_header X-Real-IP $remote_addr;` |
| Cloudflare → Nginx | `cf-connecting-ip` | Cloudflare menimpanya sendiri; **jangan** pakai `x-real-ip`, karena isinya jadi IP edge Cloudflare, bukan pengunjung |
| Tidak ada proxy | biarkan kosong | — |

`x-forwarded-for` dan `forwarded` **ditolak aplikasi** walau diisi. Keduanya
berisi daftar beruas koma yang boleh ditambahi klien, sehingga nilainya tidak
bisa dipakai sebagai identitas. Kalau tetap diisi, saat start muncul peringatan
dan nilainya diperlakukan seolah kosong.

> **Jangan mengisi variabel ini kalau tidak ada proxy yang menimpa header
> tersebut.** Header yang tidak ditimpa dikirim langsung oleh pengunjung,
> sehingga pembatasan lajunya bisa dilewati cukup dengan mengganti-ganti
> nilainya di tiap permintaan. Lebih baik dibiarkan kosong.

Kalau dibiarkan kosong, aplikasi **tidak membaca header apa pun** dan semua
pengunjung berbagi satu jatah. Situs tetap aman, tapi orang bisa saling
menghabiskan jatah. Saat start, akan muncul peringatan mencolok di log:

```
========================================================================
PERINGATAN: TRUSTED_IP_HEADER belum diisi.
...
========================================================================
```

Peringatan itu terbit dari `src/instrumentation.ts`. Kalau tidak muncul dan
tidak ada error, konfigurasinya sudah terbaca.

### Contoh blok Nginx

```nginx
server {
    server_name itsa.pcr.ac.id;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # WAJIB: menimpa header, bukan menambahkan. Inilah yang membuat
        # x-real-ip layak dipercaya oleh aplikasi.
        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header Host              $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        'upgrade';
    }
}
```

Pembatasan laju di tingkat aplikasi hanya lapis kedua. Lapis utamanya sebaiknya
di Nginx, karena di sanalah alamat asli benar-benar diketahui:

```nginx
limit_req_zone $binary_remote_addr zone=aspirasi:10m rate=30r/m;

location /next/aspirasi {
    limit_req zone=aspirasi burst=5 nodelay;
    proxy_pass http://127.0.0.1:3000;
}
```

### Catatan PM2

Hitungan pembatasan laju disimpan di memori proses. Kalau PM2 dijalankan dalam
mode **cluster** dengan N instance, tiap instance punya hitungannya sendiri
sehingga batas efektifnya menjadi 5 × N. Pakai mode `fork` (satu instance), atau
tegakkan batasnya di Nginx seperti contoh di atas.

### Smoke test setelah deploy

**Jalankan ini setiap kali selesai deploy atau mengubah konfigurasi Nginx.**

Test otomatis di repo membuktikan *logika* aplikasinya benar. Yang belum
dibuktikan siapa pun adalah apakah **Nginx di server ini** benar-benar menimpa
header IP-nya. Hanya bisa dipastikan dari luar, setelah situs tayang.

#### 1. Periksa log saat start

```bash
pm2 logs itsa-web --lines 50 | grep -A3 "PERINGATAN\|KONFIGURASI"
```

- Tidak ada keluaran → konfigurasi terbaca, lanjut ke langkah 2.
- Muncul `KONFIGURASI TIDAK LENGKAP` → proses berhenti, `PAYLOAD_SECRET` kosong.
- Muncul `PERINGATAN: TRUSTED_IP_HEADER ...` → baca isinya, betulkan, lalu
  `pm2 restart itsa-web`.

#### 2. Pastikan pembatasan laju tidak bisa dilewati

Skrip ini berpura-pura jadi penyerang: mengarang alamat IP yang berbeda di tiap
permintaan. Kalau Nginx menimpa headernya dengan benar, karangan itu tidak
berpengaruh dan kiriman keenam tetap ditolak.

```bash
SITUS=https://itsa.pcr.ac.id

# Ambil token dari halaman form — kiriman tanpa token yang sah akan ditolak
# lebih dulu, jadi ini memang harus diambil dari halaman sungguhan.
TOKEN=$(curl -s "$SITUS/aspirasi" | grep -oE '[0-9]{13}\.[a-f0-9]{64}' | head -1)
[ -n "$TOKEN" ] && echo "token didapat" || echo "GAGAL: token tidak ditemukan"

# Lewati ambang waktu-isi minimum (3 detik).
sleep 4

for i in $(seq 1 6); do
  printf 'kiriman %s -> ' "$i"
  curl -s -o /dev/null -w '%{http_code}\n' \
    -X POST "$SITUS/next/aspirasi" \
    -H 'Content-Type: application/json' \
    -H "X-Real-IP: 203.0.113.$i" \
    -H "X-Forwarded-For: 198.51.100.$i" \
    -d "{\"judul\":\"Uji smoke $i\",\"kategori\":\"lainnya\",\"isi\":\"Kiriman uji otomatis setelah deploy, mohon dihapus pengurus.\",\"token\":\"$TOKEN\"}"
done
```

**Yang benar:**

```
kiriman 1 -> 201
kiriman 2 -> 201
kiriman 3 -> 201
kiriman 4 -> 201
kiriman 5 -> 201
kiriman 6 -> 429     <-- ini yang dicari
```

**Kalau kiriman keenam juga `201`, konfigurasinya salah.** Artinya alamat IP
karangan tadi dipercaya, sehingga siapa pun bisa mengirim aspirasi tanpa batas.
Periksa:

1. `proxy_set_header X-Real-IP $remote_addr;` ada di blok `location` yang benar.
2. `TRUSTED_IP_HEADER` di `.env` server cocok dengan topologi
   (`cf-connecting-ip` kalau ada Cloudflare, bukan `x-real-ip`).
3. `pm2 restart itsa-web` sudah dijalankan setelah `.env` diubah — variabel
   environment hanya dibaca saat proses start.

Kalau semuanya `429` sejak kiriman pertama, berarti jatah untuk alamat itu sudah
terpakai. Tunggu 10 menit lalu ulangi.

> Skrip ini membuat **5 aspirasi sungguhan** di database. Hapus lewat
> `/admin` → Aspirasi setelah selesai menguji.

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

# 🧑‍💼 Bagian 2 — Panduan Admin

---

## Panduan Admin (`/admin`)

Bagian ini untuk **pengurus** yang mengelola isi situs — **tidak perlu bisa ngoding**. Semua yang tampil di situs (kegiatan, foto pengurus, berita, FAQ, aspirasi) diatur dari satu tempat: panel admin di alamat **`/admin`**.

Situs ITSA memakai **Payload CMS**. Anggap ia seperti "dashboard" tempat kamu mengetik teks, mengunggah foto, dan menekan **Save** — lalu isinya otomatis muncul di halaman publik. Kamu tidak menyentuh kode sama sekali.

> **Penting soal lokal vs online.** Kalau kamu menjalankan situs di komputer sendiri (`npm run dev`), yang kamu ubah hanya database di komputermu — tidak memengaruhi situs asli. Perubahan untuk publik dilakukan di panel `/admin` **server yang sudah online** (nanti di `itsa.pcr.ac.id/admin`). Pastikan kamu tahu sedang membuka yang mana.

### Masuk ke panel

1. Buka `/admin` (lokal: <http://localhost:3000/admin>; produksi: `https://itsa.pcr.ac.id/admin`).
2. Masukkan **email** dan **password** akun pengurusmu, klik **Login**.
3. Kalau ini pertama kali dan database masih kosong, panel menampilkan **"Create first user"** — akun pertama yang kamu buat langsung jadi admin.

> Belum punya akun? Minta dibuatkan oleh pengurus yang sudah punya akses (lihat [Menambah atau mengganti akun pengurus](#menambah-atau-mengganti-akun-pengurus)). **Semua pengurus yang bisa login punya hak yang sama** — belum ada pembedaan level (misalnya editor vs super-admin). Jadi hati-hati: siapa pun yang login bisa mengubah dan menghapus apa saja.

### Mengenal tata letak panel

- **Sidebar kiri** — daftar semua **koleksi** (jenis data) dan **global** (pengaturan). Klik salah satu untuk melihat isinya.
- **Daftar isi (list view)** — tabel semua entri di sebuah koleksi. Ada tombol **Create New** di kanan atas, kolom pencarian, dan filter.
- **Halaman edit** — form untuk satu entri. Kolom utama di tengah, kolom pendukung (tanggal, status, dsb.) di **sidebar kanan**.
- **Tombol Save / Publish** — di kanan atas halaman edit. **Perubahan belum tersimpan sampai kamu menekannya.**

Ikon nyawa (versi lama) tersedia di koleksi tertentu — kamu bisa mengembalikan isi ke versi sebelumnya kalau salah edit.

### Koleksi dan fungsinya

Setiap menu di sidebar mengisi bagian situs tertentu:

| Menu di panel | Mengisi bagian | Catatan singkat |
| --- | --- | --- |
| **Kegiatan** (Events) | Halaman Kegiatan, detail event, "kegiatan mendatang" di Beranda | Satu event menyalakan timeline, kalender, dan halaman detailnya |
| **Pengurus** | Halaman Kabinet | Tiap orang wajib menunjuk ke satu **Divisi** |
| **Divisi** | Pengelompokan di Kabinet + foto grup | Buat ini **lebih dulu** sebelum Pengurus & Kegiatan |
| **Berita** (Posts) | Halaman News | Dikelompokkan lewat **Kategori** |
| **Kategori** (Categories) | Filter/seksi di halaman News | Mis. Oprec, Prestasi, Umum |
| **FAQ** | Accordion FAQ (footer + Beranda) | Diurutkan lewat kolom **Urutan** |
| **Aspirasi** | Halaman Aspirasi | Publik mengirim anonim; pengurus menanggapi & memilih yang tampil |
| **Media** | Semua gambar/berkas | Sumber semua foto yang dipakai koleksi lain |
| **Users** | Akun pengurus yang bisa login | Bukan konten situs — ini akun admin |
| **Pengaturan Situs / Header / Footer** | Hero, statistik, sosial media, navbar, footer | Ini **global**, bukan daftar entri |

### Panduan tiap koleksi

Prinsip umum: **isi kolom bertanda wajib (\*)**, unggah/gunakan foto dari **Media**, lalu **Save**. Berikut hal spesifik tiap koleksi.

#### Kegiatan (Events)

Isi sebuah acara ITSA. Kolom penting:

- **Judul Kegiatan\*** — nama acara.
- Tab **Detail**: **Thumbnail\*** (foto sampul), **Lokasi\***, **gratis / HTM** (centang "gratis" atau isi harga tiket), **Link Pendaftaran** & **Pendaftaran Ditutup** (untuk acara yang buka pendaftaran), **Deskripsi\*** (teks kaya).
- Tab **Dokumentasi & Recap**: **Link Dokumentasi (Google Drive)** dan **Recap** — diisi **setelah** acara selesai.
- Sidebar kanan: **Tanggal Mulai\*** dan **Tanggal Selesai** (kosongkan kalau satu hari).
- **Status** (Akan Datang / Sedang Berlangsung / Selesai) **dihitung otomatis dari tanggal** — kamu tidak perlu dan tidak bisa mengubahnya manual.

> Karena Kegiatan memakai **draft**, ingat menekan **Publish** (bukan sekadar Save Draft) supaya muncul di situs. Lihat [Draft dan Terbit](#draft-dan-terbit).

#### Pengurus

Satu anggota kabinet. Kolom: **Nama Lengkap\***, **Foto\*** (potret; idealnya rasio 3:4), **Jabatan\*** (mis. "Ketua Divisi"), **Divisi\*** (pilih dari daftar Divisi), **Angkatan**, **Periode\*** (mis. "2025/2026"), **Urutan\*** (angka kecil tampil lebih dulu di dalam divisinya), dan **Media Sosial** (Instagram/LinkedIn/GitHub, opsional).

#### Divisi

Departemen/divisi kepengurusan. Kolom: **Nama Divisi\***, **Foto Grup Divisi** (foto bersama satu departemen — muncul di kartu Kabinet), **Deskripsi Singkat\***, **Ikon** (pilih dari daftar), **Urutan\*** (mengatur urutan tampil).

> **Buat Divisi lebih dulu.** Pengurus dan Kegiatan wajib menunjuk ke sebuah Divisi — kalau daftarnya kosong, kamu tidak bisa menyimpan mereka.

#### Berita (Posts)

Artikel/berita di halaman News. Kolom: **Title\***, **Hero Image** (sampul), **Content** (isi berita), **Categories** (pilih satu/lebih kategori), dan **Link Eksternal** — dipakai untuk pos jenis **Oprec**: tombolnya mengarah ke Google Form pendaftaran, bukan ke halaman detail. Ada juga tab **SEO/Meta** (opsional, untuk pratinjau saat dibagikan).

Berita memakai **draft** → ingat **Publish**.

#### Kategori (Categories)

Label pengelompokan berita (mis. **Oprec**, **Prestasi**, **Umum**). Kolom: **Title\***, **Deskripsi Singkat**, **Ikon**, **Urutan**, dan **"Tampilkan sebagai seksi di halaman Berita"** (kalau dicentang, kategori ini jadi blok tersendiri di halaman News).

#### FAQ

Satu pasang tanya-jawab. Kolom: **Pertanyaan\***, **Jawaban\*** (teks kaya), **Urutan\***. Nomor urut kecil tampil di atas.

#### Aspirasi

Kanal aspirasi **anonim** dari publik. Pengunjung mengisi form di halaman Aspirasi; entri masuk ke sini. Sebagai admin kamu:

- Membaca **Isi Aspirasi** (dan **Judul**/**Kategori** kalau diisi pengirim).
- Menulis **Tanggapan Pengurus** dan opsional **Foto Tanggapan**.
- Mencentang **"Tampilkan di situs"** agar aspirasi + tanggapannya muncul publik. **Selama belum dicentang, aspirasi tidak tampil.**

> Aspirasi bersifat sensitif. Jangan pernah menampilkan sesuatu yang membuka identitas pengirim atau berisi ujaran yang menyerang orang. Tanggapi dengan sopan.

#### Media

Gudang semua gambar. Unggah sekali di sini, lalu pilih dari koleksi lain (Thumbnail, Foto, Hero Image, dll.). Isi **alt** (deskripsi singkat gambar) — penting untuk aksesibilitas dan SEO. Payload otomatis membuat beberapa ukuran (thumbnail, square, small … og) supaya halaman tetap ringan.

> **Menghapus media yang masih dipakai bisa membuat gambar hilang** di halaman yang memakainya. Cek dulu sebelum menghapus.

### Pengaturan Situs, Header, dan Footer

Ini **global** (satu entri tetap, bukan daftar). Ada di bagian bawah sidebar.

- **Pengaturan Situs** — dibagi tab:
  - **Beranda** — teks & foto **Hero** (judul, aksen gold, subjudul, foto latar, link video profil).
  - **Tentang** — judul, paragraf, foto, dan kartu sorotan untuk section "Tentang" (dipakai halaman About).
  - **Kabinet** — **Foto Sorotan Kabinet** (daftar foto untuk carousel di atas halaman Kabinet).
  - **Media Sosial** — Instagram, TikTok, YouTube, LinkedIn, email (dipakai footer & kontak).
  - **Statistik** — angka yang tampil di band statistik (mis. jumlah anggota, program kerja).
- **Header** — menu navigasi navbar.
- **Footer** — kolom tautan dan isi footer.

Ubah, lalu **Save**. Perubahan langsung memengaruhi situs.

### Draft dan Terbit

Beberapa koleksi (**Kegiatan**, **Berita**, dan halaman **Pages**) punya dua keadaan:

- **Draft** — tersimpan tapi **belum tampil** di situs publik. Cocok untuk menyiapkan konten sambil dicicil.
- **Published (Terbit)** — tampil untuk umum.

Di halaman edit, perhatikan tombol di kanan atas: **Save Draft** vs **Publish**. Kalau kontenmu "sudah disimpan tapi kok tidak muncul di situs", kemungkinan besar statusnya masih **Draft** — buka lagi dan tekan **Publish**. Untuk menyembunyikan sesuatu tanpa menghapus, kembalikan ke draft (**Unpublish**).

### Menambah atau mengganti akun pengurus

Akun login ada di koleksi **Users**.

- **Menambah pengurus:** buka **Users → Create New**, isi nama, email, dan password, lalu Save. Beri tahu orangnya email & password-nya.
- **Mengganti password:** buka user yang bersangkutan, ubah password, Save.
- **Mencabut akses (pengurus lama):** hapus user tersebut, atau ganti passwordnya.

> Ingat: **semua user punya hak penuh yang sama.** Hanya buat akun untuk pengurus yang memang perlu mengelola isi. Reset password lewat email **belum aktif** — kalau lupa password dan tidak ada admin lain, di lingkungan lokal satu-satunya jalan adalah menghapus `itsa-web.db` dan mulai ulang (di produksi: minta bantuan programmer).

### Etika dan tips mengisi konten

- **Foto:** gunakan gambar yang tidak buram, dengan izin yang jelas. Isi **alt** setiap gambar.
- **Tulisan:** rapi, tanpa typo, nada ramah dan menghormati. Periksa nama & jabatan orang.
- **Tanggal & data:** pastikan benar sebelum Publish — ini yang dilihat publik.
- **Data contoh/tebakan:** kalau ada isi yang masih sementara (mis. deskripsi placeholder), tandai dan perbaiki sebelum situs benar-benar dipublikasikan.
- **Jangan menampilkan info pribadi** (nomor HP, alamat, identitas pengirim aspirasi) tanpa izin.
- **Ragu?** Simpan sebagai **Draft** dulu, lalu minta pengurus lain mengecek sebelum Publish.

### Masalah yang sering ditemui admin

**Sudah Save tapi tidak muncul di situs.**
Statusnya kemungkinan masih **Draft** — tekan **Publish**. Atau halaman publik masih menyimpan versi lama sebentar (situs meng-cache); tunggu sebentar lalu refresh.

**Tidak bisa memilih Divisi saat membuat Pengurus/Kegiatan.**
Daftar Divisi masih kosong. Buat **Divisi** dulu, baru kembali.

**Gambar tidak bisa dipilih / kosong.**
Belum ada di **Media**. Unggah dulu di koleksi Media, baru pilih.

**Tombol Save tidak aktif / ada kolom merah.**
Ada kolom **wajib (\*)** yang belum diisi, atau tanggal selesai lebih awal dari tanggal mulai. Perbaiki kolom yang ditandai merah.

**Salah edit, ingin kembali ke versi sebelumnya.**
Buka entrinya, cari daftar **Versions**, pilih versi lama, dan pulihkan (tersedia untuk koleksi yang memakai draft).

**Lupa password dan tidak ada admin lain.**
Lihat [Menambah atau mengganti akun pengurus](#menambah-atau-mengganti-akun-pengurus).

---

## Butuh bantuan?

- **Pengurus/admin:** tanya ke pengurus **divisi Ristek** atau pemegang akun admin.
- **Programmer:** buka **Issue** di GitHub, atau hubungi pengurus divisi Ristek.
