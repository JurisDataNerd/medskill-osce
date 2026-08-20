# 📋 Task Breakdown & TODO List OSCE MedSkill Praxis

**Tanggal Rapat:** 15 Agustus 2026  
**Target Deadline:** 22 Agustus 2026  
**Status Dokumentasi:** Terperinci (Detailed TODO)

---

## 📱 1. Halaman Peserta (Participant Interface)

### 1.1 Profile MedSkill Praxis
- [x] **Pembersihan Data NIM**
  - **Konteks:** Data NIM peserta tidak lagi digunakan pada alur sistem saat ini.
  - **Tindakan:** Hapus atau sembunyikan (hidden) elemen UI yang menampilkan NIM pada kartu profil/header peserta.
  - **Kriteria Hasil:** UI profil peserta hanya menampilkan informasi relevan (Nama, Foto/ID Peserta, Sesi).

- [x] **Dynamic Navigation & Sembunyikan Judul Stase**
  - **Konteks:** Saat ini alur ujian peserta masih terkunci di "Stase 1" (statik) dan menampilkan nama judul stase yang seharusnya tidak diketahui peserta secara terbuka.
  - **Tindakan:** 
    - Sembunyikan/hapus komponen teks **Judul Stase** dari UI Peserta.
    - Perbaiki alur navigasi agar urutan stase menyesuaikan dengan jadwal rotasi peserta (dinamis berdasarkan urutan stase peserta).
  - **Kriteria Hasil:** Peserta berpindah stase sesuai urutan rotasinya tanpa melihat nama/judul spesifik stase tersebut.

### 1.2 Audio Assets & Pewaktuan Transisi
- [x] **Integrasi MP3 Assets, Sound Effects & Voiceover Narasi Suara (Standard SOP OSCE Kedokteran Indonesia)**
  - **Konteks:** Sistem Praxis membutuhkan pemetaan suara bel dan narasi suara (*voiceover*) otomatis yang selaras dengan alur Ujian OSCE Kedokteran Indonesia (UKMPPD/SOP FK) dan state sistem Praxis (*Waiting Room, Briefing, Stase Live, Transit, Rest Station, Terima Kasih*).
  - **Tabel Pemetaan Alur Sistem Praxis & Skrip Narasi Voiceover:**

| No | Phase / State pada Sistem Praxis | Trigger Waktu Timer | Sound Effect | Skrip Narasi Voiceover (Bahasa Indonesia) | Target Asset MP3 |
|---|---|---|---|---|---|
| **1** | **Waiting Room & Standby Kiosk** | Saat peserta memasuki ruang tunggu & Admin mengaktifkan sesi. | Bel Chime 1x 🔔 | *"Selamat datang di Ujian OSCE MedSkill. Peserta ujian dipersilakan menempatkan diri di depan pintu stase masing-masing."* | `audio_01_waiting_room.mp3` |
| **2** | **Membaca Skenario di Luar Stase** | Awal jeda 1–2 menit membaca instruksi sebelum masuk ruangan. | Bel Ting 1x 📖 | *"Silakan membuka dan membaca instruksi skenario kasus di luar pintu stase."* | `audio_02_read_scenario.mp3` |
| **3** | **Masuk Stase & Mulai Ujian Live** | Detik 00:00 saat timer stase aktif dimulai (Render View 3). | Bel Panjang 2-Tone 🔔🔔 | *"Waktu membaca selesai. Silakan memasuki ruang stase dan mulailah ujian."* | `audio_03_start_exam.mp3` |
| **4** | **Peringatan Sisa Waktu Ujian** | 2 Menit & 1 Menit sebelum durasi stase habis. | Bel Warning Chime ⚠️ | *"Perhatian, waktu ujian stase tersisa dua menit lagi."* / *"Waktu ujian stase tersisa satu menit lagi."* | `audio_04_warning_time.mp3` |
| **5** | **Selesai Stase & Pergerakan Transisi** | Detik 00:00 stase habis & layar Ruang Transit (Render View 2) muncul. | Bel 3x Gong 🛑 | *"Waktu ujian stase telah selesai. Peserta dipersilakan keluar dari ruangan dan berpindah ke pos stase berikutnya."* | `audio_05_stop_transit.mp3` |
| **6** | **Stase Istirahat Ronde (Rest Station)** | Saat peserta memasuki ronde/stase istirahat. | Bel Soft Chime ☕ | *"Anda memasuki stase istirahat. Silakan memulihkan stamina di area sirkuit."* | `audio_06_rest_break.mp3` |
| **7** | **Akhir Ujian (Halaman Terima Kasih)** | Saat seluruh ronde selesai dan masuk ke Halaman Terima Kasih. | Bel Fanfare Chime 🎉 | *"Seluruh rangkaian ujian OSCE telah selesai. Terima kasih atas partisipasi Anda, dipersilakan meninggalkan lokasi ujian."* | `audio_07_finish_exam.mp3` |
| **8** | **Broadcast / Pause Control Room** | Admin mempause sesi atau mengirim notifikasi darurat. | Alert Broadcast Siren 📢 | *"Perhatian dari Panitia Control Room. Sesi ujian dihentikan sementara."* | `audio_08_admin_broadcast.mp3` |

  - **Tindakan Teknis:**
    - Buat modul pembaca audio (`audioService.js`) yang memutar kombinasi bel chime dan voiceover secara otomatis sesuai event timer real-time tanpa delay (*zero latency*).
    - Sediakan layar/modal **Transisi Stase & Waiting Room** yang dilengkapi countdown timer visual dan indikator audio aktif.
  - **Kriteria Hasil:** Audio bel dan narasi suara berbunyi jernih secara otomatis pada tiap tahapan timer tanpa *latency* atau bentrok audio.

