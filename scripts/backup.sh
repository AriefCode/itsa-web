#!/usr/bin/env bash
#
# Cadangkan database dan berkas media Website ITSA.
#
# Dua-duanya TIDAK ADA di git — `itsa-web.db` dan `public/media/` tercakup
# .gitignore. Artinya salinan yang ada di komputermu (atau di server) adalah
# satu-satunya salinan. Kalau berkasnya hilang, isinya hilang: 51 pengurus
# beserta fotonya, kegiatan, berita, dan seluruh aspirasi.
#
# Skrip ini bisa dijalankan di laptop maupun di server — tidak ada yang
# khusus server di dalamnya.
#
# PEMAKAIAN
#   ./scripts/backup.sh                  # simpan ke ./backup
#   ./scripts/backup.sh /media/flashdisk # simpan ke tempat lain
#   SIMPAN=14 ./scripts/backup.sh        # simpan 14 cadangan terakhir (bawaan 7)
#
# MENGEMBALIKAN (lakukan saat aplikasi berhenti)
#   tar -xzf backup/itsa-2026-08-04_223045.tar.gz -C /tmp/pulihkan
#   cp /tmp/pulihkan/itsa-web.db  ./itsa-web.db
#   rsync -a --delete /tmp/pulihkan/media/  ./public/media/
#
# Simpan hasilnya di tempat yang BERBEDA dari mesin aslinya. Cadangan yang
# duduk di disk yang sama dengan aslinya tidak menolong saat disknya rusak.

set -euo pipefail

# Akar proyek dihitung dari lokasi skrip, jadi bisa dipanggil dari mana saja.
AKAR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$AKAR"

TUJUAN="${1:-$AKAR/backup}"
SIMPAN="${SIMPAN:-7}"
# Detik ikut masuk supaya dua cadangan pada menit yang sama tidak saling
# menimpa — kalau ditimpa, cadangan yang lebih tua justru lenyap.
CAP="$(date +%Y-%m-%d_%H%M%S)"
KERJA="$(mktemp -d)"
trap 'rm -rf "$KERJA"' EXIT

pesan() { printf '  %s\n' "$*"; }
gagal() { printf '\nGAGAL: %s\n' "$*" >&2; exit 1; }

echo "Cadangan Website ITSA — $CAP"
echo "Akar proyek : $AKAR"
echo "Tujuan      : $TUJUAN"
echo

# --- Cari berkas database -----------------------------------------------
# Mengikuti DATABASE_URL di .env kalau ada, supaya tetap benar meski nama
# berkasnya diubah. Bentuknya `file:./itsa-web.db`.
DB="itsa-web.db"
if [[ -f "$AKAR/.env" ]]; then
  DARI_ENV="$(grep -E '^DATABASE_URL=' "$AKAR/.env" | tail -1 | cut -d= -f2- | tr -d '"'"'"' ' || true)"
  DARI_ENV="${DARI_ENV#file:}"
  [[ -n "$DARI_ENV" ]] && DB="$DARI_ENV"
fi
[[ -f "$AKAR/$DB" || -f "$DB" ]] || gagal "database '$DB' tidak ditemukan. Jalankan dari proyek yang benar."

# --- Salin database secara konsisten ------------------------------------
# `.backup` milik sqlite3 mengambil snapshot yang utuh meski aplikasinya
# sedang berjalan. Menyalin berkasnya dengan `cp` saat ada transaksi berjalan
# bisa menghasilkan salinan yang setengah jadi.
mkdir -p "$KERJA"
if command -v sqlite3 >/dev/null 2>&1; then
  sqlite3 "$DB" ".backup '$KERJA/itsa-web.db'" || gagal "sqlite3 .backup gagal"
  pesan "database disalin dengan sqlite3 .backup"
else
  cp "$DB" "$KERJA/itsa-web.db"
  pesan "database disalin dengan cp (sqlite3 tidak ada — hentikan aplikasi dulu bila ragu)"
fi

# --- Periksa hasil salinannya sebelum dianggap sah ------------------------
if command -v sqlite3 >/dev/null 2>&1; then
  HASIL="$(sqlite3 "$KERJA/itsa-web.db" "PRAGMA integrity_check;" 2>&1 | head -1)"
  [[ "$HASIL" == "ok" ]] || gagal "salinan database rusak (integrity_check: $HASIL)"
  pesan "integrity_check: ok"

  BARIS="$(sqlite3 "$KERJA/itsa-web.db" \
    "SELECT (SELECT COUNT(*) FROM pengurus) || ' pengurus, ' ||
            (SELECT COUNT(*) FROM events)   || ' kegiatan, ' ||
            (SELECT COUNT(*) FROM media)    || ' media';" 2>/dev/null || true)"
  [[ -n "$BARIS" ]] && pesan "isi: $BARIS"
fi

# --- Media ----------------------------------------------------------------
if [[ -d "$AKAR/public/media" ]]; then
  cp -a "$AKAR/public/media" "$KERJA/media"
  pesan "media: $(find "$KERJA/media" -type f | wc -l) berkas"
else
  mkdir -p "$KERJA/media"
  pesan "media: direktori public/media tidak ada, dilewati"
fi

# --- Bungkus --------------------------------------------------------------
mkdir -p "$TUJUAN"
ARSIP="$TUJUAN/itsa-$CAP.tar.gz"
tar -czf "$ARSIP" -C "$KERJA" itsa-web.db media

# Arsip yang tidak bisa dibaca kembali bukan cadangan.
tar -tzf "$ARSIP" >/dev/null || gagal "arsip tidak bisa dibaca kembali: $ARSIP"

pesan "arsip  : $ARSIP ($(du -h "$ARSIP" | cut -f1))"
pesan "isi    : $(tar -tzf "$ARSIP" | wc -l) entri"

# --- Buang yang lama ------------------------------------------------------
# `ls -t` mengurutkan dari yang terbaru; sisanya setelah $SIMPAN dibuang.
JUMLAH="$(find "$TUJUAN" -maxdepth 1 -name 'itsa-*.tar.gz' | wc -l)"
if (( JUMLAH > SIMPAN )); then
  # shellcheck disable=SC2012
  ls -t "$TUJUAN"/itsa-*.tar.gz | tail -n +$((SIMPAN + 1)) | while read -r lama; do
    rm -f "$lama"
    pesan "dibuang: $(basename "$lama")"
  done
fi

echo
echo "Selesai. $(find "$TUJUAN" -maxdepth 1 -name 'itsa-*.tar.gz' | wc -l) cadangan tersimpan di $TUJUAN"
echo "Salin arsipnya ke tempat lain — disk yang sama dengan aslinya tidak menolong saat disk rusak."
