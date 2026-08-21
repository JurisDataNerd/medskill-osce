# 🔄 Spesifikasi Alur Rotasi Sirkuit OSCE (rolling.md)

> **Praxis by MedSkill Indonesia** — *Single Source of Truth Spesifikasi Rolling, Matriks Rotasi, Penanganan Stase Istirahat, dan 10 Studi Kasus Pengujian*

---

## 📑 Daftar Isi
1. [Prinsip Dasar Rotasi Sirkuit 8 Stase](#1-prinsip-dasar-rotasi-sirkuit-8-stase)
2. [Formulasi Matematika Rotasi Pos Ujian](#2-formulasi-matematika-rotasi-pos-ujian)
3. [Matriks Rotasi 8 Peserta × 8 Ronde](#3-matriks-rotasi-8-peserta--8-ronde)
4. [Penanganan Khusus Stase Istirahat (Rest Station)](#4-penanganan-khusus-stase-istirahat-rest-station)
5. [10 Studi Kasus Pengujian Sistem (10 Test Cases)](#5-10-studi-kasus-pengujian-sistem-10-test-cases)

---

## 1. 🏗️ Prinsip Dasar Rotasi Sirkuit 8 Stase

Dalam ujian OSCE terpadu dengan **8 Pos Stase**:
- **6 Stase Ujian Klinis Aktif** (Stase 1, 2, 3, 5, 6, 7): Diuji oleh Dokter Penguji Spesialis dengan lembar rubrik penilaian 0-3 dan GRS.
- **2 Stase Istirahat / Rest Station** (Stase 4 & Stase 8): Digunakan untuk pemulihan stamina peserta di tengah dan akhir putaran sirkuit. Tidak ada Dokter Penguji dan tidak ada pengisian jawaban.
- **8 Peserta** (P1 s/d P8): Setiap peserta memulai ujian dari posisi stase yang berbeda (*Starting Station*) pada Ronde 1, lalu berputar searah jarum jam (*clockwise rotation*) hingga menyelesaikan seluruh 8 ronde.
- **8 Ronde Ujian**: Setiap peserta akan melewati tepat 6 Stase Ujian Klinis dan 2 Stase Istirahat.

---

## 2. 📐 Formulasi Matematika Rotasi Pos Ujian

### 2.1 Posisi Peserta di Ronde $R$
Jika Peserta $P_k$ memiliki **Stase Awal (Starting Station)** $S_0 \in \{1, 2, \dots, 8\}$, maka posisi stase peserta pada Ronde $R \in \{1, 2, \dots, 8\}$ dihitung menggunakan rumus modular:

$$\text{Station Position}(P_k, R) = \left( (S_0 - 1 + (R - 1)) \bmod 8 \right) + 1$$

### 2.2 Peserta yang Diuji Penguji di Stase $S$ pada Ronde $R$
Dokter Penguji bertugas secara **tetap di 1 Ruang Stase** $S$. Untuk mengetahui peserta mana yang sedang berada di stasenya pada Ronde $R$, gunakan rumus balik:

$$S_0 = \left( (S - 1 - (R - 1)) \bmod 8 + 8 \right) \bmod 8 + 1$$

Peserta aktif adalah peserta dengan `starting_station_number == S_0`.

---

## 3. 📊 Matriks Rotasi 8 Peserta × 8 Ronde

Tabel di bawah menggambarkan pergerakan seluruh 8 peserta dari Ronde 1 hingga Ronde 8:

| Peserta | Stase Awal ($S_0$) | Ronde 1 | Ronde 2 | Ronde 3 | Ronde 4 | Ronde 5 | Ronde 6 | Ronde 7 | Ronde 8 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **P1** | Pos 1 | **Stase 1 (U1)** | **Stase 2 (U2)** | **Stase 3 (U3)** | ☕ *Stase 4 (Rest A)* | **Stase 5 (U4)** | **Stase 6 (U5)** | **Stase 7 (U6)** | ☕ *Stase 8 (Rest B)* |
| **P2** | Pos 2 | **Stase 2 (U2)** | **Stase 3 (U3)** | ☕ *Stase 4 (Rest A)* | **Stase 5 (U4)** | **Stase 6 (U5)** | **Stase 7 (U6)** | ☕ *Stase 8 (Rest B)* | **Stase 1 (U1)** |
| **P3** | Pos 3 | **Stase 3 (U3)** | ☕ *Stase 4 (Rest A)* | **Stase 5 (U4)** | **Stase 6 (U5)** | **Stase 7 (U6)** | ☕ *Stase 8 (Rest B)* | **Stase 1 (U1)** | **Stase 2 (U2)** |
| **P4** | Pos 4 | ☕ *Stase 4 (Rest A)* | **Stase 5 (U4)** | **Stase 6 (U5)** | **Stase 7 (U6)** | ☕ *Stase 8 (Rest B)* | **Stase 1 (U1)** | **Stase 2 (U2)** | **Stase 3 (U3)** |
| **P5** | Pos 5 | **Stase 5 (U4)** | **Stase 6 (U5)** | **Stase 7 (U6)** | ☕ *Stase 8 (Rest B)* | **Stase 1 (U1)** | **Stase 2 (U2)** | **Stase 3 (U3)** | ☕ *Stase 4 (Rest A)* |
| **P6** | Pos 6 | **Stase 6 (U5)** | **Stase 7 (U6)** | ☕ *Stase 8 (Rest B)* | **Stase 1 (U1)** | **Stase 2 (U2)** | **Stase 3 (U3)** | ☕ *Stase 4 (Rest A)* | **Stase 5 (U4)** |
| **P7** | Pos 7 | **Stase 7 (U6)** | ☕ *Stase 8 (Rest B)* | **Stase 1 (U1)** | **Stase 2 (U2)** | **Stase 3 (U3)** | ☕ *Stase 4 (Rest A)* | **Stase 5 (U4)** | **Stase 6 (U5)** |
| **P8** | Pos 8 | ☕ *Stase 8 (Rest B)* | **Stase 1 (U1)** | **Stase 2 (U2)** | **Stase 3 (U3)** | ☕ *Stase 4 (Rest A)* | **Stase 5 (U4)** | **Stase 6 (U5)** | **Stase 7 (U6)** |

> **Keterangan Badge**:
> - **U1 s/d U6**: Stase Ujian Klinis (Berpenguji & Ada Form Jawaban Peserta).
> - ☕ *Rest A & Rest B*: Stase Istirahat (Tanpa Penguji, Form Jawaban Dikunci/Disabled).

---

## ☕ 4. Penanganan Khusus Stase Istirahat (Rest Station)

1. **Atribut Stase di Database**:
   - `osce.stations.is_break = true`
   - `osce.stations.title = "Stase 4: Istirahat A"`
2. **Perilaku Layar Kiosk Peserta (`ParticipantSessionPage.jsx`)**:
   - Tampilan berubah menjadi card informasi **Stase Istirahat**.
   - Menampilkan instruksi untuk tetap berada di area stase dan memulihkan stamina.
   - Form input Anamnesis, Pemeriksaan Fisik, Penunjang, dan Resep **dikunci (disabled/read-only)**.
   - Tidak ada tombol submit jawaban.
3. **Perilaku Layar Penguji (`ExaminerStagePage.jsx`)**:
   - Stase Istirahat tidak ditugaskan ke Dokter Penguji manapun.
   - Jika Penguji membuka stase tersebut, sistem menampilkan status *"Stase Istirahat Sirkuit (Tanpa Penguji)"*.
4. **Kalkulasi Nilai & NBL (Borderline Regression)**:
   - Stase dengan `is_break = true` **diabaikan secara otomatis (EXCLUDED)** dari perhitungan NBL, persentase nilai akhir sesi, dan transkrip PDF.

---

## 🧪 5. 10 Studi Kasus Pengujian Sistem (10 Test Cases)

---

### 📝 Case 1: Inisialisasi Transisi Awal Pre-Exam (`initial_transition`)
* **Scenario**: Admin menekan tombol **Start Simulation** pada sesi 8 Stase.
* **Given**: Sesi dalam status `waiting_room`.
* **When**: Admin klik `Start Simulation`.
* **Then**:
  1. `session_timer_state` di-upsert dengan `phase: "initial_transition"`, `round_number: 1`, dan `target_end_time: NOW + 1 Menit`.
  2. Layar Peserta P1 s/d P8 menampilkan banner *Transisi Persiapan Pos Stase 1*.
  3. Timer berjalan dari `01:00` ke `00:00` selama 1 menit.

---

### 🚀 Case 2: Transisi Otomatis dari Transisi Awal ke Stase Ujian Ronde 1
* **Scenario**: Timer `initial_transition` mencapai `00:00`.
* **Given**: Timer di `phase: "initial_transition"`, `remaining_seconds <= 0`.
* **When**: Engine timer tick mendeteksi `rem <= 0`.
* **Then**:
  1. Bel 1x High Chime berbunyi secara otomatis.
  2. `session_timer_state` di-update ke `phase: "action"`, `round_number: 1`, `target_end_time: NOW + Durasi Stase (misal 10 Menit)`.
  3. Layar P1, P2, P3, P5, P6, P7 membuka Kiosk Ujian 4-Halaman.
  4. Layar P4 dan P8 membuka Tampilan Stase Istirahat.

---

### ☕ Case 3: Peserta Masuk ke Stase Istirahat pada Ronde 1 (P4 & P8)
* **Scenario**: P4 memulai ujian di Pos 4 (Rest A) dan P8 memulai di Pos 8 (Rest B).
* **Given**: Ronde 1 `phase: "action"`.
* **When**: P4 membuka `/participant/session/:sessionId`.
* **Then**:
  1. Sistem mendeteksi `activeStationInfo.is_break === true`.
  2. Form input diagnosis/resep dikunci total (*disabled*).
  3. Tampilan pesan: *"Anda sedang berada di Stase Istirahat. Harap gunakan waktu ini untuk istirahat hingga bel rotasi berbunyi."*
  4. Tidak ada data yang dikirim ke Supabase `participant_answers`.

---

### 🩺 Case 4: Dokter Penguji Menerima Peserta Sesuai Rotasi Pos
* **Scenario**: Dokter Penguji Spesialis Paru bertugas di Stase 2 (Pos 2).
* **Given**: Sesi berjalan di Ronde 1 dan berlanjut ke Ronde 2.
* **When**: Ronde 1 $\rightarrow$ Penguji melihat P2. Ronde 2 $\rightarrow$ Penguji melihat P1.
* **Then**:
  1. Pada Ronde 1, rumus $S_0 = 2$ mencocokkan **P2**. Tampilan Side-by-Side memuat nama & NIM P2.
  2. Pada Ronde 2, rumus $S_0 = 1$ mencocokkan **P1**. Layar penguji me-refresh data jawaban *live typing* milik P1.
  3. Nilai Ronde 1 dikunci (`is_locked = true`) di database `examiner_evaluations` untuk P2 pada `rotation_round = 1`.

---

### ⚠️ Case 5: Bel Peringatan 2 Menit Tersisa (`warning_2min`)
* **Scenario**: Waktu Stase Ujian tersisa 2 menit (`remaining_seconds === 120`).
* **Given**: `phase: "action"`, `round_number: 3`.
* **When**: Timer menghitung `remaining_seconds` mencapai angka 120.
* **Then**:
  1. Audio Synthesizer memicu **Bel 2x Warning Beep (660 Hz)** di seluruh perangkat (Admin, Peserta, Penguji).
  2. Log Admin mencatat: `BEL AUTOMATIC: Sisa Waktu Stase 2 Menit!`.
  3. Header timer di layar peserta berkedip kuning (*warning state*).

---

### 🚨 Case 6: Rotasi Transisi Pasca-Stase & Bel 3x Sirene
* **Scenario**: Waktu Stase Ujian Ronde 3 berakhir (`remaining_seconds <= 0`).
* **Given**: `phase: "action"`, `round_number: 3`.
* **When**: Timer mencapai `00:00`.
* **Then**:
  1. Audio Synthesizer memicu **Bel 3x Siren Rotation (523 Hz -> 987 Hz)**.
  2. `session_timer_state` di-update ke `phase: "transition"`, `round_number: 3`, `target_end_time: NOW + 1 Menit`.
  3. Peserta dialihkan ke layar transit 1 menit (*Waktu Perpindahan Pos Stase*).
  4. Dokter penguji melihat banner: `⏱️ Waktu Ronde Habis — Silakan selesaikan penilaian & submit skor`.

---

### ⏭️ Case 7: Admin Menggunakan Tombol Skip Phase pada Stase Istirahat vs Stase Ujian
* **Scenario**: Admin menekan tombol **Skip Phase / Next Round** di Control Room.
* **Given**: Timer sedang berjalan di `phase: "action"` Ronde 4.
* **When**: Admin klik `Skip Phase`.
* **Then**:
  1. Sistem memperbarui `session_timer_state` ke `phase: "transition"` (Skip waktu stase ke transisi).
  2. Jika Admin klik `Skip Phase` sekali lagi saat `phase: "transition"`, sistem langsung menaikkan `round_number` ke 5 dan set `phase: "action"`.
  3. Semua peserta & penguji ter-synchronize secara instan via Supabase Realtime CDC tanpa ada latensi.

---

### ⏸️ Case 8: Penanganan Pause & Resume Timer Global di Tengah Sirkuit
* **Scenario**: Terjadi keadaan darurat di ruang stase pada Ronde 5, Admin menekan tombol **Pause**.
* **Given**: Timer di Ronde 5 `phase: "action"`, tersisa 450 detik (7.5 menit).
* **When**: Admin klik `Pause Timer`.
* **Then**:
  1. `session_timer_state.phase` berubah menjadi `"paused"`.
  2. `paused_remaining_ms` diisi `450000`. `target_end_time` di-set `null`.
  3. Layar peserta & penguji menampilkan banner merah `PAUSED — Ujian Dihentikan Sementara oleh Admin`. Input form beku.
  4. Saat Admin klik `Resume Timer`, `target_end_time` dihitung ulang (`NOW() + 450000ms`), dan timer berjalan kembali presisi dari 7.5 menit.

---

### 🔄 Case 9: Resiliensi Client Tab Sleep / Refresh Browser di Ronde 6
* **Scenario**: Peserta P5 tidak sengaja menutup browser atau laptop masuk ke mode *sleep* selama 3 menit pada Ronde 6.
* **Given**: Laptop P5 dibuka kembali.
* **When**: P5 membuka kembali URL `/participant/session/:sessionId`.
* **Then**:
  1. *Future Timestamp Pattern* menghitung ulang sisa waktu:
     $$\text{Remaining} = \max(0, \text{target\_end\_time} - \text{NOW()})$$
  2. Sisa waktu di layar P5 langsung presisi mengikuti timer Admin tanpa ada lag/selisih.
  3. Keystroke jawaban P5 yang sebelumnya tersimpan di `localStorage` direstore otomatis ke form.

---

### 🏁 Case 10: Transisi Akhir Ronde 8 ke State `completed_waiting` (Sesi Finished)
* **Scenario**: Timer transisi pasca-stase Ronde 8 berakhir (`remaining_seconds <= 0` pada `current_round == 8`).
* **Given**: `phase: "transition"`, `round_number: 8`, `total_rounds: 8`.
* **When**: Engine timer tick mendeteksi `rem <= 0`.
* **Then**:
  1. `currentRound >= totalRounds` ($8 \ge 8$) terevaluasi **TRUE**.
  2. Engine timer memanggil `setSessionCompletedWaiting(sessionId, 8)`.
  3. `session_timer_state.phase` berubah menjadi `"completed_waiting"`. Timer membeku tepat di `00:00`.
  4. **Layar Peserta (P1 s/d P8)**: Otomatis di-redirect ke **Halaman Terima Kasih / OSCE Completion**, seluruh form dikunci total (*read-only*).
  5. **Layar Admin**: Indikator berubah menjadi badge `SESI SELESAI — Menunggu Penutupan Admin`. Tombol **Akhiri Sesi OSCE** aktif.
  6. Admin klik **Akhiri Sesi OSCE** $\rightarrow$ Status sesi menjadi `completed`, broadcast `session_finished` dikirim, dan kalkulasi NBL (Borderline Regression) dijalankan hanya pada 6 Stase Ujian.