### 1.3 Tampilan Anamnesis & Pemeriksaan Fisik
- [x] **Restriksi Tampilan Informasi Kasus (Hanya Skenario & Instruksi)**
  - **Konteks:** Jawaban/rubrik penilaian tidak boleh terlihat pada layar peserta.
  - **Tindakan:** Audit komponen Anamnesis & Pemeriksaan Fisik pada UI Peserta. Pastikan elemen yang dirender **hanya Skenario Kasus** dan **Instruksi Peserta**. Sembunyikan data kunci jawaban atau rubrik penguji.
  - **Kriteria Hasil:** Peserta hanya dapat membaca skenario dan instruksi tanpa ada kebocoran kunci jawaban/rubrik.

### 1.4 Halaman Akhir Ujian (Halaman Terima Kasih)
- [x] **Dinamisasi Halaman Akhir Ujian**
  - **Konteks:** Halaman penyelesaian ujian saat ini masih statik dan belum terintegrasi otomatis dengan status timer.
  - **Tindakan:**
    - Ubah Halaman Terima Kasih menjadi komponen dinamis yang menerima state hasil/ringkasan sesi.
    - Atur auto-redirect ke Halaman Terima Kasih ketika waktu ujian stase terakhir habis ATAU ketika peserta menekan tombol selesai lebih awal.
  - **Kriteria Hasil:** Begitu waktu habis/sesi berakhir, peserta otomatis terarah ke halaman terima kasih dinamis.

### 1.5 Modal Input Berkas Penunjang
- [x] **Perbaikan Navigasi Modal (Fitur Back/Tutup)**
  - **Konteks:** Saat peserta membuka modal permintaan/input berkas penunjang, peserta tidak bisa kembali/keluar dari modal tersebut (tidak ada kontrol back/close).
  - **Tindakan:** Tambahkan tombol `Kembali` / `Tutup` (Back button) serta event listener `Escape` pada modal berkas penunjang.
  - **Kriteria Hasil:** Peserta dapat menutup modal atau kembali ke halaman stase dengan lancar.

### 1.6 Form Input Diagnosis (Peserta & Penguji)
- [x] **Template Placeholder Form Diagnosis**
  - **Konteks:** Form input diagnosis membutuhkan format pengerjaan yang terstruktur (Diagnosis Utama, Diagnosis Banding 1, Diagnosis Banding 2).
  - **Tindakan:** Tambahkan template placeholder pada field input/textarea diagnosis baik di halaman peserta maupun penguji:
    ```text
    1. [Diagnosis Utama]
    2. [Diagnosis Banding 1]
    3. [Diagnosis Banding 2]
    ```
  - **Kriteria Hasil:** Input area menampilkan placeholder panduan angka 1, 2, dan 3 saat kosong.

