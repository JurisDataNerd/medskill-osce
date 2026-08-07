# 📝 Notulensi Rapat & Spesifikasi Fitur System OSCE (RAPAT001)
**Praxis by MedSkill Indonesia**  
*Tanggal Rapat: 4 Agustus 2026*

---

## 📑 Agenda & Hasil Keputusan Rapat

### 1. Logika & Tampilan Gambar Pemeriksaan Penunjang (Auxiliary Diagnostic Test)
* **Kondisional Gambar dari Admin**:
  * Gambar/berkas hasil (seperti Foto Thorax, EKG strip, atau Lembar Lab) bersifat **kondisional**.
  * Admin berhak menentukan apakah suatu jawaban pemeriksaan penunjang dilengkapi file gambar/data atau hanya teks/tanpa gambar saat membuat soal stase.
* **Dinamika Jawaban Peserta & Tampilan Output**:
  * **Jika peserta memilih jawaban BENAR** dan Admin telah mengunggah/eset gambar pada opsi tersebut $\rightarrow$ Gambar hasil (X-Ray / EKG / Lab) akan **muncul pada Modal Hasil**.
  * **Jika peserta memilih jawaban SALAH** (atau pemeriksaan yang tidak diindikasikan/tidak ada data dari admin) $\rightarrow$ Tampilan pada Modal Hasil akan menampilkan status **"No Data"** / *"Hasil Tidak Tersedia / Pemeriksaan Tidak Diindikasikan"*.

---

### 2. Form Diagnosis Banding, Diagnosis Kerja, & Penulisan Resep
* **Form Diagnosis Banding (Differential Diagnosis / DDx) & Diagnosis Kerja (Working Diagnosis / WDx)**:
  * Peserta mengisi form input teks / textarea pada layar stase ujian.
  * **Sisi Dokter Penguji**: Dokter Penguji dapat melihat hasil isian form peserta secara *real-time* dan diberikan **Tampilan Kunci Jawaban Baku (Gold Standard Answer Key)** sebagai acuan/referensi resmi saat memberikan penilaian skor rubrik.
* **Form Penulisan Resep Obat (Prescription / Recipe Form)**:
  * Memiliki alur yang sama dengan Form Diagnosis. Peserta menuliskan resep obat (R/, Signa, Dosis), dan Dokter Penguji melihat isian peserta berdampingan dengan Kunci Jawaban Resep Baku dari Admin.

---

### 3. Struktur Rotasi Stase: 6 Stase Aktif + 2 Stase Break (Total 8 Stase)
* **Arsitektur Sesi OSCE**:
  * 1 Sesi Ujian OSCE terdiri dari total **6 Stase Keterampilan Medis Aktif** yang wajib diikuti oleh setiap peserta secara berurutan dalam sirkuit dengan timer jeda rotasi/istirahat antar-ronde.

---

### 4. Manajemen Kanban Urutan Stase (Admin Dynamic Order)
* **Kanban Drag & Drop Management**:
  * Admin dapat mengatur dan mengubah urutan posisi stase ujian medis secara dinamis menggunakan antarmuka **Kanban Board** pada Dashboard Admin.

---

## 🔄 Rekapitulasi Penyesuaian Dokumen Utama (`OSCE.md` & `README.md`)

| Dokumen | Bagian / Komponen | Penyesuaian / Perubahan yang Diperlukan |
| :--- | :--- | :--- |
| **`OSCE.md`** | Section 1 & Section 6 | Memperbarui arsitektur sirkuit menjadi **6 Stase Keterampilan Medis Aktif** dengan timer jeda rotasi/istirahat antar-ronde. |
| **`OSCE.md`** | Section 2.C (Live Exam) | Menambahkan aturan pengisian **Form Diagnosis (DDx/WDx)**, **Form Penulisan Resep**, dan **Logika Pemeriksaan Penunjang (Kondisional Gambar / No Data)**. |
| **`OSCE.md`** | Section 3.B (Examiner) | Menambahkan fitur **Acuan Kunci Jawaban Baku (Reference Answer Key)** pada Dashboard Penguji untuk Form Diagnosis & Resep Peserta. |
| **`OSCE.md`** | Section 4.A (Admin) | Menambahkan fitur **Kanban Drag & Drop Urutan Stase**. |
| **`README.md`** | Role Admin & Penguji & Peserta | Memperbarui deskripsi fitur Admin (Kanban Urutan Stase), Penguji (Kunci Jawaban Acuan), Peserta (Form Diagnosis/Resep & Modal Penunjang), dan siklus rolling 6 stase. |
