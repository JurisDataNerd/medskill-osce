# Praxis by MedSkill — OSCE Platform

Sistem Manajemen Ujian **OSCE (Objective Structured Clinical Examination)** berbasis web terstandarisasi untuk mengelola seluruh siklus ujian klinis kedokteran: mulai dari registrasi peserta, pelaksanaan sirkuit 6 stase aktif, penilaian objektif penguji, hingga publikasi hasil dan pengiriman email otomatis.

---

## 🎯 Fitur Utama & Keunggulan

- **Sirkuit 6 Stase Ujian Aktif**: Rotasi 6 stase keterampilan medis dengan timer terstruktur 12 menit per stase (1m Reading, 10m Action, 1m Transition).
- **Multi-Halaman Kiosk Peserta**: Flow 4 halaman berurutan (Anamnesis $\rightarrow$ Fisik $\rightarrow$ Penunjang Kondisional $\rightarrow$ Diagnosis & Resep) dengan navigasi 1-arah (*No Back Button*).
- **Side-by-Side Examiner View**: Dokter penguji menilai peserta secara realtime berdampingan dengan **Kunci Jawaban Baku Admin (Gold Standard)**.
- **Master Control Room & Timer Sync**: Kontrol timer server-side berbasis *Future Timestamp Pattern*, Web Audio Bell Synthesizer (Chime, Warning, Siren), dan Broadcast Emergency.
- **Standar Penilaian AIPKI & NBL**: Penilaian Rubrik 0-3 SKDI terbobot, Global Performance Rating (GRS), dan kalkulasi otomatis Nilai Batas Lulus (NBL) metode *Borderline Regression*.
- **Diisolasi di Schema Supabase `osce`**: Isolasi 19 tabel schema `osce` dengan RLS granular dan audit trail imutabel.

---

## 📚 Struktur Dokumentasi Master

Dokumentasi proyek terkelola secara padat dan terstruktur dalam 3 berkas utama:

1. 📘 **[OSCE-SPEC.md](file:///c:/KAIRAV/project/2026/medskill/praxis/OSCE-SPEC.md)** — Spesifikasi Sistem, Aturan Operasional Sirkuit 6 Stase, Alur Peran (Admin, Penguji, Peserta), Penilaian SKDI/GRS/NBL, & Live Control Room.
2. 🗄️ **[DATABASE-SPEC.md](file:///c:/KAIRAV/project/2026/medskill/praxis/DATABASE-SPEC.md)** — Single Source of Truth Schema `osce` Supabase (19 Tabel, DDL SQL, Enum, RLS Policies, Audit Triggers, & Realtime Timer Sync).
3. 🎯 **[PLAN-OSCE.md](file:///c:/KAIRAV/project/2026/medskill/praxis/PLAN-OSCE.md)** — Master Implementation Roadmap & Checklist Progress TODO Integrasi Live Database.

---

## 🛠️ Stack Teknologi

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Web Audio API.
- **Backend / Database**: Supabase PostgreSQL (Schema `osce`), Supabase Auth, Supabase Storage, Supabase Realtime Channels.
- **Standard Setting**: Borderline Regression Method (BRM) & AIPKI Rubric Standard.

---

## 🚀 Memulai Aplikasi (Quick Start)

```bash
# Clean install dependensi frontend
cd frontend
npm install

# Jalankan server pengembangan lokal
npm run dev

# Build produksi
npm run build
```
