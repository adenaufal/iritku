# Roadmap

Status rilis saat ini. Semua yang ada di "Sudah dikerjakan" masuk lewat tiga
gelombang implementasi (data/fitur inti, overhaul UX, PWA/aksesibilitas/
performa); detailnya ada di riwayat git.

## Sudah dikerjakan

**Stabilitas & data**
- [x] Versi skema + tangga migrasi otomatis; baris data yang tidak terbaca
  dikarantina (bisa diekspor sebagai JSON mentah), bukan dibuang diam-diam.
- [x] Penyimpanan transaksional — penulisan yang gagal mengembalikan memori
  supaya sama dengan disk lalu render ulang, bukan membiarkan layar tidak
  sinkron.
- [x] Deteksi kuota penuh dengan ajakan backup langsung.
- [x] Konfirmasi hapus khusus dengan toast undo 5 detik — tidak ada
  `confirm()` di mana pun di aplikasi.
- [x] Bug diperbaiki: form kosong terbuka dengan error, tanggal default UTC
  meleset sebelum jam 7 pagi, input BBM dengan koma desimal, dan drag ke
  backdrop yang membuang isian.

**Uang, data & ekspor**
- [x] Input berbasis Rupiah (nominal / harga per liter / liter, saling
  mengisi tiga arah) dengan harga default per jenis BBM yang diingat.
- [x] Mode input odometer dengan jarak turunan otomatis dan pelacakan isi
  sebagian.
- [x] Dashboard biaya per km, rincian pengeluaran bulanan dengan tren.
- [x] Ekspor CSV (delimiter titik-koma, desimal koma, aman dari suntikan
  formula) dan backup/restore JSON lengkap dengan pratinjau gabung/ganti.

**Visual & gerakan**
- [x] Grafik tren konsumsi berbasis canvas (km/L atau Rp/km) dengan scrub,
  moving average, dan pewarnaan berdasar ambang batas — tanpa library chart.
- [x] Sistem desain penuh: skala tipografi fluid, tangga spacing/radius/
  elevasi, satu kosakata gerakan yang menghormati `prefers-reduced-motion`.
- [x] Kartu riwayat, header statistik sticky-compact, form bottom-sheet, dan
  alur onboarding dengan opsi data contoh — semuanya didesain ulang.

**PWA & perangkat**
- [x] Service worker sungguhan (`sw.js`) — pendaftaran Blob-URL sebelumnya
  memang tidak pernah berfungsi. Navigasi network-first dengan timeout,
  pembersihan cache lama, dan toast "versi baru tersedia" dengan reload
  eksplisit (tidak ada pergantian versi diam-diam saat tab masih terbuka).
- [x] Manifest dan ikon dibuat saat dimuat, `start_url`/`scope` diturunkan
  dari lokasi halaman itu sendiri supaya jalan dari sub-path mana pun.
- [x] Polesan home-screen iOS: apple-touch-icon 180×180 asli, layout sadar
  safe-area, meta status bar.
- [x] Ajakan pasang di dalam aplikasi (`beforeinstallprompt`) plus petunjuk
  Share-sheet sekali-tampil untuk iOS.
- [x] Audit aksesibilitas: kartu riwayat bisa dioperasikan keyboard, fokus
  dialog dikembalikan ke elemen pemicu saat ditutup, pesan error form
  diumumkan lewat pembaca layar, layar crash dengan jalan keluar ekspor data.

## Ditunda

Dicatat sengaja, bukan terlupa:

- **Garasi multi-kendaraan.** Melacak lebih dari satu motor/mobil dengan
  riwayat dan statistik terpisah. Mengubah model data secara signifikan
  (tiap entri butuh referensi kendaraan) dan agregasi statistik/grafik,
  jadi ini pantas jadi rilis sendiri, bukan tempelan.
- **Kartu statistik yang bisa dibagikan.** Render gambar ringkasan (Canvas →
  PNG/share sheet) untuk dibagikan di media sosial — "motor gue segini km/L
  bulan ini". Murni penambahan, tidak menyentuh model data; kandidat bagus
  untuk rilis berikutnya begitu ada desainnya.
- **Lokalisasi Bahasa Inggris.** Semua teks saat ini sengaja dalam Bahasa
  Indonesia untuk rilis ini; kode sudah cukup memisahkan string yang
  ditampilkan ke pengguna supaya lapisan i18n mudah ditambahkan nanti, tapi
  belum ada pengalih bahasa.

## Isu diketahui yang dibawa terus

- **Konflik nama dengan "Fuelio" milik Sygic.** Ada aplikasi navigasi yang
  sudah ada dan tidak berkaitan memakai nama ini di app store. Penggantian
  nama disarankan sebelum distribusi publik/app store, tapi sengaja di luar
  cakupan rilis ini — lihat bagian Masalah Diketahui di README.
