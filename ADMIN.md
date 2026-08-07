# Dokumentasi Sistem Pengelolaan Administrator (ADMIN.md)
## MedSkill OSCE Exam Platform

Dokumen ini berisi panduan komprehensif mengenai **Arsitektur Halaman Administrator**, **Alur Kerja Pengelolaan Ujian OSCE**, serta **Tabel Evaluasi Kesesuaian Frontend Mockup Saat Ini** terhadap kebutuhan ujian medis OSCE (*Objective Structured Clinical Examination*) di Indonesia.

---

## 🏛️ 1. Peta Arsitektur Halaman Administrator

Sistem Administrator MedSkill OSCE terdiri dari **12 Modul Utama** yang saling terintegrasi untuk mengelola seluruh siklus ujian, mulai dari persiapan bank soal hingga analisis hasil ujian pasca-rotasi.

```
/admin
├── 📊 Dashboard Control Room (`AdminPage.jsx`)
├── 🔴 Master Live Control Room (`LiveMonitorPage.jsx`)
├── 🗓️ Manajemen Sesi OSCE (`SessionsPage.jsx`)
│   ├── ➕ Wizard Pembuat Sesi (`CreateSessionPage.jsx`)
│   ├── 🔍 Detail Sesi & Roster (`SessionDetailPage.jsx`)
│   ├── 👥 Alokasi Gelombang Peserta (`SessionParticipantsPage.jsx`)
│   └── 🩺 Alokasi Penugasan Penguji (`SessionExaminersPage.jsx`)
├── 📝 Editor Skenario & Rubrik (`StageQuestionPage.jsx`)
├── 👨‍🎓 Master Bank Data Peserta (`ParticipantsPage.jsx`)
├── 👨‍⚕️ Master Bank Data Penguji (`ExaminersPage.jsx`)
├── 📂 Master Bank Soal & Kasus (`CasesPage.jsx`)
└── 📊 Pusat Laporan & Ekspor Nilai (`ReportsPage.jsx`)
```

---

## 📑 2. Rincian Fungsionalitas Modul Admin

| No | Modul & Route Path | File Komponen | Fungsionalitas Utama |
|:---:|:---|:---|:---|
| 1 | **Dashboard Utama**<br>`/admin` | `AdminPage.jsx` | Ringkasan statistik realtime (Jumlah Peserta, Penguji, Mentor, & Sesi Aktif), kartu monitoring sesi live, serta log aktivitas sistem. |
| 2 | **Master Live Control Room**<br>`/admin/live` | `LiveMonitorPage.jsx` | Ruang kendali utama saat ujian berlangsung. Sinkronisasi *master timer* (Stase 1 - 6), kontrol pause/resume/next rotasi, visualisasi status live 6 stase, serta pengiriman pesan *broadcast*. |
| 3 | **Daftar Sesi OSCE**<br>`/admin/sessions` | `SessionsPage.jsx` | Kelola seluruh sesi ujian (Draft, Scheduled, Ongoing, Finished), pencarian sesi berbasis institusi/periode, serta filter status. |
| 4 | **Wizard Pembuat Sesi**<br>`/admin/sessions/create` | `CreateSessionPage.jsx` | Form multi-langkah pembuatan sesi ujian: Pengaturan Umum & Jadwal, Konfigurasi Stase 1-8, Alokasi Peserta, serta Plotting Dokter Penguji. |
| 5 | **Detail Sesi Ujian**<br>`/admin/sessions/:id` | `SessionDetailPage.jsx` | Tampilan rincian sesi tertentu: Roster peserta, penugasan stase penguji, jadwal rotasi gelombang, serta status kesiapan stase. |
| 6 | **Alokasi Peserta Sesi**<br>`/admin/sessions/:id/participants` | `SessionParticipantsPage.jsx` | Manajemen peserta spesifik sesi: Import data CSV/Excel, plotting gelombang ujian, serta pemeriksaan nomor ujian/NIM. |
| 7 | **Alokasi Penguji Sesi**<br>`/admin/sessions/:id/examiners` | `SessionExaminersPage.jsx` | Plotting dokter penguji per stase, verifikasi akun penguji aktif, serta pengaturan hak akses evaluasi. |
| 8 | **Editor Skenario & Rubrik**<br>`/admin/stages/:stageId` | `StageQuestionPage.jsx` | Input skenario kasus klinis, instruksi peserta/penguji, Kunci Indikasi Penunjang (X-Ray, EKG, Lab), serta penyusunan item rubrik skor 0-3 & bobot kompetensi. |
| 9 | **Master Data Peserta**<br>`/admin/participants` | `ParticipantsPage.jsx` | Database induk mahasiswa/peserta: Pencarian NIM, institusi, riwayat keikutsertaan ujian, serta status verifikasi akun. |
| 10 | **Master Data Penguji**<br>`/admin/examiners` | `ExaminersPage.jsx` | Database induk dosen penguji: NIP, nama lengkap & gelar, spesialisasi medis (Sp.JP, Sp.PD, Sp.A, dll), serta riwayat pengujian. |
| 11 | **Bank Soal & Kasus Medis**<br>`/admin/cases` | `CasesPage.jsx` | Repository bank soal klinis berbasis sistem organ (Kardiovaskular, Respirasi, Neuro, dll) yang siap digunakan pada sesi ujian. |
| 12 | **Laporan & Ekspor Nilai**<br>`/admin/reports` | `ReportsPage.jsx` | Pusat rekapitulasi nilai akhir, perhitungan *Borderline Regression Method (Standard Setting)*, serta ekspor laporan PDF/Excel resmi. |

