# DESIGN.md — Sistem Desain Website ITSA

Acuan visual untuk website ITSA. Dibaca bareng `CLAUDE.md` (struktur, data, rencana build). Kalau ragu soal warna/tampilan, ikuti file ini; jangan menyimpang tanpa konfirmasi.

**Arah:** modern, bersih, **hijau-dominan dan gelap** — terinspirasi hmtc-its.com. Tenang, berkarakter, bukan template generik.

---

## 0. DNA visual ITS (elemen khas — WAJIB, ini pembeda utama)
Tanpa elemen ini, situs jatuh jadi layout Hima generik/informatif (mirip Udayana). Ambil **struktur & gerakannya** dari HMTC ITS, warna tetap palet hijau kita.
- **Single-page yang penuh gerakan:** halaman panjang di-scroll, tiap section muncul dengan animasi (fade/slide-in saat masuk viewport). BUKAN halaman statis yang diam.
- **Splash intro** dengan loading counter (angka % naik) sebelum masuk.
- **Hero full-bleed, headline BESAR & berani** (multi-baris, tipografi gede) — bukan hero mungil.
- **Stat counter beranimasi** (angka count-up) di band tersendiri.
- **Section pengurus INTERAKTIF:** carousel/slider per divisi, kartu foto besar yang nge-link ke sosial. Ini pembeda paling kuat — **bukan grid kartu statis**.
- **Timeline horizontal** untuk sejarah/kegiatan, bukan list vertikal biasa.
- **Micro-interaction:** hover state, transisi halus, scroll-triggered reveal.

**Anti-pattern (yang bikin kayak Udayana — HINDARI):** grid kartu divisi statis dengan ikon SVG kecil; layout terang-informatif yang "diam"; section yang cuma tumpukan kartu tanpa gerakan atau hierarki kuat; hero kecil tanpa dampak.

---

## 1. Prinsip
1. **70 / 20 / 10.** 70% hijau (dominan), 20% cream (sekunder), 10% gold (aksen). Patuhi rasio ini di tiap halaman.
2. **Kontras benar.** Latar gelap → teks terang. Latar terang → teks gelap. Jangan dibalik.
3. **Anti-nabrak.** Gold tampil dalam dosis kecil saja. Jangan tempel blok besar gold + cream + hijau saturasi tinggi bersebelahan.
4. **Lega & konsisten.** Banyak ruang napas; jarak, radius, dan ukuran font seragam.
5. **Konten dulu.** Keterbacaan di atas segalanya.

---

## 2. Sistem Warna

Palet resmi (dari `palet_itsa.jpeg`), dipakai dengan rasio 70/20/10.

| Peran | Warna | Hex | Porsi | Dipakai buat |
|---|---|---|---|---|
| Dominan | Forest | `#143a28` | ~70% | Background utama, navbar, mayoritas section, footer |
| Elevasi hijau | Forest terang (turunan) | `#1c4a34` | (bagian 70%) | Kartu/panel di atas latar gelap, hover |
| Sekunder | Cream | `#fff7e6` | ~20% | Section terang & area baca panjang (teks gelap) |
| Aksen | Gold | `#ffd500` | ~10% | Tombol CTA, highlight, angka statistik, state aktif |
| Pendukung | Olive | `#576238` | — | Teks sekunder & border di atas cream; garis halus |

**Warna teks (ikuti teori kontras):**
- Di atas **hijau tua**: teks utama = cream `#fff7e6`; teks sekunder = hijau-muda keabuan (turunan, mis. `#c8d3c8`).
- Di atas **cream**: teks utama = forest `#143a28`; teks sekunder = olive `#576238`.
- Di atas **gold**: teks = forest `#143a28`.

**Aturan keras biar gak nabrak:**
- **Gold TIDAK PERNAH jadi teks** di atas hijau atau cream (bergetar, kontras jelek). Gold selalu sebagai *isian* (background tombol/badge/garis) dengan teks forest di atasnya.
- Gold muncul sedikit: tombol utama, angka statistik, garis/indikator aktif. Bukan area luas.
- **Logo** ditaruh di area cream/putih biar kebaca bersih. Untuk area hijau tua (footer), siapkan **versi logo terang/putih**.

---

