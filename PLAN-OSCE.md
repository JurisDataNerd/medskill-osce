# 🎯 PLAN-OSCE.md — Master Implementation Plan & Task TODO Checklist

**Praxis by MedSkill Indonesia** — *Dokumen Rencana Kerja & Tracking Task Penuh*  
*Versi: 1.1.0 | Tanggal: 12 Agustus 2026*

---

## 📑 Acuan Dokumentasi Master

Dokumen rencana kerja ini merujuk langsung pada 2 spesifikasi master:
1. 📘 **[OSCE-SPEC.md](file:///c:/KAIRAV/project/2026/medskill/praxis/OSCE-SPEC.md)** — Spesifikasi Aturan Operasional & Fitur Aplikasi.
2. 🗄️ **[DATABASE-SPEC.md](file:///c:/KAIRAV/project/2026/medskill/praxis/DATABASE-SPEC.md)** — Spesifikasi Schema `osce` Supabase PostgreSQL.

---

## 📑 Master Task Checklist TODO (Interactive List)

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
  - [x] Hubungkan Tab 2 (Stase & Timer Rotasi) dengan konfigurasi durasi & urutan pos.
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

## 📊 Matriks Verifikasi (Definition of Done)

| No | Modul / Fitur | Kriteria Diterima | Status |
|:--:|:---|:---|:---:|
| **1** | **Database Isolation** | 100% tabel & enum berada di schema `osce`. Schema `public` tidak tersentuh. | ✅ DONE |
| **2** | **CLI Migration** | Semua 18 migration SQL sukses dieksekusi di database remote via Supabase CLI. | ✅ DONE |
| **3** | **Service Layer** | Service layer (`sessionService`, `questionBankService`, `participantService`, `examinerService`, `realtimeTimerService`) lulus build. | ✅ DONE |
| **4** | **Admin Wizard** | Admin dapat membuat sesi, menyusun stase, dan mengimpor soal dari Bank Soal (1-Klik). | ✅ DONE |
| **5** | **Participant 4-Step** | Peserta dapat berpindah dari Halaman 1 → 2 → 3 → 4 dengan auto-save dan konfirmasi modal. | ⏳ TODO |
| **6** | **Side-by-Side Examiner** | Penguji melihat ketikan peserta secara realtime berdampingan dengan Kunci Jawaban Baku. | ⏳ TODO |
| **7** | **Realtime Timer** | Master timer admin sinkron dengan countdown layar peserta & penguji tanpa terpengaruh latensi. | ⏳ TODO |
| **8** | **NBL Calculation** | ReportsPage menampilkan rekap nilai dan kalkulasi Nilai Batas Lulus metode Borderline Regression. | ⏳ TODO |
| **9** | **Audit Trail** | Setiap penguncian nilai oleh penguji membuat record imutabel di `osce.audit_logs`. | ⏳ TODO |
| **10** | **Build Verification** | `bun run build` sukses 100% tanpa error kompilasi. | ✅ DONE |
