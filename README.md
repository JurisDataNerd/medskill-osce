# MedSkill OSCE

Sistem manajemen ujian **OSCE (Objective Structured Clinical Examination)** berbasis web yang digunakan untuk mengelola seluruh proses ujian mulai dari registrasi peserta, pelaksanaan setiap stase dalam sirkuit 8 stase (6 stase aktif + 2 stase break dengan timer 12 menit: 1m Reading, 10m Action, 1m Transition), penilaian oleh penguji dengan acuan kunci jawaban baku, hingga publikasi hasil dan pengiriman email otomatis.

---

# Tujuan

- Mengelola pelaksanaan OSCE secara digital dan terstandarisasi.
- Mengurangi proses manual selama ujian.
- Mengotomatisasi perpindahan peserta (rolling sirkuit 8 stase).
- Menyediakan penilaian real-time oleh penguji dengan acuan kunci jawaban resmi.
- Menghasilkan hasil akhir yang dapat diakses peserta, ditranskripsikan ke PDF, dan dikirimkan otomatis via Email.

---

# Role

## Admin

Memiliki akses penuh terhadap seluruh sistem.

Fitur:

- Membuat sesi OSCE & **Duplikasi Templat Stase (Paket Soal A, Paket Soal B)**
- **Mengatur urutan stase aktif & stase istirahat via Kanban Board (Drag & Drop)**
- Mengatur timer terstruktur per stase (Reading 1m, Action 10m, Transition 1m = Total 12m)
- Mengatur bank soal, rubrik penilaian, form diagnosis (1 WDx + 3 DDx), blangko resep, & kunci jawaban pemeriksaan penunjang
- Kontrol penuh: Memulai simulasi (*Start Session*) dan Menghentikan simulasi (*Stop Session*)
- Monitoring seluruh peserta secara realtime (*Master Live Board*)
- Review hasil, Publish hasil, Cetak PDF, & Pengiriman Email Otomatis ke peserta

---

## Penguji

Setiap penguji bertanggung jawab pada satu stase aktif.

Fitur:

- Memilih 1 stase penugasan
- Melihat rekap peserta secara realtime (otomatis ter-update saat peserta klik *Next* / *Submit*)
- **Melihat isian Form Diagnosis (1 WDx + 3 DDx) & Blangko Resep obat peserta secara realtime**
- **Melihat Tampilan Acuan Kunci Jawaban Baku (Gold Standard) dari Admin sebagai pembanding penilaian**
- Memberikan nilai (Skor Rubrik & Global Rating Scale - GRS)
- Mengisi checklist penilaian & catatan *feedback* internal
- Menekan tombol *Submit* untuk *auto-next* ke penilaian peserta berikutnya sampai peserta terakhir

Catatan:

- Penguji tidak berpindah stase.
- Catatan penguji tidak dapat dilihat peserta saat ujian berlangsung.

---

## Peserta

Peserta mengikuti seluruh rangkaian sirkuit OSCE (8 Stase: 6 Stase Aktif + 2 Stase Break).

Fitur:

- Registrasi & Login (Dilengkapi fitur *Forget Password*)
- Waiting Room & Briefing (*stay in page* hingga Admin menekan *Start Simulation*)
- Mengerjakan soal setiap stase aktif dengan timer 12 menit (Reading 1m, Action 10m, Transition 1m):
  - **Blangko 1: Anamnesis & Pemeriksaan Fisik**
  - **Blangko 2: Checklist Pemeriksaan Penunjang** (Hasil rilis jika benar, tidak rilis jika tidak dicentang, "Tidak ada data" jika salah)
  - **Blangko 3: Diagnosis (1 WDx + 3 DDx) & Blangko Resep Obat (Long Text Area)**
- Mengikuti perpindahan stase secara otomatis (rolling sirkuit 8 stase)
- Menerima hasil & umpan balik via Email serta mengunduh Transkrip Nilai PDF setelah dipublikasikan

---

# Alur Sistem & Sirkuit 8 Stase

## 1. Registrasi & Approval

Peserta melakukan registrasi akun dan memilih sesi.

```
Register ──► Waiting Approval ──► Approved Admin ──► Dashboard
```

---

## 2. Persiapan OSCE & Kanban Ordering

Admin membuat sesi OSCE, mengimpor/duplikasi paket soal, dan mengatur urutan **6 Stase Aktif** dan **2 Stase Break** menggunakan Kanban Board (Drag & Drop).

```
Draft ──► Import Paket Soal ──► Susun Kanban Urutan Stase & Break ──► Published
```

---

## 3. Waiting Room & Start OSCE

Peserta masuk ke Ruang Tunggu Briefing (*stay in waiting page*). Admin menekan tombol `Start Simulation` untuk memulai timer otomatis sirkuit 8 stase (12 menit per stase).

---

## 4. Pengerjaan Stase & Rotasi (Sirkuit 8 Stase)

Peserta melewati sirkuit 8 stase (6 Stase Ujian Aktif + 2 Stase Break).

```
Round 1: [Stase 1 Aktif] ──► [Stase 2 Aktif] ──► [Stase Break 1] ──► [Stase 3 Aktif] ──► ...
                                     │
                                     ▼ (Rolling Otomatis)
Round 2: [Stase Terakhir] ──► [Stase 1 Aktif] ──► [Stase 2 Aktif] ──► ...
```

Selama waktu berjalan pada stase aktif (12m: 1m Reading, 10m Action, 1m Transition):
- Mengerjakan Blangko Anamnesis & Fisik
- Mengisi Checklist Penunjang (Rilis Hasil / Tidak / No Data)
- Mengisi 1 WDx, 3 DDx, dan Textarea Blangko Resep

Penguji menilai dengan melihat **Acuan Kunci Jawaban Baku** di dasbor penguji.

---

## 5. Finish, PDF & Auto Email

Setelah seluruh peserta menyelesaikan 8 stase sirkuit, status berubah menjadi `Completed`. Admin mereview nilai, mengeklik `Publish Result`, dan sistem secara otomatis men-generate **PDF Transkrip** serta mengirirkannya ke **Email Peserta**.

---

# Rule Utama OSCE

- Sirkuit terdiri dari **8 Stase (6 Stase Ujian Aktif + 2 Stase Break)**.
- Timer 12 Menit/stase: Reading (1m) + Action (10m) + Transition (1m).
- Urutan stase ujian & break dapat diubah-ubah oleh Admin via **Kanban Drag & Drop Board**.
- Admin dapat menyimpan templat stase untuk diduplikasi (**Paket Soal A / B**).
- 1 Penguji menangani 1 Stase Aktif (Penguji tidak berpindah stase).
- Penguji mendapat rekap realtime & acuan **Kunci Jawaban Baku**.
- PDF Transkrip & Email Feedback dikirim otomatis ke peserta setelah publish.
