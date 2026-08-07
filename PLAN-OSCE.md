# 🎯 PLAN-OSCE.md — Master Implementation Plan & Task TODO Checklist

**Praxis by MedSkill Indonesia** — *Dokumen Rencana Kerja & Tracking Task Penuh*  
*Versi: 1.0.0 | Tanggal: 8 Agustus 2026*

---

## 📑 Daftar Isi

1. [Executive Summary & Visi Implementasi](#1-executive-summary--visi-implementasi)
2. [Peta Arsitektur & Service Layer](#2-peta-arsitektur--service-layer)
3. [Roadmap Integrasi Terpisah per Modul](#3-roadmap-integrasi-terpisah-per-modul)
4. [Master Task Checklist TODO (Interactive List)](#4-master-task-checklist-todo-interactive-list)
   - [Phase 1: Core Foundation & Auth Sync](#phase-1-core-foundation--auth-sync)
   - [Phase 2: Modul Administrator (Wizard, Bank Soal & Media)](#phase-2-modul-administrator-wizard-bank-soal--media)
   - [Phase 3: Modul Ujian Peserta (4-Halaman & Transit)](#phase-3-modul-ujian-peserta-4-halaman--transit)
   - [Phase 4: Modul Dokter Penguji (Side-by-Side & Rubrik)](#phase-4-modul-dokter-penguji-side-by-side--rubrik)
   - [Phase 5: Realtime Control Room & Sync Engine](#phase-5-realtime-control-room--sync-engine)
   - [Phase 6: Pusat Laporan, NBL & Ekspor](#phase-6-pusat-laporan-nbl--ekspor)
   - [Phase 7: Offline-First & Resiliensi Production](#phase-7-offline-first--resiliensi-production)
5. [Matriks Verifikasi & Kriteria Diterima (Definition of Done)](#5-matriks-verifikasi--kriteria-diterima-definition-of-done)

---

## 1. Executive Summary & Visi Implementasi

Dokumen ini merupakan **Panduan Utama Eksekusi Penyetelan (Implementation Plan)** untuk menghubungkan seluruh antarmuka **Frontend Mockup Application (Praxis MedSkill)** dengan **Supabase PostgreSQL Schema `osce`** yang telah termigrasi di database remote (`Project Ref: djigelqahkzfmwvpncvr`).

### Target Utama:
- ⚡ **100% Data Live Supabase**: Menggantikan seluruh data tiruan (`mockAdminData.js`, `mockExaminerData.js`, `mockParticipantData.js`) dengan Service Layer terpusat.
- 🕒 **Future Timestamp Sync**: Sinkronisasi timer rotasi live yang kebal latensi jaringan dan browser tab throttling.
- 🩺 **Side-by-Side Examiner View**: Dokter penguji mengevaluasi peserta secara realtime berdampingan dengan Kunci Jawaban Baku Admin (Gold Standard).
- 📜 **Borderline Regression NBL**: Kalkulasi otomatis Nilai Batas Lulus (NBL) standar nasional AIPKI/Kemenkes RI.
- 🔒 **0-Touch Schema Public**: Semua operasi database diisolasi di schema `osce` dengan keamanan Row Level Security (RLS) granular.

---

## 2. Peta Arsitektur & Service Layer

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND UI COMPONENTS                          │
├───────────────────┬───────────────────┬────────────────────────────────┤
│   Modul Admin     │  Modul Peserta    │        Modul Penguji           │
│   (Wizard/Live)   │  (4-Step Exam)    │   (Side-by-Side Grading)       │
└─────────┬─────────┴─────────┬─────────┴───────────────┬────────────────┘
          │                   │                         │
┌─────────▼───────────────────▼─────────────────────────▼────────────────┐
│                        SERVICE LAYER (src/services/)                   │
├────────────────────────────────────────────────────────────────────────┤
│ • sessionService.js        → CRUD Sessions & Stations                  │
│ • questionBankService.js   → 1-Click Import & Catalog                  │
│ • participantService.js    → 4-Page Auto-Save & Step Tracking          │
│ • examinerService.js       → Weighted Scoring & Lock Evaluation        │
│ • realtimeTimerService.js  → Future Timestamp Sync & Broadcast         │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                        SUPABASE CLIENT & BACKEND                       │
├────────────────────────────────────────────────────────────────────────┤
│ • schema: osce (19 Tabel, 5 Enums, RLS Policies, Realtime Channels)   │
│ • Storage Bucket: osce-media (Berkas X-Ray, EKG, Lab)                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Roadmap Integrasi Terpisah per Modul

### 🔹 Modul 1: Foundation & Auth Alignment
- Mengatur Environment Flag `VITE_USE_SUPABASE=true` untuk kemudahan switching antara Demo Mockup dan Live Database.
- Menghubungkan Auth Context dengan profil role di `public.profiles`.

### 🔹 Modul 2: Admin Session Wizard & Bank Soal
- Form multi-langkah `/admin/sessions/create`: Pengaturan Umum, Sirkuit Pos, Alokasi Peserta & Penguji.
- Katalog Bank Soal 1-Klik Auto-Fill ke Stase (`QuestionBankSelectModal.jsx`).
- Upload berkas penunjang gambar ke Supabase Storage bucket `osce-media`.

### 🔹 Modul 3: Flow Multi-Halaman Peserta
- Layar `/participant/session/:id`:
  - **Halaman 1**: Pembacaan Skenario
  - **Halaman 2**: Anamnesis & Pemeriksaan Fisik
  - **Halaman 3**: Permintaan Checklist Penunjang
  - **Halaman 4**: Diagnosis Kerja (1 WDx), 3 Diagnosis Banding (DDx 1-3), & Blangko Resep Obat.
- Post-Station Transit Waiting Room (Timer Transisi 2 Menit).

### 🔹 Modul 4: Dashboard Penguji Side-by-Side
- Layar `/examiner/stage/:stageId`:
  - Penugasan Stase Dokter Penguji.
  - Penyandingan Realtime: Jawaban Peserta vs Kunci Jawaban Baku Admin.
  - Rubrik Skor 0-3 dengan Tooltip Deskriptor 4-Level + GRS Rating (`UNSATISFACTORY`, `BORDERLINE`, `SATISFACTORY`, `SUPERIOR`).
  - Submit & Lock Evaluation (memicu Audit Log imutabel).

### 🔹 Modul 5: Control Room Realtime & Timer Engine
- Master Control Room `/admin/live`:
  - Kontrol `[Start Simulation]`, `[Pause]`, `[Next Round]`.
  - Timer Sync Future Timestamp Pattern (`osce.session_timer_state`).
  - Matriks Pergerakan Rotasi Live.
  - Broadcast Pesan Pengumuman Live (`osce.broadcast_messages`).

### 🔹 Modul 6: Reports & NBL Standard Setting
- Pusat Laporan `/admin/reports`:
  - Rekap Nilai dari Materialized View `osce.session_results_summary`.
  - Perhitungan Nilai Batas Lulus (NBL) metode *Borderline Regression*.
  - Cetak Transkrip PDF & Auto-Email.

---

## 4. Master Task Checklist TODO (Interactive List)

### Phase 1: Core Foundation & Auth Sync
- [x] Buat file `frontend/src/lib/supabaseClient.js` dengan konfigurasi schema `osce`.
- [x] Generate TypeScript definitions `frontend/src/types/osce.types.ts` dari database live via Supabase CLI.
- [x] Buat service base `frontend/src/services/sessionService.js`.
- [x] Buat service base `frontend/src/services/questionBankService.js`.
- [x] Buat service base `frontend/src/services/participantService.js`.
- [x] Buat service base `frontend/src/services/examinerService.js`.
- [x] Buat service base `frontend/src/services/realtimeTimerService.js`.
- [ ] Integrasikan `AuthContext.jsx` untuk membaca role `public.profiles` (`admin`, `examiner`, `participant`).
- [ ] Tambahkan toggle Environment Flag `VITE_USE_SUPABASE` di `.env` frontend.

### Phase 2: Modul Administrator (Wizard, Bank Soal & Media)
- [x] **Wizard Pembuat Sesi (`CreateSessionPage.jsx`)**:
  - [x] Hubungkan Tab 1 (Detail Utama & Jadwal) dengan `sessionService.createSession()`.
  - [x] Hubungkan Tab 2 (Stase & Timer Rotasi) dengan konfigurasi durasi & urutanpos.
  - [x] Hubungkan Tab 3 (Editor Skenario & Rubrik per Stase) dengan `osce.stations` & `osce.rubric_items`.
  - [x] Integrasikan `QuestionBankSelectModal.jsx` untuk 1-click Auto-Fill kasus dari `osce.question_bank`.
  - [x] Integrasikan upload gambar di `AdminAuxiliaryExamBuilder.jsx` ke Supabase Storage bucket `osce-media`.
- [x] **Plotting Peserta & Penguji**:
  - [x] Hubungkan `SessionParticipantsPage.jsx` untuk simpan alokasi gelombang ke `osce.session_participants`.
  - [x] Hubungkan `SessionExaminersPage.jsx` untuk simpan penugasan stase ke `osce.session_examiners`.
- [x] **Repository Bank Soal (`CasesPage.jsx`)**:
  - [x] Hubungkan CRUD Bank Soal dengan `osce.question_bank`, `osce.question_bank_rubric_items`, & `osce.question_bank_auxiliary_configs`.

### Phase 3: Modul Ujian Peserta (4-Halaman & Transit)
- [ ] **Waiting Room & Access**:
  - [ ] Verifikasi status pendaftaran peserta di `osce.session_participants`.
  - [ ] Tampilkan info gelombang, stase awal, dan countdown sebelum `Start Simulation`.
- [ ] **Pengerjaan Live Stase (`ParticipantSessionPage.jsx`)**:
  - [ ] Auto-Save Halaman 1 (Skenario) & Halaman 2 (Anamnesis & Fisik) ke `osce.participant_answers`.
  - [ ] Halaman 3 (Permintaan Penunjang): Match checklist peserta dengan `osce.station_auxiliary_configs` (rilis hasil / "Tidak ada data").
  - [ ] Halaman 4 (Diagnosis & Resep): Simpan `working_diagnosis`, `differential_dx_1`, `differential_dx_2`, `differential_dx_3`, dan `prescription_text`.
  - [ ] Modal Konfirmasi Navigasi 1-Arah (One-Way Forward).
- [ ] **Post-Station Transit Waiting Room**:
  - [ ] Timer transisi 2 menit antar-pos.
  - [ ] Tampilan petunjuk stase target & nama penguji selanjutnya.
  - [ ] Bypass button `[Lanjut ke Stase Selanjutnya]`.

### Phase 4: Modul Dokter Penguji (Side-by-Side & Rubrik)
- [ ] **Dashboard Penguji (`ExaminerStagePage.jsx`)**:
  - [ ] Ambil data stase penugasan penguji dari `osce.session_examiners`.
  - [ ] **Penyandingan Side-by-Side**:
    - [ ] Tampilkan isian realtime peserta (`working_diagnosis`, `differential_dx_1-3`, `prescription_text`).
    - [ ] Tampilkan **Kunci Jawaban Baku Admin** (`answer_key_diagnosis`, `answer_key_prescription` dari `osce.stations`).
  - [ ] **Rubrik Penilaian**:
    - [ ] Render item rubrik dengan pilihan poin 0, 1, 2, 3.
    - [ ] Tampilkan **Tooltip Deskriptor 4-Level** dari `osce.rubric_items.descriptors`.
    - [ ] Pilihan GRS Rating (`UNSATISFACTORY`, `BORDERLINE`, `SATISFACTORY`, `SUPERIOR`).
  - [ ] **Submit & Lock**:
    - [ ] Simpan skor ke `osce.examiner_evaluations` & `osce.rubric_scores`.
    - [ ] Kunci nilai (`is_locked = true`) dan verifikasi trigger `osce.audit_logs` tercatat.

### Phase 5: Realtime Control Room & Sync Engine
- [ ] **Master Live Board (`LiveMonitorPage.jsx`)**:
  - [ ] Tombol `Start Simulation`, `Pause`, `Resume`, `Next Round` meng-update `osce.session_timer_state`.
  - [ ] Berlangganan (*subscribe*) ke Supabase Realtime channel `session:{id}`.
  - [ ] Visualisasi Matriks Rotasi Live dari `osce.rotation_states` & `osce.participant_answers`.
  - [ ] Pengiriman Pesan Broadcast Admin ke `osce.broadcast_messages`.
- [ ] **Client Timer Synchronization**:
  - [ ] Implementasikan perhitungan countdown di client: `remaining = target_end_time - Date.now()`.
  - [ ] Web Audio API Bell System: Putar sinyal audio bel otomatis (1x Reading End, 2x Warning, 3x Rotation).

### Phase 6: Pusat Laporan, NBL & Ekspor
- [ ] **Pusat Rekapitulasi (`ReportsPage.jsx`)**:
  - [ ] Ambil data rekapitulasi dari Materialized View `osce.session_results_summary`.
  - [ ] Panggil function `osce.fn_refresh_results_summary()` saat admin finalize.
- [ ] **Standard Setting NBL**:
  - [ ] Implementasikan kalkulasi Borderline Regression Method (BRM) untuk menghasilkan *cut-off score* per stase (`osce.standard_setting_results`).
- [ ] **Cetak & Ekspor**:
  - [ ] Generate PDF Borang Transkrip Nilai & Feedback per Peserta.
  - [ ] Ekspor Rekapitulasi Excel.

### Phase 7: Offline-First & Resiliensi Production
- [ ] Implementasikan IndexedDB lokal store (via Dexie.js) untuk auto-save ketikan peserta & skor penguji.
- [ ] Implementasikan Background Sync Queue untuk mengirim data saat koneksi Wi-Fi pulih.
- [ ] Audit Keamanan RLS Policies seluruh 19 tabel schema `osce`.
- [ ] Verifikasi final build production: `bun run build`.

---

## 5. Matriks Verifikasi & Kriteria Diterima (Definition of Done)

| No | Modul / Fitur | Kriteria Diterima (Acceptance Criteria) | Status |
|:--:|:---|:---|:---:|
| **1** | **Database Isolation** | 100% tabel & enum berada di schema `osce`. Schema `public` tidak tersentuh. | ✅ DONE |
| **2** | **CLI Migration** | Semua 18 migration SQL sukses dieksekusi di database remote via Supabase CLI. | ✅ DONE |
| **3** | **Service Layer** | Service layer (`sessionService`, `questionBankService`, `participantService`, `examinerService`, `realtimeTimerService`) lulus build. | ✅ DONE |
| **4** | **Admin Wizard** | Admin dapat membuat sesi, menyusun stase, dan mengimpor soal dari Bank Soal (1-Klik). | ⏳ TODO |
| **5** | **Participant 4-Step** | Peserta dapat berpindah dari Halaman 1 → 2 → 3 → 4 dengan auto-save dan konfirmasi modal. | ⏳ TODO |
| **6** | **Side-by-Side Examiner** | Penguji melihat ketikan peserta secara realtime berdampingan dengan Kunci Jawaban Baku. | ⏳ TODO |
| **7** | **Realtime Timer** | Master timer admin sinkron dengan countdown layar peserta & penguji tanpa terpengaruh latensi. | ⏳ TODO |
| **8** | **NBL Calculation** | ReportsPage menampilkan rekap nilai dan kalkulasi Nilai Batas Lulus metode Borderline Regression. | ⏳ TODO |
| **9** | **Audit Trail** | Setiap penguncian nilai oleh penguji membuat record imutabel di `osce.audit_logs`. | ⏳ TODO |
| **10** | **Build Verification** | `bun run build` sukses 100% tanpa error kompilasi. | ✅ DONE |

---

*Dokumen PLAN-OSCE.md ini merupakan acuan resmi rencana kerja implementasi dan tracking TODO seluruh fitur MedSkill Praxis OSCE.* 🚀
