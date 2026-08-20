# 📋 Rangkuman Perbaikan UX & Copywriting (NEED_FIX.md)

Dokumen ini berisi daftar inventarisasi seluruh kata, label form, tombol (CTA), dan deskripsi UI di proyek **MedSkill Praxis** yang masih **bertele-tele**, menggunakan **tanda kurung `()`**, **garis miring `/`**, atau **membocorkan informasi rahasia stase**, yang perlu disesuaikan berdasarkan panduan [rule_ux.md](file:///c:/KAIRAV/project/2026/medskill/praxis/rule_ux.md).

---

## 📌 Ringkasan Prinsip UX Rules ([rule_ux.md](file:///c:/KAIRAV/project/2026/medskill/praxis/rule_ux.md))

1. **Direct & Simple:** Gunakan frasa langsung pada intinya. Hindari kalimat penjelasan yang berulang/panjang pada header dan label.
2. **Bebas Garis Miring (`/`):** Pilih 1 nama label utama yang paling presisi (misal: `Institusi / Universitas` ➔ `Institusi`).
3. **Bebas Tanda Kurung (`()`):** Keterangan tambahan atau istilah teknis tidak perlu dimasukkan ke dalam tanda kurung pada label.
4. **Single Primary Save Button:** Hanya 1 tombol simpan utama di bagian paling bawah form.
5. **Kerahasiaan Topik Stase Peserta:** Sembunyikan judul topik medis (misal: *STEMI*) dari UI Peserta; tampilkan secara generik sebagai `Stase 1`, `Stase 2`.

---

## 🛑 1. Label Form dengan Garis Miring (`/`) & Tanda Kurung (`()`)

| Lokasi File | Teks Lama (Perlu Diperbaiki) | Teks Rekomendasi (Simple & Clear) | Catatan Perbaikan |
|---|---|---|---|
| [`ParticipantSessionPage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/participant/pages/ParticipantSessionPage.jsx#L2178) | `1. Diagnosis Banding (Differential Diagnosis / DDx)` | `1. Diagnosis Banding` | Hapus tanda kurung, istilah bahasa inggris & `/ DDx` |
| [`ParticipantSessionPage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/participant/pages/ParticipantSessionPage.jsx#L2192) | `2. Diagnosis Kerja (Working Diagnosis Utama / WDx)` | `2. Diagnosis Kerja` | Hapus tanda kurung & `/ WDx` |
| [`ParticipantSessionPage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/participant/pages/ParticipantSessionPage.jsx#L2206) | `3. Lembar Penulisan Resep Obat (Prescription Sheet)` | `3. Penulisan Resep Obat` | Hapus tanda kurung `(Prescription Sheet)` |
| [`FeedbackPage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/examiner/pages/FeedbackPage.jsx#L137) | `Diagnosis (WDx & DDx)` | `Diagnosis` | Hapus tanda kurung `(WDx & DDx)` |
| [`UserProfilePage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/profile/pages/UserProfilePage.jsx) | `Informasi Profil / Data Diri` | `Informasi Profil` | Bebas garis miring `/` |
| [`UserProfilePage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/profile/pages/UserProfilePage.jsx) | `Spesialisasi / Program Studi` | `Program Studi` | Gunakan 1 istilah paling presisi |
| [`UserProfilePage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/profile/pages/UserProfilePage.jsx) | `Institusi / Universitas` | `Institusi` | Bebas garis miring `/` |
| [`UserProfilePage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/profile/pages/UserProfilePage.jsx) | `Nomor Telepon / WhatsApp` | `Nomor Telepon` | Bebas garis miring `/` |
| [`ExaminerStagePage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/examiner/pages/ExaminerStagePage.jsx#L1237) | `NIM / ID` | `NIM` | Bebas garis miring `/` |
| [`ExaminerStagePage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/examiner/pages/ExaminerStagePage.jsx#L1131) | `Durasi / Pos Stase` | `Durasi Stase` | Bebas garis miring `/` |
| [`AuxiliaryExamResultModal.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/components/AuxiliaryExamResultModal.jsx#L223) | `Laporan Ekspertise Radiologi / Lab:` | `Laporan Ekspertise` | Bebas garis miring `/` |
| [`SessionRegistrationModal.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/components/landing/SessionRegistrationModal.jsx#L133) | `Institusi / Fakultas:` | `Institusi:` | Bebas garis miring `/` |

---

## 🔘 2. Teks Tombol Aksi (CTA) & Istilah Teknis Backend

| Lokasi File | Teks Tombol Lama (Perlu Diperbaiki) | Teks Tombol Rekomendasi (Ringkas) | Catatan Perbaikan |
|---|---|---|---|
| [`ExaminerStagePage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/examiner/pages/ExaminerStagePage.jsx#L1522) | `Submit & Kunci Penilaian (Supabase)` | `Simpan Penilaian` | Sembunyikan istilah teknis backend `(Supabase)` |
| [`ParticipantSessionPage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/participant/pages/ParticipantSessionPage.jsx#L2278) | `Batal / Periksa Kembali` | `Batal` | Fokus pada kata kerja aksi tunggal |
| [`AuxiliaryExamResultModal.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/components/AuxiliaryExamResultModal.jsx#L244) | `Kembali / Tutup Berkas` | `Tutup Berkas` | Bebas garis miring `/` |
| [`ConfirmModal.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/components/ConfirmModal.jsx#L113) | `Mengerti / Tutup` | `Mengerti` | Singkat & presisi |
| [`MediaEmbedViewer.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/components/MediaEmbedViewer.jsx#L95) | `Buka di Tab Baru / Drive` | `Buka di Tab Baru` | Bebas garis miring `/` |
| [`ParticipantSessionPage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/participant/pages/ParticipantSessionPage.jsx#L1419) | `Lanjut Masuk Ronde 2 (Kardiovaskular STEMI)` | `Lanjut Masuk Ronde 2` | Sembunyikan judul topik medis stase dari peserta |
| [`SessionParticipantsPage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/admin/pages/SessionParticipantsPage.jsx#L210) | `Setujui Semua Pending (5)` | `Setujui Semua` | Ringkas tanpa angka berulang dalam kurung |

---

## 🔒 3. Kerahasiaan Topik Medis Stase pada UI Peserta (Aturan 3.A)

| Lokasi Komponen | Teks Lama (Membocorkan Rahasia Kasus) | Teks Rekomendasi (Generik & Aman) |
|---|---|---|
| **Halaman Transisi Peserta** | `Stase 2 (Kardiovaskular - STEMI)` | `Stase 2` |
| **Badge Header Peserta** | `Ronde 1: Kardiovaskular` | `Ronde 1: Stase 1` |
| **Modal Konfirmasi Peserta** | `Apakah Anda yakin ingin menyelesaikan Stase Anamnesis STEMI?` | `Apakah Anda yakin ingin menyelesaikan stase ini?` |

---

## 📝 4. Kalimat Penjelasan UI yang Bertele-tele (Header & Subtext)

| Lokasi File | Kalimat Lama (Bertele-tele) | Kalimat Rekomendasi (Simple & Clear) |
|---|---|---|
| [`ParticipantSessionPage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/participant/pages/ParticipantSessionPage.jsx#L2169) | `Isi formulir diagnosis dan resep obat di bawah ini sebagai lembar jawaban final stase.` | `Isi lembar jawaban diagnosis dan resep obat di bawah ini.` |
| [`ParticipantSessionPage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/participant/pages/ParticipantSessionPage.jsx#L1974) | `Sampaikan permintaan pemeriksaan atau pertanyaan hasil temuan fisik secara lisan langsung kepada Pasien Standar / Penguji di ruangan.` | `Sampaikan permintaan pemeriksaan fisik kepada Pasien Standar di ruangan.` |
| [`ExaminerStagePage.jsx`](file:///c:/KAIRAV/project/2026/medskill/praxis/frontend/src/features/examiner/pages/ExaminerStagePage.jsx#L1731) | `Belum ada berkas penunjang yang diminta oleh peserta pada stase ini.` | `Belum ada berkas penunjang yang dibuka.` |

---

## 🛠️ Checklist Action Items (Status Perbaikan Selesai)

- [x] **Langkah 1:** Perbarui label form diagnosis di `ParticipantSessionPage.jsx` & `FeedbackPage.jsx` agar bebas dari `()`, `/`, dan kata-kata bertele-tele.
- [x] **Langkah 2:** Sembunyikan judul topik medis stase pada seluruh UI Peserta (ganti dengan `Stase N` generik).
- [x] **Langkah 3:** Bersihkan istilah teknis backend (`Supabase`, `Akun Auth`) dari tombol UI Penguji dan Peserta.
- [x] **Langkah 4:** Ringkaskan kalimat deskripsi header pada form profil, login, dan dashboard admin.
- [x] **Langkah 5:** Verifikasi seluruh form agar menggunakan 1 Tombol Simpan Utama (Single Primary CTA).
