# 🐛 Catatan & Laporan Bug Sistem (BUGS.md)
> **Praxis by MedSkill Indonesia — OSCE Engine & Clinical Assessment Platform**  
> *Tanggal Laporan: 28 Agustus 2026*  
> *Pelapor / Pengirim: Makhluk Hytam*  
> *Status: Tercatat & Siap Diperbaiki (Open)*

---

## 📑 1. Ringkasan Laporan Bug (Original Report)

```text
[15.11, 28/8/2026] Makhluk Hytam: kan mereka pake tab
[15.12, 28/8/2026] Makhluk Hytam: jadi ketika tabnya ga sengaja kelock
[15.12, 28/8/2026] Makhluk Hytam: kek auto submit bjirrr
[15.12, 28/8/2026] Makhluk Hytam: sama kalau di refresh
[15.14, 28/8/2026] Makhluk Hytam: Bugs : 

Peserta:
1. Peserta yg kepencet refresh otomatis selesai (dianggap meninggalkan laman web)
2. Peserta yang devicenya ke lock/screen timeout otomatis selesai (dianggap meninggalkan laman web)

Penguji:
1. Keterangan kunci jawaban Rubrik penilaian belum sesuai dengan yang diinput di bank soal.
```

---

## 🔍 2. Rincian & Analisis Akar Masalah (Root Cause Analysis)

### A. Modul Peserta (Participant Flow)

#### 1. Masalah Auto-Submit / Terlempar ke Selesai saat Refresh Halaman
* **Gejala:**  
  Peserta yang tidak sengaja melakukan *refresh / reload* halaman ujian langsung terlempar ke halaman penyelesaian (*Thank You / Completed Screen*) atau dianggap telah menyelesaikan ujian.
* **Akar Masalah:**  
  1. *In-memory state* pada [`ParticipantSessionPage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/participant/pages/ParticipantSessionPage.jsx) (`viewMode`, `currentRound`, `examStep`) ter-reset ke nilai default saat reload.
  2. Logika evaluasi `globalTimerState.phase` pada *mount* awal memeriksa status `localStorage` atau flag sesi yang belum sepenuhnya tersinkronisasi, sehingga salah mengidentifikasi sesi aktif dan langsung beralih ke `viewMode = 'completed'`.
  3. Handler `beforeunload` di [`AuthProvider.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/context/AuthProvider.jsx) memperbarui `is_online: false` yang dapat mengganggu *presence session guard*.
* **Solusi Teknis:**
  * Implementasikan **Session State Rehydration**: Simpan state aktif pengerjaan (`currentRound`, `examStep`, `viewMode`, `draftAnswers`) ke `localStorage` dengan prefix `osce_participant_state_${sessionId}`.
  * Saat halaman dimuat ulang (*mount*), baca kembali state dari `localStorage` dan sinkronkan dengan `globalTimerState` Supabase agar peserta langsung kembali ke posisi stase dan step pengerjaan terakhir tanpa kehilangan data.

---

#### 2. Masalah Layar Tablet Terkunci / Screen Timeout Dianggap Meninggalkan Laman Web
* **Gejala:**  
  Peserta yang menggunakan tablet/iPad mengalami *screen timeout* atau tidak sengaja menekan tombol power (layar terkunci), lalu saat dinyalakan kembali sistem memicu modal pelanggaran keamanan / auto-submit karena dianggap meninggalkan tab ujian.
