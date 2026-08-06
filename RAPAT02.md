# Catatan Hasil Rapat 2 - Sistem Simulasi OSCE Praxis Medskill

Dokumen ini berisi rangkuman kebutuhan, alur simulasi, serta poin tambahan fitur dari Hasil Rapat 2 untuk pengembang sistem simulasi OSCE.

---

## 1. Alur & Kebutuhan Admin

- **Manajemen Kasus & Peserta**:
  - Memasukkan data kasus/stase.
  - Memasukkan urutan/mapping peserta per kasus.
- **Kontrol Sesi Live**:
  - Memulai simulasi (*Start Session*) dan menghentikan simulasi (*Stop Session*).
- **Pengaturan Timer Per Stase**:
  - *Reading Time*: 1 Menit
  - *Action Time*: 10 Menit
  - *Transition Time*: 1 Menit
  - **TOTAL DURASI PER STASE**: 12 Menit / Station.
- **Templat / Paket Soal (Duplikasi Stase)**:
  - Kemampuan menyimpan stase agar bisa diduplikasi (contoh: Paket Soal A, Paket Soal B).
- **Pemeriksaan Penunjang**:
  - Menambahkan data hasil pemeriksaan penunjang per stase serta mengatur mana hasil yang dapat keluar berdasarkan kunci jawaban.
- **Sistem Antrean/Urutan Peserta**:
  - Menyimpan data nama peserta. Urutan peserta dapat berjalan otomatis ATAU peserta memilih namanya sendiri di layar awal.

---

## 2. Alur Simulasi Peserta (Student Flow)

- **Akses & Login**:
  - Login Akun Peserta / Penguji.
  - Setting pilihan station di awal oleh Tim Medskill (cukup sekali di awal).
  - **Loading / Waiting Page**: Peserta berada di halaman ini (*stay in page*) sebelum dimulainya simulasi oleh Admin.
- **Alur Pengerjaan Ujian**:
  1. **Start** → **Blangko Anamnesis & Pemeriksaan Fisik** → Klik *"Next"*.
  2. **Blangko Checklist Pemeriksaan Penunjang** → Klik *"Next"*.
     - **Aturan Hasil Penunjang**:
       - *Ceklist Penunjang Benar* → Muncul nilai/berkas hasil penunjang.
       - *Ceklist Penunjang Tidak Dicentang* → Tidak muncul nilai/hasil.
       - *Ceklist Penunjang Salah* → Muncul keterangan *"Tidak ada data"*.
  3. **Blangko Diagnosis & Resep**:
     - **Diagnosis Kerja**: 1 Baris input diagnosis kerja.
     - **Diagnosis Banding**: 3 Baris input diagnosis banding.
     - **Penulisan Resep**: Blangko kosong *long text* (textarea) untuk penulisan resep medis.
  4. **Submit & Perputaran Peserta**:
     - Klik tombol *"Submit"*.
     - Sesi berlanjut ke peserta baru berikutnya sampai peserta terakhir.
     - **FINISH**.

---

## 3. Alur Penguji (Examiner Flow)

- **Pemilihan Stase**:
  - Dokter penguji mengambil/memilih 1 *"Station"* tempat bertugas.
- **Halaman Rekap Peserta**:
  - Menampilkan data rekap awal Peserta 1.
  - Data ber-update otomatis saat peserta menekan *"Next"* section atau *"Submit"*.
  - Tombol *"Next"* atau *"Back"* untuk melihat rekapan peserta lain.
- **Halaman Penilaian**:
  - Form checklist penilaian & rubrik.
  - Kolom masukan / *feedback* penguji.
  - Klik *"Submit"* → otomatis lanjut ke penilaian peserta selanjutnya sampai peserta terakhir.
  - **FINISH / SELESAI**.

---

## 4. Pelaporan & Output Rekapitulasi

- **Laporan PDF**:
  - Hasil nilai & feedback masing-masing stase terekap per peserta dalam bentuk **PDF**.
- **Pengiriman Umpan Balik**:
  - Rekap hasil & feedback otomatis dikirimkan ke **Email** masing-masing peserta setelah sesi berakhir.

---

## 5. Poin Tambahan Fitur Website

- **Autentikasi**:
  - Menambahkan fitur **Lupa Password / Forget Password**.
- **Pengaturan Timer OSCE Admin**:
  - Reading time: 1 min, Action time: 10 min, Transition: 1 min. Total: 12 min/station.
- **Manajemen Paket Soal & Penunjang**:
  - Fitur simpan/duplikasi stase (Paket Soal A/B) & pengelolaan aturan rilis hasil penunjang.
- **Peserta UI**:
  - 1 Baris Diagnosis Kerja, 3 Baris Diagnosis Banding, dan Textarea Blangko Kosong untuk Penulisan Resep.
