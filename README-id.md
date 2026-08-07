# Fuelio

Progressive Web App mobile-first untuk mencatat konsumsi dan biaya BBM motor
dengan metode "isi penuh". Satu file `index.html` — CSS/JS inline, tanpa
dependensi eksternal, tanpa build step, tanpa backend, tanpa akun.

> **Catatan nama:** proyek ini kebetulan memakai nama "Fuelio" yang sama
> dengan aplikasi navigasi/lalu lintas dari Sygic yang sudah ada dan tidak
> berkaitan sama sekali. Lihat bagian **Masalah yang diketahui** di bawah.

## Fitur

- **Input berbasis Rupiah.** Catat pengisian lewat nominal, harga per liter,
  atau liter — isi dua dari tiga, sisanya dihitung otomatis. Harga default
  per jenis BBM diingat dari koreksi terakhirmu.
- **Dua mode jarak.** Trip meter, atau odometer dengan jarak dihitung
  otomatis dari catatan sebelumnya. Isi sebagian (tangki belum penuh) dicatat
  terpisah dan digabung ke rasio pengisian penuh berikutnya.
- **Dashboard uang.** Biaya per kilometer, pengeluaran bulan ini, rincian per
  bulan dengan tren naik/turun, dan grafik tren (km/L atau Rp/km) berbasis
  canvas yang bisa disentuh untuk melihat titik tertentu.
- **Pengingat pasif, bukan mengganggu.** Pengingat isi ulang berdasar
  kebiasaanmu sendiri, dan pengingat backup begitu data sudah cukup banyak —
  keduanya bisa ditutup, tidak ada yang memblokir.
- **Dukungan offline sungguhan.** Service worker satu-origin (`sw.js`)
  meng-cache aplikasi dan menyajikannya dengan strategi network-first dengan
  timeout, jadi aplikasi tetap terbuka walau tanpa koneksi. Ada versi baru →
  muncul ajakan di dalam aplikasi, bukan reload diam-diam.
- **Bisa dipasang (installable).** Manifest dan ikon dibuat saat aplikasi
  dimuat; ada ajakan pasang di dalam aplikasi untuk Android/desktop, dan
  petunjuk sekali-tampil untuk iOS (yang tidak punya prompt install bawaan
  browser).
- **Kontrol backup penuh.** Ekspor CSV (ramah Excel, aman dari suntikan
  formula), backup/restore JSON lengkap dengan pratinjau sebelum digabung
  atau diganti, dan jalur karantina untuk baris data yang gagal validasi
  supaya tidak dibuang diam-diam.
- **Aksesibel secara default.** Kartu riwayat bisa dioperasikan lewat
  keyboard, fokus dikembalikan ke elemen yang membuka dialog, pesan error
  form diumumkan lewat pembaca layar, dan mode gerakan-minim penuh.
- **Mode gelap** mengikuti sistem secara default, bisa diubah manual.

## Privasi

**Data kamu tidak pernah meninggalkan HP kamu.** Semua tersimpan di
`localStorage` browser pada perangkat yang kamu pakai — tidak ada server,
tidak ada akun, tidak ada analitik, tidak ada permintaan jaringan yang
dibuat aplikasi selain menyajikan file miliknya sendiri yang sudah di-cache.
Uninstall aplikasi atau membersihkan data situs akan menghapusnya secara
permanen — itulah sebabnya aplikasi mengingatkanmu untuk backup JSON secara
berkala. Tidak ada yang pernah disinkronkan atau dibagikan kecuali kamu
sendiri yang mengekspor filenya dan mengirimkannya.

## Menjalankan

Karena ada service worker, **aplikasi ini harus disajikan lewat `https://`
atau `http://localhost`** — browser menolak mendaftarkan service worker dari
URL `file://`, jadi membuka `index.html` langsung akan kehilangan dukungan
offline saja (fitur lain tetap jalan). Untuk pengembangan lokal:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000/
```

Untuk produksi bisa pakai hosting statis apa saja (GitHub Pages, Netlify,
direktori nginx/Apache biasa, dll.) — tidak ada yang perlu di-build atau
dikonfigurasi.

## Cara pakai

1. Tap **+** (atau "Catat pengisian pertama" saat pertama buka) untuk
   mencatat pengisian.
2. Isi jarak (trip atau odometer) dan liter; biaya/harga per liter opsional
   dan saling mengisi otomatis.
3. Simpan — riwayat, statistik, dan grafik tren langsung diperbarui.
4. Tap kartu untuk edit, atau pakai tombol **⋯** untuk edit/hapus. Hapus
   bersifat optimistik dengan toast undo 5 detik.
5. Buka ikon gear untuk Pengaturan: harga BBM default, mode pengisian jarak,
   ekspor CSV/JSON, pulihkan backup, dan data contoh.

## Struktur data (localStorage, kunci `fuelTrackerData`)

Bentuk data punya versi (`schemaVersion`) dan dimigrasikan otomatis — data
lama dari versi aplikasi sebelumnya tetap terbaca tanpa langkah manual apa
pun.

```json
{
  "schemaVersion": 2,
  "entries": [
    {
      "id": "1732195200000_a3f2",
      "date": "2024-11-21",
      "distance": 31,
      "fuel": 2.4,
      "notes": "full throttle test",
      "timestamp": 1732195200000,
      "fuelType": "Pertamax",
      "fuelCost": 30000,
      "pricePerLiter": 12500,
      "odometer": null,
      "isPartialFill": false
    }
  ],
  "settings": { "darkMode": "auto", "entryMode": "trip", "fuelPrices": {} },
  "quarantine": []
}
```

`ratio` (km/L) selalu dihitung saat ditampilkan, tidak pernah disimpan — ia
hasil turunan dari distance/fuel, jadi menyimpan salinannya hanya akan
membuat dua nilai itu berisiko tidak sinkron.

## Catatan pengembangan

- Tidak ada build step; edit `index.html` langsung (CSS/JS inline).
- `sw.js` adalah satu-satunya file pendamping yang diizinkan — service worker
  tidak bisa didaftarkan dari URL Blob atau inline, harus dari URL skrip asli.
- Manifest dan ikon aplikasi dibuat saat dimuat (canvas → PNG data URI,
  disuntik sebagai `<link rel="manifest">` ber-URI `data:`), bukan file
  terpisah.
- Untuk reset data lokal, hapus kunci `fuelTrackerData` di DevTools →
  Application/Storage. Backup JSON mentah bisa dipulihkan lewat Pengaturan.

## Masalah yang diketahui

- **Konflik nama:** "Fuelio" juga merupakan nama aplikasi navigasi
  mobil/pendeteksi kamera kecepatan dari Sygic yang sudah mapan dan tidak
  berkaitan. Proyek ini sama sekali tidak berafiliasi dengannya. Kalau
  aplikasi ini suatu saat dipublikasikan ke app store atau didistribusikan
  secara luas, sebaiknya diganti nama lebih dulu — dicatat di `ROADMAP.md`,
  belum dikerjakan di rilis ini.
- Jarak hanya bisa ditempel manual dari Google Maps (salin angkanya, tempel
  ke kolom, atau pakai helper clipboard di form) — tidak ada integrasi API
  pengambil rute, memang disengaja (lihat `ROADMAP.md`).
- Dukungan offline dan ajakan pasang aplikasi butuh HTTPS atau `localhost`;
  membuka file langsung (`file://`) hanya menonaktifkan service worker.