---

## 🔍 3. Tabel Evaluasi Kesesuaian Frontend Mockup Administrator Saat Ini

Tabel berikut membandingkan kondisi **Frontend Mockup Admin saat ini** dengan **Standar Kebutuhan Ujian OSCE Nasional (AIPKI/Kemenkes)**:

| Komponen Administrator | Kondisi di Frontend Mockup Saat Ini | Status Kesesuaian | Catatan & Rekomendasi Penyesuaian |
|:---|:---|:---:|:---|
| **Master Live Timer Synchronization** | `LiveMonitorPage.jsx` sudah memiliki kontrol master timer (Start/Pause/Next Round) dan pemantauan status stase. | ✅ **Sesuai & Berfungsi** | Tingkatkan visualisasi grid 8 stase agar lebih responsif dan beri indikator visual jika ada stase yang terlambat mengunci nilai. |
| **Penyusunan Rubrik Skor 0 - 3 & Bobot** | `StageQuestionPage.jsx` menyediakan form input item rubrik dan opsi bobot kompetensi. | ✅ **Sesuai** | **Rekomendasi**: Tambahkan input khusus untuk **Matriks Deskriptor Kriteria (Deskripsi Skor 0, 1, 2, 3)** per item agar otomatis muncul di halaman penguji (`ExaminerStagePage.jsx`). |
| **Kunci Indikasi Pemeriksaan Penunjang** | `StageQuestionPage.jsx` mendukung input kunci pemeriksaan penunjang (Laboratorium, EKG, Radiologi) serta upload berkas lampiran. | ✅ **Sesuai & Presisi** | Berkas berkas gambar/PDF penunjang yang diunggah admin langsung terintegrasi dengan modal berkas hasil di sisi peserta & penguji. |
| **Plotting Gelombang & Rotasi Peserta** | `CreateSessionPage.jsx` & `SessionParticipantsPage.jsx` dapat membagi peserta ke dalam gelombang (*waves*) dan ronde rotasi. | ✅ **Sesuai** | Memastikan urutan rotasi peserta berpindah secara otomatis dari Stase 1 $\rightarrow$ Stase 2 $\rightarrow$ ... $\rightarrow$ Stase 8. |
| **Pusat Rekapitulasi & Standard Setting (NBL)** | `ReportsPage.jsx` saat ini masih berupa tampilan placeholder (*Coming Soon*). | ⚠️ **Perlu Ditingkatkan** | **Prioritas Utama**: Kembangkan UI Laporan Rekap Nilai yang mencakup grafik sebaran skor, perhitungan Nilai Batas Lulus (NBL) metode *Borderline Regression*, serta tombol Ekspor Rekap Excel/PDF. |
| **Bank Soal & Kasus Medis** | `CasesPage.jsx` menyediakan CRUD data kasus medis dasar. | ✅ **Sesuai** | Tambahkan tag sistem organ (Kardiovaskular, Respirasi, Digestif, dll) dan tingkat kompetensi SKDI (3A, 3B, 4A) pada tiap kasus. |

---

## 🚀 4. Rekomendasi Penyesuaian & Rencana Pengembangan Fitur Admin

Untuk menyempurnakan alur kerja administrator dalam waktu dekat, berikut adalah poin-poin penyesuaian utama yang disarankan:

### 1. Pengembangan Halaman `ReportsPage.jsx` (Pusat Rekapitulasi Nilai)
- **Modul Rekapitulasi Skor Realtime**: Tabel rekapitulasi nilai akhir peserta gabungan dari Stase 1 hingga Stase 8.
- **Kalkulasi NBL (Borderline Regression Standard Setting)**: Fitur otomatisasi penetapan Nilai Batas Lulus (NBL) nasional dengan memplot skor terbobot rubrik (*Objective Score*) terhadap nilai *Global Performance Rating* (Tidak Lulus, Borderline, Lulus, Superior).
- **Cetak Borang Resmi (PDF/Excel Export)**: Fitur 1-klik untuk mengunduh berita acara ujian dan sertifikat hasil OSCE peserta.

### 2. Penyempurnaan `StageQuestionPage.jsx` (Editor Rubrik Ujian)
- **Input Deskriptor Level 0-3**: Menambahkan 4 field teks deskriptor (*Skor 0 (Tidak Dilakukan)*, *Skor 1 (Minimal)*, *Skor 2 (Memadai)*, *Skor 3 (Sempurna)*) pada setiap item rubrik yang dibuat admin.
- **Penetapan Jenis Kompetensi SKDI**: Menyesuaikan pilihan dropdown kompetensi dengan 7 area kompetensi standar nasional (Anamnesis, Pemeriksaan Fisik, Penunjang, Diagnosis & DDx, Tata Laksana/Resep Medis, Komunikasi & Edukasi, Perilaku Profesional).

### 3. Fitur Broadcast Control Room pada `LiveMonitorPage.jsx`
- **Pengiriman Pesan Pengumuman Live**: Memungkinkan admin mengirimkan notifikasi penting yang langsung muncul di layar peserta dan penguji (misal: *"Waktu sisa 2 menit lagi"*, *"Persiapkan perpindahan stase"*).
