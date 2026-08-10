# 🩺 EXAMINER-OSCE.md — Panduan Master, Hak Akses & Spesifikasi Fitur Dokter Penguji
**Praxis by MedSkill Indonesia** — *Dokumentasi Resmi Peran & Antarmuka Penguji (Examiner)*  
*Terakhir diperbarui: 8 Agustus 2026*

---

## 📑 Daftar Isi
1. [Prinsip Dasar & Tanggung Jawab Dokter Penguji](#1-prinsip-dasar--tanggung-jawab-dokter-penguji)
2. [Peta Hak Akses & Matriks Keamanan (Access Control & RLS)](#2-peta-hak-akses--matriks-keamanan-access-control--rls)
3. [Peta Navigasi & Modul Halaman Penguji (Examiner Routes)](#3-peta-navigasi--modul-halaman-penguji-examiner-routes)
4. [Spesifikasi Fungsionalitas & Fitur Antarmuka](#4-spesifikasi-fungsionalitas--fitur-antarmuka)
   - [4.1 Dashboard Utama Penguji (`/examiner`)](#41-dashboard-utama-penguji-examiner)
   - [4.2 Lembar Penilaian Live Stase (`/examiner/stage/:stageId`)](#42-lembar-penilaian-live-stase-examinerstagestageid)
   - [4.3 Tampilan Standby & Handling Sesi Non-Aktif](#43-tampilan-standby--handling-sesi-non-aktif)
   - [4.4 Live Monitor & Realtime Feed (`/examiner/live`)](#44-live-monitor--realtime-feed-examinerlive)
   - [4.5 Riwayat & Rekap Nilai Pasca Ujian (`/examiner/history`)](#45-riwayat--rekap-nilai-pasca-ujian-examinerhistory)
5. [Skema Penilaian Rubrik Baku & Global Performance (GRS)](#5-skema-penilaian-rubrik-baku--global-performance-grs)
6. [Pemetaan Schema Database `osce` & Service Layer](#6-pemetaan-schema-database-osce--service-layer)
7. [Tabel Evaluasi Kesesuaian Frontend & Rencana Penyesuaian](#7-tabel-evaluasi-kesesuaian-frontend--rencana-penyesuaian)

---

## 1. Prinsip Dasar & Tanggung Jawab Dokter Penguji

1. **Definisi Peran Dokter Penguji (*Examiner*)**:
   - Dokter Spesialis terverifikasi / Dosen Penguji Klinik yang ditugaskan oleh Admin Institusi untuk menguji dan mengevaluasi kompetensi klinis peserta pada 1 stase ujian spesifik per Sesi OSCE.
2. **Independensi Stase Penugasan**:
   - Setiap Dokter Penguji bertugas di **1 Ruang Stase Fisik** (misal: *Stase 1 - Kardiovaskular*) dan mengevaluasi seluruh peserta gelombang yang berputar masuk ke stase tersebut pada tiap ronde rotasi sirkuit.
3. **Prinsip Objektivitas Penilaian Ganda (*Dual Evaluation*)**:
   - **Penilaian Rubrik Kompetensi SKDI (Skor 0 - 3)**: Mengevaluasi item indikator tindakan medis secara terukur berdasarkan deskriptor kriteria baku (Level 0, 1, 2, 3) yang dikalikan dengan Bobot Kompetensi.
   - **Global Performance Rating Scale (GRS)**: Penilaian holistik klinis penguji terhadap performa keseluruhan peserta (`UNSATISFACTORY`, `BORDERLINE`, `SATISFACTORY`, `SUPERIOR`).
4. **Penyandingan Real-Time Side-by-Side (Gold Standard Reference)**:
   - Dashboard penguji menyandingkan isian langsung peserta (Anamnesis, Pemeriksaan Fisik, Penunjang, WDx, DDx 1-3, dan Resep Obatan) secara *real-time* berdampingan dengan **Kunci Jawaban Baku Resmi dari Admin (*Gold Standard Answer Key*)** untuk akurasi dan kecepatan penskoran.
5. **Finalisasi & Imutabilitas Evaluasi**:
   - Penguji menekan tombol `[Submit & Kunci Nilai]` untuk mengunci evaluasi peserta di ronde aktif (`is_locked = true`). Setiap tindakan penguncian/pengubahan nilai secara otomatis dicatat ke dalam audit trail imutabel (`osce.audit_logs`).

---

## 2. Peta Hak Akses & Matriks Keamanan (Access Control & RLS)

Sistem MedSkill OSCE menerapkan **Row Level Security (RLS)** ketat pada PostgreSQL schema `osce` untuk memastikan Dokter Penguji hanya dapat mengakses dan menilai data yang menjadi wewenangnya.

### A. Matriks Hak Akses Schema `osce` untuk Role `examiner`

| Tabel Database | Hak Akses (RLS) | Cakupan Akses & Batasan |
|:---|:---:|:---|
| `osce.sessions` | `SELECT` | Hanya dapat melihat sesi berstatus `published`, `ongoing`, atau `completed`. |
| `osce.stations` | `SELECT` | Membaca detail stase fisik tempat penguji ditugaskan (`session_examiners`). |
| `osce.rubric_items` | `SELECT` | Membaca item indikator rubrik, bobot, & deskriptor level 0-3 pada stase penugasan. |
| `osce.station_auxiliary_configs` | `SELECT` | Membaca kunci penunjang & berkas medis (EKG, Radiologi, Lab) pada stase penugasan. |
| `osce.session_examiners` | `SELECT` | Membaca data penugasan stase milik akun penguji itu sendiri (`user_id = auth.uid()`). |
| `osce.session_participants` | `SELECT` | Membaca roster nama & NIM peserta terdaftar pada sesi penugasan. |
| `osce.participant_answers` | `SELECT` | Membaca lembar isian jawaban peserta secara *real-time* pada stase penugasan. |
| `osce.examiner_evaluations` | `INSERT` / `UPDATE` | Membuat & menguji evaluasi nilai peserta stase penugasan (Hanya saat `is_locked = false`). |
| `osce.rubric_scores` | `INSERT` / `UPDATE` | Menginput detail skor 0-3 per item rubrik pada evaluasi milik penguji. |
| `osce.rotation_states` | `SELECT` | Membaca status ronde rotasi sirkuit aktif (`round_number`, `status`). |
| `osce.session_timer_state` | `SELECT` | Membaca master timer server-side (`target_end_time`, `phase`) untuk sinkronisasi. |
| `osce.broadcast_messages` | `SELECT` | Membaca notifikasi & pesan broadcast real-time dari Admin Control Room. |
| `osce.audit_logs` | *Denied* | Penguji tidak memiliki akses langsung ke audit log (ditangani otomatis oleh database trigger). |

---

## 3. Peta Navigasi & Modul Halaman Penguji (Examiner Routes)

Penguji diatur menggunakan layout induk **`ExaminerLayout.jsx`** dengan rincian rute navigasi sebagai berikut:

```
/examiner
├── 🏠 Dashboard Utama Dokter Penguji (`ExaminerPage.jsx`)
├── 🩺 Lembar Penilaian Live Stase (`ExaminerStagePage.jsx`)
│   ├── `/examiner/stage`            → Auto-load stase penugasan aktif
│   └── `/examiner/stage/:stageId`   → Lembar penilaian stase spesifik
├── 🔴 Live Monitor Sirkuit Peserta (`LiveMonitorPage.jsx`)
│   ├── `/examiner/live`             → Feed pergerakan seluruh peserta
│   └── `/examiner/live/:stageId`    → Feed pergerakan per pos stase
├── 📜 Riwayat & Rekap Penilaian (`ExaminerHistoryPage.jsx`)
│   └── `/examiner/history/:historyId` → Detail rekapitulasi penilaian lampau
└── 📝 Editor Umpan Balik Detail (`FeedbackPage.jsx`)
    └── `/examiner/feedback/:answerId` → Formulir revisi catatan feedback
```

---

## 4. Spesifikasi Fungsionalitas & Fitur Antarmuka

### 4.1 Dashboard Utama Penguji (`/examiner`)

Halaman utama dokter penguji setelah masuk ke portal sistem:

1. **Header Banner Profil Penguji**:
   - Menampilkan Nama Lengkap + Gelar Spesialis (misal: *dr. Alexander Budiman, Sp.JP*).
   - Menampilkan NIP/NIDN, Spesialisasi Medis, dan Institusi.
   - Tombol Akses Cepat `[Masuk ke Penilaian Live Stase]`.
2. **Kartu Highlight Status Sesi Live (`Ongoing Session Card`)**:
   - **Kondisi Sesi Aktif (`ongoing` / `running`)**:
     - Menampilkan Judul Sesi, Gedung & Ruang Skill Lab, Durasi per Stase (12 Mnt), dan Nomor Pos Penugasan (misal: *STASE 1 - Kardiovaskular*).
     - Tombol `[Inspect Lembar Penilaian]` berkedip interaktif.
   - **Kondisi Sesi Standby / Belum Aktif**:
     - Menampilkan Kartu Informasi Standby: *"Jadwal pengujian Anda akan aktif secara otomatis ketika Admin Control Room memulai rotasi sirkuit live."*
3. **Matriks Pos Stase Penugasan (*Assigned Stations Grid*)**:
   - Menampilkan daftar pos stase tempat penguji bertugas beserta judul kasus klinis, sistem organ, dan jumlah item rubrik.

---

### 4.2 Lembar Penilaian Live Stase (`/examiner/stage/:stageId`)

Antarmuka utama saat penguji menilai peserta di dalam ruangan ujian:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: [<- Dashboard]  STASE 1: KARDIOVASKULAR  [Phase: Action 10m]  [Timer: 07:45]   │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│ PANEL KIRI: REAL-TIME JAWABAN PESERTA     │ PANEL KANAN: RUBRIK EVALUASI & KUNCI BAKU  │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Profile Peserta: Ahmad Rizky (NIM)      │ • 🔑 KUNCI JAWABAN BAKU ADMIN (Gold Std)   │
│ • Progress Step: [Step 4/4: Diag & Resep] │   WDx: STEMI Inferior Onset 2 Jam Killip I │
│                                           │   DDx: UAP, Diseksi Aorta, Perikarditis    │
│ • Live Form Isian Peserta:                │   Resep: R/ Aspirin 80mg tab No. IV...     │
│   - Working Dx: STEMI Anteroseptal        ├────────────────────────────────────────────┤
│   - Differential Dx:                      │ • RUBRIK PENILAIAN KOMPETENSI (Skor 0-3):  │
│     1. UAP                                │   [1] Anamnesis (Bobot: 4)                 │
│     2. Angina Pektoris Stabil             │       (0)  (1)  (2)  (3) [i Descriptor]    │
│     3. Diseksi Aorta                      │   [2] Pemeriksaan Fisik (Bobot: 3)         │
│   - Resep Obatan:                         │       (0)  (1)  (2)  (3) [i Descriptor]    │
│     R/ Aspirin tab 80 mg No. IV...        │   [3] Pemeriksaan Penunjang (Bobot: 3)     │
│                                           │       (0)  (1)  (2)  (3) [i Descriptor]    │
│ • Modal Berkas Penunjang Dilihat:         │   [4] Diagnosis & DDx (Bobot: 3)           │
│   - [EKG 12 Lead: STEMI Inferior]         │       (0)  (1)  (2)  (3) [i Descriptor]    │
│   - [Enzim Troponin I: Positif 4.5 ng/mL] │   [5] Resep Farmakoterapi (Bobot: 3)       │
│                                           │       (0)  (1)  (2)  (3) [i Descriptor]    │
│                                           ├────────────────────────────────────────────┤
│                                           │ • GLOBAL PERFORMANCE RATING (GRS):         │
│                                           │   ( ) TIDAK LULUS   ( ) BORDERLINE         │
│                                           │   (•) LULUS         ( ) SUPERIOR           │
│                                           ├────────────────────────────────────────────┤
│                                           │ • CATATAN FEEDBACK PENGUJI:                │
│                                           │   [ Textarea Umpan Balik Kualitatif...   ] │
│                                           ├────────────────────────────────────────────┤
│                                           │ [ Submit & Kunci Nilai Peserta (Round 1) ] │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

#### Komponen Utama Lembar Penilaian:
1. **Synchronized Master Timer Topbar**:
   - Memantau durasi fase stase secara presisi: `Reading Time` (1m), `Action Time` (10m), `Warning Time` (2m), `Transition` (1m).
2. **Panel Kiri — Feed Real-Time Isian Peserta**:
   - **Informasi Peserta Ronde Aktif**: Foto, Nama, NIM, dan Gelombang.
   - **Badge Step Progress Peserta**: Melacak posisi halaman peserta di Kiosk Ujian (`Step 1: Anamnesis`, `Step 2: Fisik`, `Step 3: Penunjang`, `Step 4: Diagnosis & Resep`).
   - **Display Jawaban Live**: Isian Diagnosis Kerja (WDx), 3 Diagnosis Banding (DDx), dan Blangko Resep yang ter-update otomatis begitu peserta mengetik di layarnya.
   - **Display Berkas Penunjang**: Daftar berkas gambar EKG/X-Ray/Lab yang berhasil dibuka oleh peserta pada Halaman 3.
3. **Panel Kanan — Side-by-Side Scoring & Reference Key**:
   - **Accordion Kunci Jawaban Baku (Gold Standard)**: Menampilkan acuan resmi dari Admin sebagai pembanding objektif penskoran.
   - **Pilihan Poin Rubrik 0, 1, 2, 3**:
     - Penguji mengeklik skor per item rubrik kompetensi.
     - **Tooltip / Drawer Deskriptor**: Menampilkan rincian kriteria kinerja level 0 (Salah/Tidak Dilakukan), 1 (Minimal), 2 (Memadai), dan 3 (Sempurna).
     - **Kalkulasi Skor Terbobot**: $\text{Skor Item} = \text{Poin Diberikan} \times \text{Bobot Area Competency}$.
   - **Global Performance Rating (GRS)**: Penguji memilih 1 impresi holistik (`TIDAK LULUS`, `BORDERLINE`, `LULUS`, `SUPERIOR`).
   - **Textarea Catatan Feedback**: Kolom umpan balik kualitatif yang akan dicetak pada laporan PDF hasil peserta.
   - **Tombol `[Submit & Kunci Nilai]`**: Mengunci nilai ronde aktif, mencatat audit log, dan otomatis beralih ke peserta ronde berikutnya saat rotasi sirine berbunyi.

---

### 4.3 Tampilan Standby & Handling Sesi Non-Aktif

Apabila Dokter Penguji membuka antarmuka pengujian live (`/examiner/stage` atau `/examiner/live`) namun **belum ada sesi ujian yang berstatus `ongoing` atau `running`**, sistem secara otomatis beralih ke **Layar Standby Interaktif**:

- **Elemen Layar Standby**:
  - Badge Status: `Sistem Standby • Belum Ada Sesi Ujian Aktif`
  - Pesan Edukatif: *"Sesi pengujian live belum diaktifkan oleh Admin Control Room. Lembar penilaian stase akan terbuka secara otomatis ketika Admin memulai rotasi sirkuit live."*
  - Tombol Navigasi: `[Kembali ke Dashboard Penguji]` dan `[Refresh Status]`.
- **Manfaat**: Mencegah penguji menguji atau menginput nilai pada sesi konsep/draft yang belum resmi dimulai.

---

### 4.4 Live Monitor & Realtime Feed (`/examiner/live`)

Halaman pemantauan rotasi sirkuit khusus penguji untuk melihat pergerakan seluruh peserta pada stase penugasan:

- **Visualisasi Card Rotasi**:
  - Menampilkan posisi stase, nama peserta yang sedang diuji, sisa durasi ronde, dan status penguncian nilai (`Locked` / `In Progress`).
- **Integrasi Web Audio API Bell Synthesizer**:
  - Mengeluarkan sinyal audio bel otomatis sesuai fase:
    - 🔔 **Chime Bell (880 Hz)**: Penanda *Reading Time* berakhir & peserta masuk ruangan.
    - ⚠️ **2-Beep Warning (660 Hz)**: Peringatan sisa waktu 2 menit pengerjaan.
    - 🚨 **3-Siren Alarm (523 - 987 Hz)**: Bel sirine rotasi tanda waktu habis & perpindahan peserta.
- **Overlay Broadcast Toast**:
  - Menampilkan pesan notifikasi darurat yang dikirimkan oleh Admin Control Room secara *real-time*.

---

### 4.5 Riwayat & Rekap Nilai Pasca Ujian (`/examiner/history`)

Setelah sesi ujian OSCE selesai (`completed` / `archived`):

- Penguji dapat meninjau kembali seluruh rekapitulasi penilaian peserta yang pernah diuji pada sesi-sesi sebelumnya.
- Tampilan bersifat **Read-Only** untuk menjaga integritas data pasca-penguncian (*post-lock audit integrity*).
- Menyediakan fitur filter pencarian berdasarkan tanggal sesi, nomor stase, atau nama peserta.

---

## 5. Skema Penilaian Rubrik Baku & Global Performance (GRS)

Penilaian pada antarmuka penguji mengacu pada standar nasional (AIPKI / KKI / Kemenkes RI):

### A. Rumus Perhitungan Skor Stase Terbobot
$$\text{Total Earned Weighted Score} = \sum_{i=1}^{N} (\text{Poin Diberikan}_i \times \text{Bobot}_i)$$

$$\text{Total Max Weighted Score} = \sum_{i=1}^{N} (3 \times \text{Bobot}_i)$$

$$\text{Final Score Percentage (\%)} = \left( \frac{\text{Total Earned Weighted Score}}{\text{Total Max Weighted Score}} \right) \times 100$$

### B. Deskriptor 4-Level Skor Kompetensi
| Skor | Tingkat Kinerja | Kriteria Evaluasi Penguji |
|:---:|:---|:---|
| **0** | **Tidak Dilakukan / Salah Total** | Peserta sama sekali tidak melakukan tindakan/kompetensi yang diminta atau melakukan kesalahan fatal. |
| **1** | **Minimal / Sebagian Besar Salah** | Melakukan sebagian kecil poin, namun sebagian besar tidak tepat / tidak sesuai prosedur. |
| **2** | **Cukup / Sebagian Besar Tepat** | Melakukan sebagian besar kriteria secara tepat, namun masih ada kekurangan minor. |
| **3** | **Sempurna / Lengkap & Tepat** | Melakukan seluruh kriteria secara lengkap, akurat, komunikatif, dan sesuai prosedur baku. |

### C. Matriks Global Performance Rating (GRS)
| Rating GRS | Kode Enum Database | Bobot Evaluasi Holistik |
|:---|:---|:---|
| **TIDAK LULUS** | `UNSATISFACTORY` | Performa di bawah standar keselamatan pasien & pemahaman klinis kurang. |
| **BORDERLINE** | `BORDERLINE` | Performa berada di batas ragu-ragu (Digunakan untuk kalkulasi Nilai Batas Lulus / NBL). |
| **LULUS** | `SATISFACTORY` | Performa klinis memadai, aman, dan memenuhi standar kompetensi dasar. |
| **SUPERIOR** | `SUPERIOR` | Performa sangat mengesankan, efisien, komunikatif, dan tanpa cela. |

---

## 6. Pemetaan Schema Database `osce` & Service Layer

Pengintegrasian antarmuka penguji menggunakan service layer terpusat **`examinerService.js`**:

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    SERVICE LAYER                       │
                               │             (src/services/examinerService.js)          │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
               ┌───────────────────────────────────────────┼───────────────────────────────────────────┐
               │                                           │                                           │
┌──────────────▼───────────────┐           ┌───────────────▼──────────────┐           ┌────────────────▼──────────────┐
│   osce.session_examiners     │           │   osce.participant_answers   │           │  osce.examiner_evaluations    │
├──────────────────────────────┤           ├──────────────────────────────┤           ├───────────────────────────────┤
│ • user_id (FK profiles)      │           │ • session_id, station_id     │           │ • session_id, station_id      │
│ • session_id (FK sessions)   │           │ • participant_id             │           │ • participant_id, examiner_id │
│ • assigned_station_number    │           │ • working_diagnosis          │           │ • grs_rating                  │
│ • specialty                  │           │ • differential_dx_1..3       │           │ • examiner_notes              │
└──────────────────────────────┘           │ • prescription_text          │           │ • total_points_earned         │
                                           │ • current_step               │           │ • final_score_percentage      │
                                           └──────────────────────────────┘           │ • is_locked = true            │
                                                                                      └───────────────┬───────────────┘
                                                                                                      │
                                                                                      ┌───────────────▼───────────────┐
                                                                                      │      osce.rubric_scores       │
                                                                                      ├───────────────────────────────┤
                                                                                      │ • evaluation_id (FK)          │
                                                                                      │ • rubric_item_id (FK)         │
                                                                                      │ • score_given (0..3)          │
                                                                                      └───────────────────────────────┘
```

---

## 7. Tabel Evaluasi Kesesuaian Frontend & Rencana Penyesuaian

Tabel berikut mengevaluasi kesesuaian antara antarmuka penguji di frontend saat ini dengan spesifikasi target:

| Modul & Komponen | Kondisi Frontend Saat Ini | Status | Rencana Penyesuaian / Langkah Kerja |
|:---|:---|:---:|:---|
| **Penyaringan Status Sesi** | Menampilkan sesi berstatus `published` & `ongoing`. Menampilkan Layar Standby jika belum aktif. | ✅ **Sesuai** | Pertahankan penyaringan status agar penguji tidak masuk ke sesi draft. |
| **Side-by-Side Reference Key** | Jawaban peserta disandingkan dengan Kunci Jawaban Baku Admin di `ExaminerStagePage.jsx`. | ✅ **Sesuai** | Optimalkan tampilan respon teks panjang pada blangko resep obat. |
| **Skor Rubrik 0 - 3 & GRS** | Radio button skor 0-3 dan 4 tingkat pilihan GRS sudah tersedia. | ✅ **Sesuai** | Tambahkan drawer/tooltip deskriptor kriteria level 0, 1, 2, 3 pada setiap item rubrik. |
| **Handling Sesi Non-Aktif** | Menampilkan Layar Standby interaktif saat sesi belum `ongoing`. | ✅ **Sesuai** | Penguji dapat kembali ke dashboard atau melakukan refresh status secara mandiri. |
| **Perkalian Bobot Kompetensi** | Kalkulasi skor terbobot $\text{Poin} \times \text{Bobot}$ terintegrasi di service layer. | ✅ **Sesuai** | Pastikan `total_points_earned` dan `max_points_possible` tersimpan presisi di database. |
| **Audit Log Triggering** | Penyimpanan nilai memicu RLS & audit trigger imutabel di database Supabase. | ✅ **Sesuai** | Verifikasi penguncian `is_locked = true` mencegah penyuntingan pasca-submit. |

---

*Dokumen EXAMINER-OSCE.md ini merupakan referensi resmi untuk spesifikasi fungsionalitas, alur kerja, dan hak akses Dokter Penguji pada platform **MedSkill Praxis OSCE**.* 🚀
