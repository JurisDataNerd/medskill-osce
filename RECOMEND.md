# 🚀 RECOMEND.md - Rekomendasi Alternatif Alur & Fitur Sistem OSCE
**Praxis by Medskill Indonesia**

Dokumen ini berisi rekomendasi alternatif alur kerja (*workflow*) dan rekomendasi fitur sistem yang dirancang untuk mengoptimalkan keandalan, efisiensi, dan pengalaman pengguna (*user experience*) pada pelaksanaan Ujian Simulasi OSCE Offline/Hybrid di Gedung Skill Lab Institusi Kedokteran.

---

## 📑 Daftar Isi
1. [Executive Summary](#1-executive-summary)
2. [Rekomendasi Alternatif Alur Kerja (Alternative Workflows)](#2-rekomendasi-alternatif-alur-kerja-alternative-workflows)
   - [Alternatif A: Station Kiosk Mode & Quick QR/ID Selector](#alternatif-a-station-kiosk-mode--quick-qrid-selector)
   - [Alternatif B: Dual-Panel Live Monitor & Scoring untuk Penguji](#alternatif-b-dual-panel-live-monitor--scoring-untuk-penguji)
   - [Alternatif C: Centralized Web-Audio Bell System](#alternatif-c-centralized-web-audio-bell-system)
3. [Rekomendasi Fitur Sistem Tambahan (System Features Recommendation)](#3-rekomendasi-fitur-sistem-tambahan-system-features-recommendation)
   - [1. Offline-First Architecture & Auto-Sync Engine](#1-offline-first-architecture--auto-sync-engine)
   - [2. Multi-Track / Parallel Circuit (Circuit Track A & B)](#2-multi-track--parallel-circuit-circuit-track-a--b)
   - [3. Templat & Bank Soal Modular (Package Duplicator)](#3-templat--bank-soal-modular-package-duplicator)
   - [4. Item Analysis & Evaluasi Rubrik (Reliabilitas Soal)](#4-item-analysis--evaluasi-rubrik-reliabilitas-soal)
   - [5. Queue-Based Bulk PDF & Email Dispatcher](#5-queue-based-bulk-pdf--email-dispatcher)
4. [Matriks Perbandingan Alur Standar vs Rekomendasi](#4-matriks-perbandingan-alur-standar-vs-rekomendasi)

---

## 1. Executive Summary

Pelaksanaan Ujian OSCE offline di institusi kedokteran sering kali menghadapi kendala teknis lapangan seperti:
- **Koneksi Wi-Fi gedung naik-turun** yang berisiko menghilangkan isian jawaban peserta/nilai penguji.
- **Kerumitan registrasi/login peserta** di setiap perpindahan stase.
- **Keterlambatan pembunyian bel** pergeseran stase secara manual.
- **Beban pembuatan puluhan PDF rekapitulasi** yang dapat menyebabkan server *freeze*.

Rekomendasi dalam dokumen ini disusun untuk menyelesaikan seluruh kendala di atas secara arsitektural.

---

## 2. Rekomendasi Alternatif Alur Kerja (Alternative Workflows)

### Alternatif A: Station Kiosk Mode & Quick QR/ID Selector

#### 📋 Konsep Alur:
Perangkat layar (tablet/laptop) di meja stase tidak mewajibkan peserta untuk *login/logout* akun setiap pergantian 12 menit. Layar stase diset dalam **Station Kiosk Mode** yang terhubung ke stase ruangan tersebut.

#### 🔄 Langkah Alur:
1. **Kiosk Mode Standby**: Tablet di Stase 1 menampilkan layar *"Selamat Datang di Stase 1 (Kardiovaskular)"*.
2. **Identifikasi Peserta (3 Detik)**:
   - begitu peserta masuk ruangan, peserta cukup memindai **QR Code Kartu Peserta** pada kamera tablet, ATAU memilih nama dari dropdown antrean ringkas.
3. **Pengerjaan Langsung**: Form Blangko Anamnesis, Checklist Penunjang, dan Diagnosis/Resep langsung terbuka khusus untuk nama peserta tersebut.
4. **Auto-Reset saat Rotasi**: Begitu timer 12 menit selesai (fase Transition), layar otomatis tersimpan, terkunci, dan kembali ke tampilan awal untuk peserta berikutnya.

> **Keuntungan**: Menghemat waktu 1-2 menit registrasi per stase, mencegah salah login akun antar peserta, dan meminimalkan kesalahan navigasi.

---

### Alternatif B: Dual-Panel Live Monitor & Scoring untuk Penguji

#### 📋 Konsep Alur:
Dashboard Penguji dibagi menjadi 2 panel bersisian (*side-by-side layout*) yang menyesuaikan fase timer stase (Reading 1m, Action 10m, Transition 1m).

#### 🔄 Langkah Alur:
- **Fase Reading (1 Menit)**:
  - Layar Penguji menampilkan profil peserta yang akan masuk & acuan kunci jawaban baku agar penguji bersiap.
- **Fase Action (10 Menit)**:
  - **Panel Kiri**: Isian Form Peserta (1 WDx, 3 DDx, Blangko Resep) yang ter-update secara *real-time* seiring ketikan peserta.
  - **Panel Kanan**: Rubrik Penilaian Baku & Acuan Kunci Jawaban Resmi dari Admin. Penguji cukup mengeklik skor (0, 1, 2) dan GRS.
- **Fase Transition (1 Menit)**:
  - Penguji mengulas catatan umpan balik (*feedback*), mengeklik `Submit & Kunci Nilai`, dan layar otomatis berpindah ke antrean peserta berikutnya.

> **Keuntungan**: Penguji tidak perlu berpindah-pindah tab browser untuk melihat jawaban peserta dan kunci jawaban baku.

---

### Alternatif C: Centralized Web-Audio Bell System

#### 📋 Konsep Alur:
Menggantikan pengoperasian bel fisik manual dengan **Web Audio API Server** yang dikendalikan penuh oleh Admin.

#### 🔄 Langkah Alur:
1. Admin menekan tombol `Start Simulation` di Master Dashboard.
2. Laptop Admin terhubung ke Sound System / Speaker Gedung Skill Lab.
3. Sistem memutar sinyal audio bel secara otomatis sesuai fase:
   - 🔔 **Bel 1x (Suara Klakson Singkat)**: Penanda *Reading Time* selesai (1 menit) $\rightarrow$ Peserta masuk ruangan stase.
   - 🔔 **Bel 2x (Suara Pengingat)**: Penanda sisa waktu 2 menit lagi *Action Time*.
   - 🚨 **Bel 3x (Suara Sirine Rotasi)**: Penanda *Action Time* habis & masuk *Transition Time* (1 menit) $\rightarrow$ Peserta keluar stase menuju stase berikutnya.

> **Keuntungan**: Menghilangkan ketidakakuratan timer manusia, rotasi 100% tepat waktu 12 menit/stase.

---

## 3. Rekomendasi Fitur Sistem Tambahan (System Features Recommendation)

### 1. Offline-First Architecture & Auto-Sync Engine
- **Teknologi**: Service Worker + `IndexedDB` / `localStorage` state persistence.
- **Fungsi**: Setiap karakter yang diketik peserta di blangko diagnosis/resep atau klik skor oleh penguji disimpan terlebih dahulu di memori browser lokal.
- **Toleransi Network**: Jika Wi-Fi gedung mati total selama 5 menit, ujian tetap dapat berlangsung tanpa *error*. Saat sinyal kembali, data otomatis di-sinkronkan (*background sync*) ke server database.

### 2. Multi-Track / Parallel Circuit (Circuit Track A & B)
- **Fungsi**: Jika jumlah peserta sangat banyak (misal: 100 mahasiswa), Admin dapat membuka 2 Sirkuit Paralel bersamaan:
  - **Track A**: Sirkuit 8 Stase di Gedung Lantai 1.
  - **Track B**: Sirkuit 8 Stase di Gedung Lantai 2.
- **Kontrol**: 1 Dashboard Admin dapat memantau dan mengendalikan kedua track sirkuit secara terpisah maupun serentak.

### 3. Templat & Bank Soal Modular (Package Duplicator)
- **Fungsi**: Admin dapat menyimpan konfigurasi stase (skenario, rubrik, penunjang) sebagai templat paket soal (*Paket A, Paket B, Ujian Remedial, Ujian Utama*).
- **Keuntungan**: Pembuatan sesi ujian baru yang memiliki struktur stase serupa cukup dilakukan dengan 1-klik *Duplicate / Import Template*.

### 4. Item Analysis & Evaluasi Rubrik (Reliabilitas Soal)
- **Fungsi**: Modul analisis statistik otomatis setelah ujian selesai:
  - **Tingkat Kesukaran Soal (Difficulty Index)**: Menilai apakah suatu stase terlalu sulit atau terlalu mudah bagi peserta.
  - **Korelasi Skor Penguji (Inter-Rater Reliability)**: Menilai konsistensi pemberian nilai antar dokter penguji.
- **Output**: Grafik distribusi nilai per stase untuk keperluan evaluasi kurikulum institusi.

### 5. Queue-Based Bulk PDF & Email Dispatcher
- **Fungsi**: Proses generate transkrip PDF dan pengiriman email tidak dilakukan di thread utama browser.
- **Teknologi**: Background Worker Queue.
- **Alur**: Begitu Admin menekan `Publish Result`, server memproses antrean cetak PDF & email secara bertahap di belakang layar tanpa mengganggu performa dashboard.

---

## 4. Matriks Perbandingan Alur Standar vs Rekomendasi

| Fitur / Alur | Alur Standar | Rekomendasi Alternatif (RECOMEND.md) | Manfaat Utamanya |
| :--- | :--- | :--- | :--- |
| **Akses Layar Stase** | Login akun peserta masing-masing di tiap stase. | **Station Kiosk Mode + Scan QR / Dropdown Nama**. | Mencegah salah login & hemat 2 menit/stase. |
| **Pengoperasian Bel** | Bel manual dipukul petugas lapangan. | **Centralized Web Audio API terhubung speaker gedung**. | Timer rotasi 12 menit akurat hingga milidetik. |
| **Resiliensi Koneksi** | Membutuhkan Wi-Fi online secara terus-menerus. | **Offline-First (IndexedDB Auto-Sync)**. | Ujian aman dari gangguan Wi-Fi putus. |
| **Tampilan Penguji** | Tab terpisah untuk jawaban peserta & rubrik. | **Dual-Panel Side-by-Side Monitor**. | Penilaian penguji jauh lebih cepat & objektif. |
| **Penyiapan Soal** | Input ulang stase satu per satu tiap ujian. | **Package Duplicator (Bank Soal Paket A/B)**. | Efisiensi penyiapan ujian hingga 80%. |
| **Pengiriman Hasil** | Download manual satu per satu. | **Queue-Based Auto PDF & Email Queue Worker**. | Seluruh peserta otomatis terima PDF via Email. |

---

> **Rekomendasi Implementasi Bertahap**:  
> Rekomendasi di atas dapat diimplementasikan secara bertahap dimulai dari **Offline-First Auto-Sync** dan **Station Kiosk Mode**, diikuti oleh **Centralized Audio Bell System** untuk memastikan ekosistem Ujian OSCE MedSkill sangat andal dan siap pakai di institusi kedokteran mana pun.