* **Akar Masalah:**  
  1. Event listener `document.addEventListener("visibilitychange", handleVisibilityChange)` pada [`ParticipantSessionPage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/participant/pages/ParticipantSessionPage.jsx#L199-L208) mendeteksi kondisi `document.hidden = true` saat layar tablet *sleep/lock*.
  2. Penanganan `document.hidden` langsung menaikkan `tabSwitchCount` dan memicu modal peringatan / pembatalan ujian tanpa membedakan antara berpindah aplikasi (*cheating attempt*) dengan *device screen sleep*.
* **Solusi Teknis:**
  * **Screen Wake Lock API**: Aktifkan `navigator.wakeLock.request('screen')` pada antarmuka peserta agar layar tablet tetap menyala selama durasi ujian aktif berlangsung (mencegah *auto-sleep/screen timeout*).
  * **Toleransi Heartbeat / Waktu Re-fokus**: Tambahkan toleransi durasi ketika layar kembali aktif (`visibilitychange` ke `visible`), hitung selisih waktu (`Date.now() - lastActiveTime`). Jika waktu jeda sesuai durasi kunci layar dan masih dalam rentang timer stase, izinkan peserta melanjutkan tanpa langsung mengunci atau mendiskualifikasi ujian.

---

### B. Modul Dokter Penguji (Examiner Flow)

#### 1. Keterangan Kunci Jawaban Rubrik Penilaian Tidak Sesuai Input Bank Soal
* **Gejala:**  
  Pada lembar penilaian Dokter Penguji ([`ExaminerStagePage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/examiner/pages/ExaminerStagePage.jsx) dan [`ExaminerRubricEvaluationSheet.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/examiner/components/ExaminerRubricEvaluationSheet.jsx)), teks "Kunci Jawaban / Panduan Penilaian" atau deskriptor skor (0, 1, 2, 3) yang tampil tidak sesuai dengan data yang telah dimasukkan Admin di Bank Soal.
* **Akar Masalah:**  
  1. Pada [`ExaminerStagePage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/examiner/pages/ExaminerStagePage.jsx#L340-L425), jika tabel `osce.rubric_items` untuk stase tersebut belum terisi atau sudah pernah ter-generate dengan data fallback lama, sistem memuat teks default hardcoded (*"Anamnesis terstruktur"*, *"WDx & DDx sesuai kasus"*, dll.) alih-alih mengambil `answer_key` aktual dari `osce.question_bank_rubric_items`.
  2. Saat pembuatan sesi (`CreateSessionPage.jsx`), proses duplikasi kasus dari bank soal ke stase berpotensi tidak memetakan kolom `answer_key`, `description`, atau `descriptors` secara lengkap ke tabel `osce.rubric_items`.
  3. Komponen [`ExaminerRubricEvaluationSheet.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/examiner/components/ExaminerRubricEvaluationSheet.jsx#L32-L38) memprioritaskan `item.description || item.answer_key` yang mungkin kosong jika format penyimpanan di bank soal menggunakan nama atribut yang berbeda (`rubric_criteria`, `gold_standard`, `description_score_*`).
* **Solusi Teknis:**
  * Standardisasi skema transfer data dari `osce.question_bank_rubric_items` ke `osce.rubric_items` agar seluruh field (`question`, `answer_key`, `weight`, `competency_area`, `description_score_0..3`) tersalin 100% identik.
  * Perbaiki pembacaan data di `ExaminerStagePage.jsx` agar memprioritaskan join relasi langsung ke master Bank Soal (`cases`/`question_bank`) jika data di `rubric_items` terindikasi bernilai default.
  * Perkaya mapping fallback di `ExaminerRubricEvaluationSheet.jsx` untuk membaca seluruh kemungkinan field (`rub.answer_key || rub.description || rub.guideline || rub.gold_standard`).

---

## 📋 3. Matriks Tracking Task Perbaikan

| ID | Modul | Deskripsi Bug / Task | Prioritas | Status |
| :--- | :--- | :--- | :---: | :---: |
| **BUG-001** | Peserta | Cegah auto-submit / selesai saat reload (Session State Rehydration) | 🚨 High | ✅ Resolved |
| **BUG-002** | Peserta | Implementasi Screen Wake Lock API & toleransi lock/screen timeout tablet | 🚨 High | ✅ Resolved |
| **BUG-003** | Penguji | Perbaikan mapping kunci jawaban & deskriptor rubrik dari Bank Soal ke Layar Penguji | 🚨 High | ✅ Resolved |
