# 🗄️ Migration Scripts — Schema `osce`

Folder ini berisi keseluruhan migration SQL untuk schema `osce` di Supabase PostgreSQL.

## Cara Eksekusi

Jalankan file-file berikut **secara berurutan** di **Supabase SQL Editor** (Dashboard → SQL Editor → New Query):

```
001_schema_and_enums.sql        → Schema + ENUM types
002_sessions.sql                → Tabel sesi ujian OSCE
003_stations.sql                → Tabel pos stase / ruangan sirkuit
004_rubric_items.sql            → Tabel rubrik penilaian + deskriptor + kompetensi
005_auxiliary_exam.sql           → Katalog penunjang + konfigurasi per stase
006_question_bank.sql            → Bank soal + sub-tabel relasional
007_participants_examiners.sql   → Peserta & penguji per sesi
008_rotation_and_timer.sql       → State rotasi live + timer server-side
009_participant_answers.sql      → Lembar jawaban peserta (4-halaman)
010_examiner_evaluations.sql     → Penilaian penguji (GRS + skor rubrik)
011_audit_logs.sql               → Audit trail imutabel + trigger otomatis
012_broadcast_messages.sql       → Pesan broadcast admin → peserta/penguji
013_standard_setting.sql         → Hasil kalkulasi NBL/BRM + materialized view
014_indexes.sql                  → Indeks performa query
015_rls_policies.sql             → Row Level Security policies (granular)
016_realtime_publication.sql     → Supabase Realtime subscription
017_kiosk_tokens.sql             → (Opsional) Token kiosk mode per stase
```

## Catatan Penting

- Semua tabel berada di **schema `osce`** (terpisah dari `public`).
- Pastikan tabel `public.profiles` sudah ada sebelum menjalankan migrasi (digunakan sebagai FK reference).
- Setiap file bersifat **idempotent** (`IF NOT EXISTS` / `DO $$ ... EXCEPTION`).
- Untuk rollback, drop seluruh schema: `DROP SCHEMA osce CASCADE;` (⚠️ DESTRUCTIVE).
