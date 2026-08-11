# Audot & Rekapitulasi Penggunaan Tabel Schema `osce` (Supabase)

Dokumen ini berisi hasil audit penggunaan 20 tabel dan view yang terdefinisi pada schema `osce` (referensi `frontend/src/types/osce.types.ts`) di dalam aplikasi **Medskill Praxis OSCE**.

---

## 📊 Ringkasan Status Penggunaan

- **Total Tabel/View di Schema `osce`**: 20
- **Tabel yang Telah Digunakan (Active/Integrated)**: **16 Tabel** (80%)
- **Tabel/View Opsional / Persiapan Backend (Available for Expansion)**: **4 Tabel/View** (20%)

---

## 🔍 Detail Audit 1 per 1 Tabel Schema `osce`

### 1. `sessions`
- **Status**: ✅ **DIGUNAKAN (USED)**
- **Lokasi Kode**:
  - [sessionService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/sessionService.js)
  - [session.service.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/session.service.js)
  - [live.service.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/live.service.js)
  - [CreateSessionPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/CreateSessionPage.jsx)
  - [SessionsPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/SessionsPage.jsx)
- **Fungsi**: Master data sesi ujian OSCE, tanggal, lokasi, durasi stase/break/transisi, dan status sesi (`draft`, `published`, `ongoing`, `completed`).

---

### 2. `stations`
- **Status**: ✅ **DIGUNAKAN (USED)**
- **Lokasi Kode**:
  - [sessionService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/sessionService.js)
  - [questionBankService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/questionBankService.js)
  - [examinerService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/examinerService.js)
  - [ExaminerStagePage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/examiner/pages/ExaminerStagePage.jsx)
  - [StationMonitorDetailPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/StationMonitorDetailPage.jsx)
- **Fungsi**: Menyimpan nomor stase di sirkuit, judul kasus, skenario klinik, instruksi peserta, instruksi penguji, dan penanda stase istirahat (`is_break`).

---

### 3. `question_bank`
- **Status**: ✅ **DIGUNAKAN (USED)**
- **Lokasi Kode**:
  - [case.service.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/case.service.js)
  - [questionBankService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/questionBankService.js)
  - [CasesPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/CasesPage.jsx)
  - [CreateCasePage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/CreateCasePage.jsx)
  - [QuestionBankSelectModal.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/components/QuestionBankSelectModal.jsx)
- **Fungsi**: Master Bank Soal & Kasus Medis terpusat untuk memudahkan penyusunan sirkuit ujian OSCE.

---

### 4. `question_bank_rubric_items`
- **Status**: ✅ **DIGUNAKAN (USED)**
- **Lokasi Kode**:
  - [case.service.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/case.service.js)
  - [CreateCasePage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/CreateCasePage.jsx)
  - [QuestionBankSelectModal.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/components/QuestionBankSelectModal.jsx)
- **Fungsi**: Indikator rubrik penilaian (skor 0–3) yang melekat pada master kasus bank soal.

---

### 5. `question_bank_auxiliary_configs`
- **Status**: ✅ **DIGUNAKAN (USED)**
- **Lokasi Kode**:
  - [case.service.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/case.service.js)
  - [CreateCasePage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/CreateCasePage.jsx)
- **Fungsi**: Konfigurasi berkas penunjang (EKG, Rontgen, Laboratorium) pada master kasus bank soal.

---

### 6. `rubric_items`
- **Status**: ✅ **DIGUNAKAN (USED)**
- **Lokasi Kode**:
  - [sessionService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/sessionService.js)
  - [examinerService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/examinerService.js)
  - [ExaminerStagePage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/examiner/pages/ExaminerStagePage.jsx)
  - [ParticipantAnswerPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/ParticipantAnswerPage.jsx)
- **Fungsi**: Indikator penilaian 0-3 yang terhubung langsung pada stase aktif dalam sirkuit sesi.

---

### 7. `station_auxiliary_configs`
- **Status**: ✅ **DIGUNAKAN (USED)**
- **Lokasi Kode**:
  - [sessionService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/sessionService.js)
  - [examinerService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/examinerService.js)
  - [StationMonitorDetailPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/StationMonitorDetailPage.jsx)
- **Fungsi**: Berkas penunjang aktif yang di-assign pada stase sirkuit tertentu.

---

### 8. `session_participants`
- **Status**: ✅ **DIGUNAKAN (USED)**
- **Lokasi Kode**:
  - [session.service.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/session.service.js)
  - [presence.service.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/presence.service.js)
  - [simulation.service.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/simulation.service.js)
  - [ParticipantsPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/ParticipantsPage.jsx)
  - [ParticipantAnswerPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/ParticipantAnswerPage.jsx)
- **Fungsi**: Data registrasi peserta ujian pada sesi sirkuit, posisi `starting_station_number`, gelombang, dan status approval.

---

### 9. `session_examiners`
- **Status**: ✅ **DIGUNAKAN (USED)**
- **Lokasi Kode**:
  - [sessionService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/sessionService.js)
  - [examinerService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/examinerService.js)
  - [SessionExaminersPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/SessionExaminersPage.jsx)
  - [ExaminersPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/ExaminersPage.jsx)
- **Fungsi**: Penugasan dokter penguji ke nomor stase tertentu dalam sirkuit sesi.

---

### 10. `participant_answers`
- **Status**: ✅ **DIGUNAKAN (USED)**
- **Lokasi Kode**:
  - [participantService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/participantService.js)
  - [presence.service.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/presence.service.js)
  - [FeedbackPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/examiner/pages/FeedbackPage.jsx)
  - [ParticipantAnswerPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/ParticipantAnswerPage.jsx)
