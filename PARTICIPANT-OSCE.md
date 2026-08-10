# 🎓 PARTICIPANT-OSCE.md — Panduan Master, Hak Akses & Spesifikasi Fitur Peserta Ujian
**Praxis by MedSkill Indonesia** — *Dokumentasi Resmi Peran & Antarmuka Peserta Ujian (Participant)*  
*Terakhir diperbarui: 8 Agustus 2026*

---

## 📑 Daftar Isi
1. [Prinsip Dasar & Tanggung Jawab Peserta Ujian](#1-prinsip-dasar--tanggung-jawab-peserta-ujian)
2. [Peta Hak Akses & Matriks Keamanan (Access Control & RLS)](#2-peta-hak-akses--matriks-keamanan-access-control--rls)
3. [Peta Navigasi & Modul Halaman Peserta (Participant Routes)](#3-peta-navigasi--modul-halaman-peserta-participant-routes)
4. [Spesifikasi Fungsionalitas & Fitur Antarmuka](#4-spesifikasi-fungsionalitas--fitur-antarmuka)
   - [4.1 Dashboard Utama Peserta (`/participant`)](#41-dashboard-utama-peserta-participant)
   - [4.2 Pre-Exam Waiting Room & Briefing (`/participant/waiting-room/:sessionId`)](#42-pre-exam-waiting-room--briefing-participantwaiting-roomsessionid)
   - [4.3 Kiosk Live Ujian Stase Multi-Halaman (`/participant/session/:sessionId`)](#43-kiosk-live-ujian-stase-multi-halaman-participantsessionsessionid)
   - [4.4 Post-Station Transit Waiting Room (`/participant/transit/:sessionId`)](#44-post-station-transit-waiting-room-participanttransitsessionid)
   - [4.5 Rekapitulasi Hasil & Transkrip Nilai (`/participant/result`)](#45-rekapitulasi-hasil--transkrip-nilai-participantresult)
5. [Logika Pemeriksaan Penunjang & Aturan Output Berkas](#5-logika-pemeriksaan-penunjang--aturan-output-berkas)
6. [Pemetaan Schema Database `osce` & Service Layer](#6-pemetaan-schema-database-osce--service-layer)
7. [Tabel Evaluasi Kesesuaian Frontend & Rencana Penyesuaian](#7-tabel-evaluasi-kesesuaian-frontend--rencana-penyesuaian)

---

## 1. Prinsip Dasar & Tanggung Jawab Peserta Ujian

1. **Definisi Peran Peserta Ujian (*Participant*)**:
   - Mahasiswa Kedokteran Klinik / Dokter Muda / Dokter Spesialis yang terdaftar secara sah pada Sesi Ujian OSCE untuk menjalani pengujian kompetensi klinis komprehensif.
2. **Arsitektur Sirkuit Terpadu 6 Stase Aktif**:
   - Setiap 1 Sesi Ujian OSCE terdiri dari **6 Stase Keterampilan Medis Aktif** yang wajib diikuti oleh peserta secara berurutan dalam sirkuit rotasi (Kanban Order).
   - **Struktur Timer Baku Per Stase (Total 12 Menit/Stase)**:
     - **Reading Time**: 1 Menit (Membaca skenario kasus klinis di depan pintu stase).
     - **Action Time**: 10 Menit (Pelaksanaan tindakan klinis di dalam stase & pengisian blangko kiosk).
     - **Transition Time**: 1 Menit (Jeda rotasi pergerakan menuju stase berikutnya).
3. **Alur Ujian Multi-Halaman Berurutan (*Stepped Examination Flow*)**:
   - Kiosk ujian peserta terbagi secara terstruktur menjadi **4 Halaman Berurutan** per stase:
     - **Halaman 1**: Pengujian Anamnesis & Pengenalan Kasus.
     - **Halaman 2**: Pengujian Pemeriksaan Fisik & Tanda Vital.
     - **Halaman 3**: Pengujian & Checklist Pemeriksaan Penunjang (EKG, Radiologi, Lab).
     - **Halaman 4**: Pengujian Form Diagnosis Kerja (WDx), 3 Diagnosis Banding (DDx), & Blangko Resep Obat.
4. **Prinsip Navigasi Satu Arah (*One-Way Forward / No Back Button*)**:
   - Navigasi pengerjaan kiosk bersifat murni **searah (maju)**. Peserta **tidak dapat kembali (*no back button*)** ke halaman atau stase yang sudah dilewati guna menjaga integritas ujian dan mencegah kecurangan.
5. **Ruang Tunggu Transit Perpindahan Stase (*Post-Station Waiting Room*)**:
   - Setelah menyelesaikan Halaman 4 pada suatu stase, peserta secara otomatis memasuki layar transit perpindahan stase dengan timer countdown transisi (customizable admin, default 2 menit) serta tombol bypass `[Lanjut ke Stase Selanjutnya]`.

---

## 2. Peta Hak Akses & Matriks Keamanan (Access Control & RLS)

Sistem MedSkill OSCE menerapkan **Row Level Security (RLS)** pada PostgreSQL schema `osce` untuk memastikan peserta ujian hanya dapat mengakses data miliknya sendiri dan sesi yang berstatus publik.

### A. Matriks Hak Akses Schema `osce` untuk Role `participant`

| Tabel Database | Hak Akses (RLS) | Cakupan Akses & Batasan |
|:---|:---:|:---|
| `osce.sessions` | `SELECT` | Hanya membaca sesi berstatus `published`, `ongoing`, `running`, atau `completed`. |
| `osce.stations` | `SELECT` | Membaca daftar 6 stase aktif pada sesi yang terdaftar. |
| `osce.rubric_items` | *Denied* | Peserta tidak dapat membaca rincian poin rubrik penilai saat ujian berlangsung. |
| `osce.station_auxiliary_configs` | `SELECT` | Membaca daftar item penunjang & berkas medis yang diizinkan rilis oleh admin. |
| `osce.session_participants` | `SELECT` / `INSERT` | Membaca status pendaftaran & mendaftar pada sesi terbuka (`user_id = auth.uid()`). |
| `osce.participant_answers` | `SELECT` / `INSERT` / `UPDATE` | Membaca & menyimpan isian blangko jawaban peserta pada stase aktif (`user_id = auth.uid()`). |
| `osce.examiner_evaluations` | `SELECT` | Hanya dapat membaca nilai & feedback **setelah sesi dipublikasikan oleh admin** (`status = 'completed'`). |
| `osce.rubric_scores` | `SELECT` | Membaca rincian perolehan poin per item rubrik setelah hasil dipublikasikan admin. |
| `osce.session_timer_state` | `SELECT` | Membaca master timer server-side (`target_end_time`, `phase`) untuk sinkronisasi topbar. |
| `osce.broadcast_messages` | `SELECT` | Membaca notifikasi & pengumuman darurat real-time dari Admin Control Room. |
| `osce.audit_logs` | *Denied* | Peserta tidak memiliki akses ke log audit sistem. |

---

## 3. Peta Navigasi & Modul Halaman Peserta (Participant Routes)

Peserta diatur menggunakan rute navigasi publik dan terkontrol sebagai berikut:

```
/participant
├── 🏠 Dashboard Utama Peserta (`ParticipantDashboardPage.jsx`)
├── ⏳ Pre-Exam Waiting Room & Briefing (`PreExamWaitingRoomPage.jsx`)
│   └── `/participant/waiting-room/:sessionId`
├── 📝 Kiosk Live Ujian Stase Multi-Halaman (`ParticipantSessionPage.jsx`)
│   └── `/participant/session/:sessionId` (Multi-step: Hal 1 ➔ 2 ➔ 3 ➔ 4)
├── 🚶 Post-Station Transit Waiting Room (`PostStationWaitingRoomPage.jsx`)
│   └── `/participant/transit/:sessionId`
├── 📊 Rekapitulasi Hasil & Transkrip Ujian (`ParticipantResultPage.jsx`)
│   └── `/participant/result`
└── 📜 Detail Transkrip PDF & Feedback Stase (`ParticipantResultDetailPage.jsx`)
    └── `/participant/result/:sessionId`
```

---

## 4. Spesifikasi Fungsionalitas & Fitur Antarmuka

### 4.1 Dashboard Utama Peserta (`/participant`)

Halaman utama tempat peserta melihat status pendaftaran dan jadwal ujian sirkuit:

1. **Header Navigation Bar**:
   - Menampilkan Nama Lengkap Peserta, Gelar (misal: *Ahmad Rizky Pratama, S.Ked*), NIK/NIM, dan Institusi Kedokteran.
   - Tombol `[Keluar / Logout]`.
2. **Kartu Highlight Status Sesi Live (`Ongoing Session Live Banner`)**:
   - **Jika Sesi Live Berlangsung (`ongoing` / `running`)**:
     - Banner Gradien Gelap dengan Indikator Pulsa Hijau: `"SESI UJIAN OSCE SEDANG BERLANGSUNG (LIVE)"`.
     - Menampilkan Judul Sesi, Lokasi Gedung Skill Lab, dan Jumlah Pos Rotasi.
     - Tombol Animasi Bouncing `[Masuk ke Kiosk Ujian OSCE Live]`.
   - **Jika Sesi Standby / Belum Ada Ujian Live**:
     - Banner Standby: `"Sistem Standby • Tidak Ada Sesi Ujian Aktif Saat Ini"`.
3. **Daftar Sesi Ujian Sirkuit Terdaftar (*Enrolled Sessions List*)**:
   - Searchbar pencarian nama sesi ujian / gedung.
   - Filter tab status (`Sesi Terdaftar` / `Riwayat Hasil`).
   - **Empty State Card Interaktif**: Bila belum ada sesi terdaftar (`0 Sesi`), menampilkan ilustrasi kalender soft-blue, judul *"Belum Ada Sesi Ujian Aktif / Terdaftar Saat Ini"*, deskripsi panduan, dan tombol `[Refresh Jadwal Ujian]`.

---

### 4.2 Pre-Exam Waiting Room & Briefing (`/participant/waiting-room/:sessionId`)

Ruang tunggu pra-ujian tempat peserta melakukan persiapan dan membaca briefing:

1. **Informasi Lokasi & Rotasi**:
   - Menampilkan Lokasi Ruang Tunggu Fisik (misal: *Gedung Skill Lab Ruang 101*).
   - Penugasan Gelombang & Ronde Rotasi (misal: *Gelombang #1 • Ronde #1 dari 6 Rotasi*).
   - Nama Dokter Penguji & Pasien Standar AI/Real penanggung jawab stase awal.
2. **Lembar Tata Tertib & Briefing Peserta**:
   - Poin-poin aturan keselamatan, sterilitas, penggunaan stetoskop/penlight, serta larangan membawa alat komunikasi.
3. **Countdown Otomatis & Sinyal Mulai Admin**:
   - Peserta tetap berada di halaman ini (*stay in page*) hingga Admin Control Room menekan tombol **Start Simulation**.
   - Sinyal bel Audio Web API (1-Chime) berbunyi otomatis saat timer 00:00 tercapai.

---

### 4.3 Kiosk Live Ujian Stase Multi-Halaman (`/participant/session/:sessionId`)

Antarmuka utama kiosk pengerjaan ujian live peserta per stase:

1. **Top Navigation Bar Synchronized Timer**:
   - Menampilkan **Countdown Timer Continuous Stase (12 Menit Total)**.
   - Indikator Fase: **Reading Time (1m)** $\rightarrow$ **Action Time (10m)** $\rightarrow$ **Transition Time (1m)**.
   - Indikator Nomor Stase & Judul Kasus Medis.
2. **Stepped Flow 4 Halaman Berurutan**:
   - **Halaman 1 (Anamnesis)**:
     - Panel Kiri: Skenario Kasus Klinis (Keluhan Utama, Usia, Jenis Kelamin, Vital Signs Awal).
     - Panel Kanan: Instruksi anamnesis medis langsung kepada pasien standar/simulator. Tombol `[Selanjutnya: Pemeriksaan Fisik]`.
   - **Halaman 2 (Pemeriksaan Fisik)**:
     - Panel Kiri: Skenario Kasus & Tanda Vital (TTV).
     - Panel Kanan: Panduan prosedur pemeriksaan fisik (Inspeksi, Palpasi, Perkusi, Auskultasi). Tombol `[Selanjutnya: Pemeriksaan Penunjang]`.
   - **Halaman 3 (Pemeriksaan Penunjang)**:
     - Topbar Filter & Searchbar Kategori (Radiologi, Elektromedis, Laboratorium, Enzim).
     - Multi-Column Grid Checklist (`grid-cols-2`) item pemeriksaan penunjang.
     - Tombol `[Minta Hasil Pemeriksaan & Lanjut]`.
     - **Alur Modal Sekuensial**:
       1. Menekan submit $\rightarrow$ Membuka **Result Modal** (tampilan berkas X-Ray/EKG/Lab hasil permintaan).
       2. Menekan `[Lanjut ke Diagnosis & Resep]` di Result Modal $\rightarrow$ Membuka **Modal Konfirmasi One-Way Forward**.
   - **Halaman 4 (Diagnosis & Penulisan Resep)**:
     - Input Text 1 Baris: **Diagnosis Kerja Utama (WDx)**.
     - Input Text 3 Baris: **Diagnosis Banding (DDx 1, DDx 2, DDx 3)**.
     - Textarea Long Text: **Blangko Penulisan Resep Obat (Rx)**.
     - Tombol `[Selesaikan Stase Ini]`.
3. **Modal Konfirmasi Navigasi Satu Arah (*One-Way Forward Confirmation Modal*)**:
   - Setiap kali peserta menekan `[Selanjutnya]`, memunculkan dialog konfirmasi: *"Apakah Anda yakin ingin melanjutkan? Anda tidak dapat kembali ke halaman ini."* dengan pilihan `[Batal / Periksa Kembali]` dan `[Ya, Lanjutkan]`.

---

### 4.4 Post-Station Transit Waiting Room (`/participant/transit/:sessionId`)

Layar ruang tunggu perpindahan ruangan stase pasca penyelesaian Halaman 4:

1. **Fungsi Ruang Transit**: Memberikan jeda waktu fisik bagi peserta untuk berpindah dari ruangan stase saat ini ke ruangan stase berikutnya dalam sirkuit rotasi.
2. **Fitur Ruang Transit**:
   - **Timer Countdown Transit**: Countdown waktu istirahat rotasi (Default: 2 menit).
   - **Informasi Stase Berikutnya**: Menampilkan Nomor Stase Target, Nomor Ruang Skill Lab, dan Dokter Penguji selanjutnya.
   - **Tombol Bypass**: `[Lanjut ke Stase Selanjutnya]` agar peserta yang sudah berada di depan pintu ruangan target dapat langsung masuk tanpa menunggu timer transit habis.

---

### 4.5 Rekapitulasi Hasil & Transkrip Nilai (`/participant/result`)

Halaman pasca-ujian tempat peserta melihat hasil kelulusan setelah dipublikasikan oleh Admin:

1. **Ringkasan Skor Sesi**:
   - Total Nilai Akhir Sesi ($\text{Rata-rata Skor 6 Stase Aktif}$).
   - Status Kelulusan: `LULUS` (Emerald Badge) / `TIDAK LULUS` (Rose Badge).
   - Tanggal Ujian & Tanggal Publikasi Nilai Resmi.
2. **Breakdown Nilai Per Stase (6 Stase Aktif)**:
   - Tabel persentase nilai per stase, predikat GRS (`SUPERIOR`, `SATISFACTORY`, `BORDERLINE`, `UNSATISFACTORY`), dan Catatan Umpan Balik Kualitatif Dokter Penguji.
3. **Cetak & Unduh Transkrip PDF**:
   - Tombol `[Cetak / Unduh Transkrip Hasil OSCE (PDF)]` untuk mengunduh rekapitulasi nilai resmi bertanda tangan institusi.

---

## 5. Logika Pemeriksaan Penunjang & Aturan Output Berkas

Pada Halaman 3 (Pemeriksaan Penunjang), sistem menerapkan logika pencocokan indikasi berbasis data yang disusun oleh Admin:

| Tindakan Checklist Peserta | Status Indikasi Admin | Tampilan Output Pada Result Modal | Status Log Database |
|:---|:---|:---|:---:|
| **Dicentang** | **Indikasi Benar (Gambar/Data Ada)** | Berkas Media (Gambar X-Ray/EKG Strip/PDF Lab) + Laporan Ekspertise Resmi Muncul | `matched_key = true` |
| **Dicentang** | **Non-Indikasi / Tidak Ada Data Admin** | Menampilkan Keterangan: *"Hasil Tidak Tersedia / Pemeriksaan Tidak Diindikasikan"* | `matched_key = false` |
| **Tidak Dicentang** | **Indikasi / Non-Indikasi** | Berkas Tidak Ditampilkan Kepada Peserta | `not_requested` |

---

## 6. Pemetaan Schema Database `osce` & Service Layer

Pengembangan antarmuka peserta menggunakan service layer **`participantService.js`** yang terhubung ke PostgreSQL schema `osce`:

```javascript
// Operasi Utama Service Layer Peserta (participantService.js)

// 1. Ambil daftar sesi terdaftar & publikasi
export async function fetchParticipantSessions(participantUserId)

// 2. Ambil detail stase aktif & urutan rotasi peserta
export async function fetchParticipantCircuitRotation(sessionId, participantUserId)

// 3. Simpan / Sync Real-time jawaban peserta per halaman stase
export async function saveParticipantAnswerStep({
  session_id,
  station_id,
  participant_id,
  rotation_round,
  current_step,
  anamnesis_notes,
  physical_exam_notes,
  requested_auxiliary_json,
  working_diagnosis,
  differential_dx_1,
  differential_dx_2,
  differential_dx_3,
  prescription_text,
})

// 4. Ambil rekapitulasi nilai & feedback pasca publikasi admin
export async function fetchParticipantFinalResult(sessionId, participantUserId)
```

---

## 7. Tabel Evaluasi Kesesuaian Frontend & Rencana Penyesuaian

| Modul Halaman | Status Saat Ini | Rencana Penyesuaian Sesuai Spesifikasi | Status Verifikasi |
|:---|:---:|:---|:---:|
| **Dashboard Peserta (`/participant`)** | 🟢 Sesuai | Ditambahkan Empty State Card interaktif `[Refresh Jadwal Ujian]` saat 0 sesi aktif. | **SELESAI (100%)** |
| **Pre-Exam Waiting Room (`/participant/waiting-room/:sessionId`)** | 🟡 Perlu Opsi | Mengintegrasikan countdown briefing & sinyal bel otomatis dari Admin Control Room. | **DALAM PROSES** |
| **Kiosk Live Stase (`/participant/session/:sessionId`)** | 🟢 Sesuai | Implementasi Multi-Step 4 Halaman, One-Way Confirmation Modal, & Form Resep. | **SELESAI (100%)** |
| **Post-Station Transit (`/participant/transit/:sessionId`)** | 🟢 Sesuai | Timer countdown transit 2 menit & tombol bypass `[Lanjut ke Stase Selanjutnya]`. | **SELESAI (100%)** |
| **Rekapitulasi Hasil (`/participant/result`)** | 🟢 Sesuai | Menampilkan persentase nilai 6 stase, GRS rating, feedback penguji, & Cetak PDF. | **SELESAI (100%)** |

---
*Dokumen ini menjadi acuan master resmi pengembangan dan audit fitur Portal Peserta Ujian OSCE Praxis by MedSkill Indonesia.*
