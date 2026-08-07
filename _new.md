# 📌 Laporan Evaluasi & Audit Sistem OSCE (`_new.md`)
**Praxis by Medskill Indonesia**

---

## 📑 1. Latar Belakang & Identifikasi Root-Cause Error

Dalam pelaksanaan Ujian OSCE (*Objective Structured Clinical Examination*) di institusi kedokteran:
- **Stase (Station)**: Merupakan **Ruang / Pos Ujian Fisik** yang memiliki Dokter Penguji Spesialis, Pasien Standar, dan Kasus Medis Aktif (misal: Stase Kardiovaskular, Stase Pulmonologi, Stase Bedah).
- **Istirahat (Break / Rest)**: Bukanlah sebuah stase atau kasus medis, melainkan **Fase / Jeda Waktu Istirahat (Break Phase / Break Round)** antar-perputaran rotasi sirkuit atau waktu jeda fisik peserta dan penguji.

### 🔴 Kesalahan Logika Konseptual yang Ditemukan:
Di beberapa dokumentasi `.md` awal dan beberapa bagian codebase UI, terdapat **kesalahan logika** di mana Istirahat dianggap setara dengan Stase fisik (seperti `Stase 3 = Break Station`, `Stase 7 = Break Station`, atau tombol `+ Tambah Istirahat` yang membuat slot stase tiruan berlabel "Istirahat").

Kesalahan ini menyebabkan beberapa dampak buruk:
1. **Mis-kalkulasi Jumlah Stase**: Sesi dengan 6 Stase Aktif dihitung menjadi 8 Stase karena menambahkan 2 "Stase Istirahat" tiruan.
2. **Ambiguitas Plotting Penguji**: Dokter penguji terbingung karena ada "Stase 3 (Istirahat)" yang tidak membutuhkan penugasan dokter penguji.
3. **Ambiguitas Rotasi Matriks**: Peserta dianggap "masuk ke Stase 3 Istirahat", padahal yang sebenarnya terjadi adalah seluruh peserta beristirahat pada **Jeda Waktu (Break Phase) antar-ronde**.

---

## 🔍 2. Audit Temuan Lokasi Kesalahan di Codebase & Dokumentasi

Berikut adalah daftar berkas dan komponen yang teridentifikasi masih menyimpan atau menggunakan konsepsi `Break Station` yang keliru dan perlu diperbaiki:

### A. Berkas Dokumentasi (`.md`)

| No | File Berkas | Lokasi Line / Bagian | Temuan Logika Keliru | Perbaikan yang Diperlukan |
|:--:|:---|:---|:---|:---|
| 1 | [OSCE.md](file:///c:/KAIRAV/project/2026/medskill/praxis/OSCE.md) | Line 20 & Line 134-144 | Menggunakan istilah *"Arsitektur Sirkuit 8 Stase (6 Stase Aktif + 2 Stase Break)"* dan tabel *"Stase 3: Break Station #1"*. | Ubah arsitektur menjadi **Sirkuit 6 Stase Aktif dengan Jeda Istirahat (Break Duration) Antar-Ronde**. Hapus baris "Stase Istirahat" dari tabel stase fisik. |
| 2 | [ADMIN.md](file:///c:/KAIRAV/project/2026/medskill/praxis/ADMIN.md) | Line 35 | Menyebut kontrol master timer pemantauan status stase break. | Perjelas bahwa timer mengontrol **Ronde Ujian (Exam Round)** dan **Jeda Istirahat (Break Duration)**. |
| 3 | [RAPAT001.md](file:///c:/KAIRAV/project/2026/medskill/praxis/RAPAT001.md) | Line 18 | Menyebutkan *"6 stase aktif + 2 stase break"*. | Perbarui catatan rapat menjadi *"6 stase ujian aktif dengan jeda istirahat rotasi"*. |

---

### B. Berkas Source Code Frontend (`src/`)

| No | File Komponen / Data | Lokasi Line / Elemen | Temuan Logika Keliru | Perbaikan yang Diperlukan |
|:--:|:---|:---|:---|:---|
| 1 | [mockAdminData.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/data/mockAdminData.js) | Line 7, Line 12 (`total_stations: 8`) | Deskripsi sesi menuliskan *"6 stase aktif + 2 stase break"* dan `total_stations: 8`. | Ubah `total_stations: 6` (murni 6 stase medis). Hapus keterangan "2 stase break" dari deskripsi sesi. |
| 2 | [mockExaminerData.js](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/examiner/data/mockExaminerData.js) | Line 40-43 | Menggunakan properti `break_after_round: 3` dan `break_duration_minutes: 10`. | Pastikan logika istirahat pada dashboard penguji berbasis `is_break` (Fase Break Global), bukan penanda stase. |
| 3 | [SessionDetailPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/SessionDetailPage.jsx) | Line 131-134 | Ringkasan kartu menampilkan subtext `"15m stase • 3m break"` pada Stase Ujian. | Perjelas bahwa **3m break** adalah **Waktu Jeda Rotasi Antar-Ronde**, bukan bagian dari durasi fisik stase. |
| 4 | [LiveMonitorPage.jsx](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/LiveMonitorPage.jsx) | Line 257-258 & Matriks | Matriks perputaran peserta & status ronde sempat menganggap break sebagai stase terpisah. | *(Sebagian telah diperbaiki)*. Pastikan matriks perputaran peserta murni menampilkan perputaran Stase 1 - Stase 6 pada tiap Ronde Ujian. |

---

## 🛠️ 3. Rencana Aksi Perbaikan (Action Plan)

### 1. Standardisasi Data Model Sesi Ujian (`SessionModel`)
- `total_stations`: Murni menyatakan **jumlah stase ujian fisik** (misal: 6 stase).
- `station_duration_minutes`: Waktu pengerjaan klinis per stase (misal: 12 atau 15 menit).
- `break_duration_minutes`: Waktu jeda rotasi / istirahat antar-ronde (misal: 3 menit).
- `total_rounds`: Sama dengan `total_stations` (misal: 6 ronde untuk 6 peserta pada 6 stase).

### 2. Pembersihan Berkas Data Dummy & Mock (`mockAdminData.js`)
- Mengubah seluruh mock data `total_stations` dari 8 menjadi **6**.
- Menghapus objek stase dummy bertipe `is_break: true` dari `MOCK_STAGES_BY_SESSION`.

### 3. Pembaruan Dokumen Acuan Ujian (`OSCE.md`, `ADMIN.md`, `RAPAT001.md`)
- Mengubah penjelasan arsitektur ujian dari *"6 Stase + 2 Break"* menjadi **"6 Stase Ujian Aktif dengan Timer Jeda Rotasi / Istirahat Antar-Ronde"**.

---

## 📌 Kesimpulan
Dengan perbaikan pada berkas-berkas di atas, arsitektur MedSkill OSCE akan **100% konsisten**, di mana Istirahat diperlakukan secara tepat sebagai **Waktu Jeda Rotasi (Break Duration / Break Phase)**, bukan sebagai stase tiruan.