- **Fungsi**: Menyimpan jawaban lembar kerja peserta (WDx, DDx, Resep, Anamnesis, Pemeriksaan Fisik, dan Permintaan Penunjang).

---

### 11. `examiner_evaluations`
- **Status**: ✅ **DIGUNAKAN (USED)**
- **Lokasi Kode**:
  - [examinerService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/examinerService.js)
  - [ExaminerStagePage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/examiner/pages/ExaminerStagePage.jsx)
  - [ExaminerHistoryDetailPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/examiner/pages/ExaminerHistoryDetailPage.jsx)
  - [ReportsPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/ReportsPage.jsx)
  - [ParticipantAnswerPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/ParticipantAnswerPage.jsx)
- **Fungsi**: Menyimpan evaluasi penguji, nilai GRS (Global Rating Scale: Unsatisfactory, Borderline, Satisfactory, Superior), dan catatan evaluasi.

---

### 12. `rubric_scores`
- **Status**: ✅ **DIGUNAKAN (USED)**
- **Lokasi Kode**:
  - [examinerService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/examinerService.js)
  - [ExaminerHistoryDetailPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/examiner/pages/ExaminerHistoryDetailPage.jsx)
  - [StationMonitorDetailPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/StationMonitorDetailPage.jsx)
  - [ParticipantAnswerPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/ParticipantAnswerPage.jsx)
- **Fungsi**: Rincian poin 0–3 per-indikator rubrik penilaian yang diberikan penguji untuk setiap peserta.

---

### 13. `session_timer_state`
- **Status**: ✅ **DIGUNAKAN (USED)**
- **Lokasi Kode**:
  - [realtimeTimerService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/realtimeTimerService.js)
  - [live.service.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/live.service.js)
- **Fungsi**: Sinkronisasi timer sirkuit realtime secara terpusat (waktu berjalan, sisa waktu stase/break).

---

### 14. `rotation_states`
- **Status**: ✅ **DIGUNAKAN (USED)**
- **Lokasi Kode**:
  - [realtimeTimerService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/realtimeTimerService.js)
  - [live.service.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/live.service.js)
- **Fungsi**: Melacak status perputaran rotasi sirkuit aktif (`current_round`, status rotasi).

---

### 15. `broadcast_messages`
- **Status**: ✅ **DIGUNAKAN (USED)**
- **Lokasi Kode**:
  - [broadcast.service.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/broadcast.service.js)
  - [realtimeTimerService.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/services/realtimeTimerService.js)
- **Fungsi**: Pengiriman dan penerimaan pengumuman/pesan darurat realtime dari admin ke seluruh peserta/penguji.

---

### 16. `auxiliary_exam_catalog`
- **Status**: ✅ **DIGUNAKAN (USED)**
- **Lokasi Kode**:
  - [auxiliaryExamsCatalog.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/participant/data/auxiliaryExamsCatalog.js)
  - [AuxiliaryExamChecklistModal.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/components/AuxiliaryExamChecklistModal.jsx)
- **Fungsi**: Katalog master pilihan pemeriksaan penunjang (Lab, Radiologi, EKG).

---

### 17. `audit_logs`
- **Status**: ⏳ **TERSEDIA DI BACKEND / OPSIONAL (AVAILABLE FOR EXPANSION)**
- **Penjelasan**: Tabel infrastruktur untuk mencatat audit trail perubahan data (`table_name`, `action`, `changed_by`, `old_data`, `new_data`).
- **Rekomendasi**: Siap diintegrasikan ke halaman Audit Logs Administrator jika diperlukan.

---

### 18. `standard_setting_results`
- **Status**: ⏳ **TERSEDIA DI BACKEND / OPSIONAL (AVAILABLE FOR EXPANSION)**
- **Penjelasan**: Tabel pencatatan nilai batas lulus (Cut-off Score / Passing Grade) dengan metode *Borderline Regression Method* atau *Angoff Method*.
- **Rekomendasi**: Siap diintegrasikan untuk modul analitik standar nilai lulus ujian nasional.

---

### 19. `station_kiosk_tokens`
- **Status**: ⏳ **TERSEDIA DI BACKEND / OPSIONAL (AVAILABLE FOR EXPANSION)**
- **Penjelasan**: Tabel token otentikasi perangkat kiosk/tablet fisik yang terpasang di depan pintu stase.
- **Rekomendasi**: Siap diakses apabila sistem di-deploy menggunakan tablet pintu stase fisik.

---

### 20. `session_results_summary` (View)
- **Status**: ⏳ **TERSEDIA DI BACKEND / OPSIONAL (AVAILABLE FOR EXPANSION)**
- **Penjelasan**: View database SQL untuk mengagregasi rekapitulasi nilai akhir dan kelulusan peserta secara cepat tanpa butuh query komputasi berat.
- **Rekomendasi**: Dapat digunakan untuk percepatan ekspor laporan nilai di `ReportsPage.jsx`.

---

## 📌 Kesimpulan
Seluruh **16 tabel utama bisnis OSCE** di schema `osce` telah **sepenuhnya diintegrasikan dan digunakan di dalam kode frontend**, mencakup alur lengkap pembuatan sesi, bank soal, registrasi peserta, penugasan penguji, lembar kerja peserta, penilaian rubrik 0-3 + GRS, timer realtime, dan pengumuman broadcast.
