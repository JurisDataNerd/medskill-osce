# MedSkill OSCE

Sistem manajemen ujian **OSCE (Objective Structured Clinical Examination)** berbasis web yang digunakan untuk mengelola seluruh proses ujian mulai dari registrasi peserta, pelaksanaan setiap stase, penilaian oleh penguji, hingga publikasi hasil.

---

# Tujuan

- Mengelola pelaksanaan OSCE secara digital.
- Mengurangi proses manual selama ujian.
- Mengotomatisasi perpindahan peserta (rolling).
- Menyediakan penilaian real-time oleh penguji.
- Menghasilkan hasil akhir yang dapat diakses peserta.

---

# Role

## Admin

Memiliki akses penuh terhadap seluruh sistem.

Fitur:

- Membuat sesi OSCE
- Mengatur stase
- Menyetujui peserta
- Memulai ujian
- Pause / Resume ujian
- Mengakhiri ujian
- Monitoring seluruh peserta
- Review hasil
- Publish hasil
- Mengirim hasil ke Email

---

## Penguji

Setiap penguji bertanggung jawab pada satu stase.

Fitur:

- Melihat peserta pada stase saat ini
- Melihat jawaban peserta
- Memberikan nilai
- Mengisi checklist penilaian
- Menambahkan catatan internal
- Menunggu peserta berikutnya setelah rolling

Catatan:

- Penguji tidak berpindah stase.
- Catatan penguji tidak dapat dilihat peserta.

---

## Peserta

Peserta mengikuti seluruh rangkaian OSCE.

Fitur:

- Registrasi
- Login
- Waiting Room
- Mengerjakan soal setiap stase
- Mengikuti perpindahan stase secara otomatis
- Melihat hasil setelah dipublikasikan

---

# Alur Sistem

## 1. Registrasi

Peserta melakukan registrasi akun.

```
Register
      │
      ▼
Waiting Approval
      │
      ▼
Approved Admin
      │
      ▼
Dashboard
```

Peserta yang belum disetujui tidak dapat mengikuti OSCE.

---

## 2. Persiapan OSCE

Admin membuat sesi OSCE.

Contoh:

- Nama Sesi
- Jumlah Stase
- Durasi Stase
- Durasi Istirahat
- Penguji
- Peserta

Status awal:

```
Draft
```

---

## 3. Waiting Room

Peserta login sebelum ujian dimulai.

Dashboard hanya menampilkan informasi bahwa ujian belum dimulai.

```
Waiting Room

OSCE belum dimulai
Silakan menunggu...
```

---

## 4. Start OSCE

Admin menekan tombol:

```
Start OSCE
```

Sistem otomatis:

- Mengaktifkan timer
- Membuka stase pertama
- Menampilkan soal
- Menentukan peserta pada stase masing-masing

---

## 5. Pengerjaan Stase

Peserta mengerjakan soal.

Selama waktu berjalan peserta dapat:

- Membaca soal
- Menjawab soal
- Menyimpan jawaban

Dashboard peserta:

```
Stase 1

Timer

Soal

Jawaban
```

---

## 6. Penilaian Penguji

Penguji melihat peserta yang sedang berada pada stasenya.

Penguji dapat:

- Memberikan nilai
- Mengisi checklist
- Menambahkan catatan

Catatan hanya dapat dilihat penguji dan admin.

---

## 7. Timer Habis

Saat waktu habis sistem otomatis:

- Mengunci jawaban
- Mengakhiri stase
- Masuk ke masa istirahat

Tidak diperlukan intervensi admin.

---

## 8. Istirahat

Peserta melihat halaman istirahat.

```
Break Time

02:00
```

Pada waktu ini penguji dapat menyelesaikan penilaian.

---

## 9. Rolling

Setelah waktu istirahat selesai sistem otomatis memindahkan peserta ke stase berikutnya.

Contoh:

```
Round 1

A -> Stase 1
B -> Stase 2
C -> Stase 3

↓

Round 2

A -> Stase 2
B -> Stase 3
C -> Stase 1
```

Penguji tetap berada pada stase yang sama.

---

## 10. Sesi Berikutnya

Langkah berikut akan terus berulang.

```
Start

↓

Timer

↓

Break

↓

Rolling

↓

Timer

↓

Break

↓

Rolling
```

Hingga seluruh peserta menyelesaikan seluruh stase.

---

## 11. Finish OSCE

Setelah seluruh ronde selesai.

Status berubah menjadi:

```
Completed
```

Admin dapat melakukan review hasil.

---

## 12. Publish Result

Admin menekan:

```
Publish Result
```

Sistem akan:

- Menghitung nilai akhir
- Menampilkan hasil pada dashboard peserta
- Mengirim hasil melalui Email

---

# Flow Keseluruhan

```
Registrasi
      │
      ▼
Approval Admin
      │
      ▼
Dashboard
      │
      ▼
Waiting Room
      │
      ▼
Start OSCE
      │
      ▼
Stase 1
      │
      ▼
Break
      │
      ▼
Rolling
      │
      ▼
Stase 2
      │
      ▼
Break
      │
      ▼
Rolling
      │
      ▼
...
      │
      ▼
Stase Terakhir
      │
      ▼
Review
      │
      ▼
Publish Result
      │
      ▼
Dashboard Peserta + Email
```

---

# Siklus Setiap Stase

```
Start Stase
      │
      ▼
Timer Berjalan
      │
      ▼
Peserta Mengerjakan
      │
      ▼
Penguji Menilai
      │
      ▼
Timer Selesai
      │
      ▼
Break
      │
      ▼
Rolling
      │
      ▼
Start Stase Berikutnya
```

---

# Rule OSCE

- 1 Penguji menangani 1 Stase.
- Penguji tidak berpindah stase.
- Peserta berpindah stase sesuai aturan rolling.
- Timer berjalan otomatis.
- Jawaban terkunci ketika timer selesai.
- Catatan penguji bersifat internal.
- Hasil hanya dapat dilihat setelah dipublikasikan admin.
- Seluruh proses perpindahan peserta dilakukan otomatis oleh sistem.