### 1.7 Restriksi Navigasi Tombol Skip
- [x] **Penghapusan Tombol Skip**
  - **Konteks:** Peserta tidak diperbolehkan melompati (skip) stase secara mandiri untuk menjaga integritas waktu OSCE.
  - **Tindakan:** Hapus atau nonaktifkan (disable/remove) tombol Skip pada seluruh UI Peserta.
  - **Kriteria Hasil:** Peserta wajib mengikuti alur stase berdasarkan waktu yang berjalan tanpa ada opsi melompati stase.

---

## 👨‍🏫 2. Halaman Penguji (Examiner Interface)

### 2.1 Jadwal & Rotasi Peserta per Stase
- [x] **Tampilan List Rotasi Peserta Real-time**
  - **Konteks:** Penguji perlu mengetahui daftar peserta yang sedang dan akan diuji di stase tempatnya bertugas.
  - **Tindakan:** Implementasikan daftar/tabel rotasi peserta pada dashboard penguji yang memfilter peserta berdasarkan stase aktif penguji tersebut.
  - **Kriteria Hasil:** Penguji dapat melihat urutan nama/ID peserta yang masuk ke stasenya secara terurut.

### 2.2 Modal Detail Berkas Penunjang Penguji
- [x] **Fix Error & Render Jawaban/Request Peserta**
  - **Konteks:** Mengklik detail berkas penunjang di sisi penguji saat ini menyebabkan crash/error.
  - **Tindakan:**
    - Perbaiki penanganan data/null pointer saat membuka modal detail berkas penunjang.
    - Sesuaikan konten modal agar secara spesifik menampilkan daftar berkas/jawaban yang diminta atau diisi oleh peserta.
  - **Kriteria Hasil:** Modal dapat dibuka tanpa error dan menampilkan hasil jawaban berkas penunjang peserta secara presisi.

### 2.3 Middleware & Control Flow Rotasi Peserta
- [x] **Middleware Status Stase & Transisi**
  - **Konteks:** Diperlukan logika pengaman (guard) untuk mengontrol alur rotasi peserta dari sisi backend/frontend state.
  - **Tindakan:** Buat/perbarui middleware untuk memverifikasi apakah peserta berhak:
    1. Masuk ke halaman stase aktif.
    2. Dialihkan ke halaman transisi jeda stase.
    3. Masuk ke stase berikutnya setelah sesi selesai.
  - **Kriteria Hasil:** Peserta tidak bisa mengakses stase yang belum waktunya atau melompati middleware alur transisi.

---

## 🛠️ 3. Halaman Admin (Admin Interface)

### 3.1 Dashboard Tabel Sesi OSCE
- [x] **Integrasi Data Real-time Peserta pada Sesi OSCE**
  - **Konteks:** Tabel peserta pada detail Sesi OSCE di dashboard admin masih menggunakan data mockup/statik.
  - **Tindakan:** Hubungkan tabel peserta ke endpoint API Sesi OSCE backend untuk menampilkan daftar peserta sesungguhnya.
  - **Kriteria Hasil:** Admin melihat daftar peserta, status kehadiran, dan alokasi stase yang aktual dari database.

### 3.2 Randomisasi Mapping Stase
- [x] **Algoritma Randomisasi Rotasi Stase**
  - **Konteks:** Penataan alur peserta ke stase-stase per rotasi perlu dilakukan secara acak namun tetap seimbang dan efisien.
  - **Tindakan:** Buat fitur/tombol acak (randomize) mapping stase di Admin yang secara otomatis mengacak urutan rotasi peserta dan pengajuan stase.
  - **Kriteria Hasil:** Admin dapat menekan tombol randomisasi dan sistem akan menghasilkan matriks rotasi stase yang valid tanpa tabrakan jadwal.

---

## 🔮 4. Upcoming Features (Fitur Mendatang)

### 4.1 Duplikasi Sesi OSCE
- [ ] **Clone / Duplicate Sesi OSCE**
  - **Konteks:** Memudahkan admin membuat sesi ujian baru tanpa perlu menginput ulang skenario dan konfigurasi dari awal.
  - **Tindakan:** Tambahkan aksi "Duplicate Session" pada daftar Sesi OSCE di Admin yang mengopi master stase, skenario, dan pengaturan sesi ke sesi baru (draft).
  - **Kriteria Hasil:** Berhasil membuat copy Sesi OSCE baru dengan konfigurasi identik dari sesi asal.

