# 🎨 Aturan Penulisan UI & standar UX (UX Rules) - MedSkill Praxis

Dokumen ini berisi panduan dan standar UX/UI Copywriting yang wajib diterapkan di seluruh komponen dan halaman proyek MedSkill Praxis.

---

## 1. ✍️ Prinsip Penulisan & Copywriting Form

### A. Ringkas, Jelas, & Tidak Bertele-tele
- Gunakan frasa yang langsung pada intinya (direct to the point).
- Hindari kalimat penjelasan yang berulang atau terlalu panjang pada header form dan label.
- **Contoh:**
  - ❌ `Pengaturan Profil & Data Diri` ➔ ✅ `Pengaturan Profil`
  - ❌ `Perbarui nama lengkap, foto avatar, serta kredensial institusi Anda.` ➔ ✅ `Perbarui informasi profil Anda.`

### B. Bebas Garis Miring (`/`) pada Label Form
- Gunakan satu nama label utama yang paling presisi. Hindari menggabungkan dua opsi kata dengan garis miring.
- **Contoh:**
  - ❌ `Spesialisasi / Program Studi` ➔ ✅ `Program Studi`
  - ❌ `Institusi / Universitas` ➔ ✅ `Institusi`
  - ❌ `Nomor Telepon / WhatsApp` ➔ ✅ `Nomor Telepon`
  - ❌ `Bio / Catatan Informasi Pengguna` ➔ ✅ `Bio`

### C. Bebas Tanda Kurung (`()`) pada Label
- Jangan masukkan keterangan tambahan dalam tanda kurung pada label input. Keterangan teknis cukup ditarik ke placeholder atau subtext jika memang diperlukan.
- **Contoh:**
  - ❌ `Alamat Email (Akun Auth)` ➔ ✅ `Email`
  - ❌ `Nomor Induk Mahasiswa (NIM)` ➔ ✅ `NIM`
  - ❌ `Simpan Perubahan (Profile)` ➔ ✅ `Simpan Perubahan`

---

## 2. 🔘 Standar Tombol & Aksi (CTA)

### A. Single Primary Save Button
- Setiap form hanya boleh memiliki **1 Tombol Utama (Primary CTA)** di bagian paling bawah form.
- Jangan menduplikasi tombol simpan di bagian atas header form agar tidak membingungkan pengguna dan menjaga konsistensi visual.

### B. Teks Tombol yang Konsisten
- Gunakan kata kerja aksi yang singkat dan jelas.
- **Contoh:** `Simpan Perubahan`, `Lanjutkan`, `Batal`, `Kirim`.

---

## 3. 🛡️ Kerahasiaan & Alur Ujian Peserta (OSCE Flow Rules)

### A. Sembunyikan Judul Stase Medis dari Peserta
- Pada UI Peserta, **dilarang menampilkan nama topik/kasus medis stase** (seperti *"Kardiovaskular"*, *"STEMI Anteroseptal"*, *"Pulmonologi"*).
- Tampilkan identifikasi stase secara generik sebagai `Stase 1`, `Stase 2`, dst., agar peserta tidak dapat menebak skenario sebelum berada di dalam stase.

### B. Navigasi One-Way (Tanpa Tombol Skip/Back)
- Alur ujian peserta berjalan satu arah mengikuti rotasi sirkuit dan pewaktuan otomatis (real-time timer).
- Sembunyikan tombol skip atau navigasi bebas pada lembar ujian peserta.
