# Rental Aman

Aplikasi sewa kendaraan (PWA) bergaya aplikasi taksi: peta nyata (Leaflet + OpenStreetMap), GPS, rute (OSRM), pencarian lokasi (Nominatim), pemesanan, check-in foto, sewa aktif dengan pelacakan GPS, riwayat, rating, dan Mode Mitra. Data disimpan di `localStorage`.

## Menjalankan
1. Lokal: `python3 -m http.server 8000` lalu buka http://localhost:8000 (GPS, service worker, dan kamera butuh `localhost` atau HTTPS).
2. GitHub Pages: unggah semua file ke repo, Settings > Pages > Deploy from branch (`main`, folder `/`). Buka URL `https://<user>.github.io/<repo>/`. Buka di HP lalu "Tambahkan ke layar utama" untuk memasangnya.

## Struktur
- `index.html` kerangka + layar loading logo
- `style.css` tema biru-putih (otomatis mode gelap)
- `app.js` seluruh logika; data kendaraan ada di `V0`, kode promo `BIRU10`, harga dan tarif di `calc()`
- `manifest.json`, `sw.js`, `icon.svg` untuk PWA

## Yang masih simulasi (perlu backend/mitra nyata)
Pembayaran, kunci digital/chip, verifikasi SIM dan wajah (hanya cek ada foto), akun lintas perangkat, dan pesanan antar pengguna. Untuk produksi: tambahkan server (mis. Supabase/Firebase), payment gateway (Midtrans/Xendit), dan layanan verifikasi identitas.

## Catatan
Layanan peta publik (tile OSM, Nominatim, OSRM demo) punya batas pemakaian; untuk produksi pakai penyedia berbayar atau server sendiri.