## 3. Tipografi
Semua dari Google Fonts (mudah diintegrasi via `next/font`).
- **Heading:** Plus Jakarta Sans (bobot 600–800).
- **Body:** Inter (bobot 400–500).
- **Aksen mono (sentuhan tech):** **JetBrains Mono** — HANYA untuk elemen kecil bernuansa teknis: eyebrow/label section, angka stat counter, tag/chip kategori, timestamp, elemen "kode". JANGAN untuk heading atau body. Pakai versi biasa dari Google Fonts, **BUKAN varian "Nerd Font"** (itu buat terminal — berat & penuh ikon, tak perlu di web).
- **Alternatif heading** kalau mau lebih tech: Space Grotesk.
- Skala (desktop): H1 48–56 / H2 32–40 / H3 24 / Body 16–18 / Small 14. Line-height body ~1.6, heading ~1.2. Lebar teks ~65–75 karakter.

---

## 4. Komponen
- **Navbar:** latar hijau tua, teks cream, sticky, bersih (Home, About, Kegiatan, Kabinet, News). Tombol **Aspirasi** = gold, teks forest.
- **Tombol:** *Primary* = bg gold + teks forest. *Secondary* = outline cream (di atas hijau) atau outline forest (di atas cream). *Ghost* = teks polos.
- **Kartu (Event/News):** default **kartu cream** di atas latar hijau (biar konten kebaca), radius 12px. Badge status: Completed = forest, Upcoming = outline cream/olive. Hover: naik sedikit.
- **Kartu Kabinet:** foto clear rasio seragam + nama + jabatan + ikon sosial. Grid gaya ITS, per divisi, pagination.
- **FAQ:** accordion.
- **Footer:** hijau paling tua, teks cream, logo versi terang, kolom (Tentang / Navigasi / Kontak / Sosmed).
- **Stat counter:** rekomendasi taruh di **band cream** di tengah halaman (ritme terang di antara section gelap) — angka forest besar + garis/aksen gold, animasi count-up saat ke-scroll.
- **Timeline & Kalender:** filter chip (Semua/Upcoming/Completed); kalender bulanan, tanggal ber-event ditandai titik gold.
- **Splash video:** overlay full-screen kunjungan pertama tiap sesi (`sessionStorage`), tombol Skip jelas, auto-tutup saat selesai.

---

## 5. Motion
Halus & konsisten: fade/slide-up saat masuk viewport, count-up statistik, hover-lift kartu, transisi halaman lembut, splash intro. Jangan sampai animasi bikin teks susah dibaca.

---

## 6. Arah per Halaman (hijau-dominan)
- **Home:** splash → hero (latar hijau tua, headline cream besar, CTA gold) → **band stat counter cream** → Recaps terbaru (kartu cream di atas hijau) → Kegiatan mendatang → FAQ ringkas → footer hijau tua.
- **About:** section hijau dengan blok Visi & Misi; boleh selingi 1 blok cream biar gak monoton.
- **Kegiatan:** chip filter, timeline, toggle Kalender. State completed rapi.
- **Detail Event / News (baca panjang):** **area baca cream, teks forest** (latar terang teks gelap) biar nyaman dibaca. Tombol Dokumentasi (Google Drive) = gold.
- **Kabinet:** grid per divisi + deskripsi divisi singkat + pagination, di atas latar hijau.
- **News:** filter kategori (Oprec/Prestasi/Umum); post Oprec punya tombol gold ke Google Form eksternal.
- **FAQ:** accordion; item kartu cream di atas hijau.
- **Aspirasi:** form anonim simpel + daftar aspirasi yang sudah direspons (foto + komentar pengurus), moderasi via admin panel.

---

## 7. Responsif & Aksesibilitas
- Mobile-first; navbar → hamburger; grid → 1 kolom; splash tetap jalan.
- Kontras aman (cream di atas hijau; forest di atas cream). Jangan gold buat teks.
- Semua gambar ada `alt`; fokus keyboard kelihatan; target sentuh cukup besar.

---

## 8. Aset yang Perlu Disiapin
- **Versi logo terang/putih** untuk background hijau (footer). *(perlu dibuat)*
- **Splash video** — ada ✓; pastikan format web (mp4/webm) & ringan.
- **Foto pengurus** rasio/resolusi seragam.
- **Palet & font** — final ✓.
