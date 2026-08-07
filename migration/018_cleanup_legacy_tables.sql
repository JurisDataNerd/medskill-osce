-- =================================================================
-- 018: CLEANUP TABEL LAMA DI SCHEMA `osce`
-- Menghapus tabel-tabel lama yang sudah dipindahkan dari
-- public.osce_* ke osce.* (struktur lama, akan diganti baru).
--
-- ⏱️  URUTAN EKSEKUSI: Jalankan SETELAH 001 dan SEBELUM 002.
--     001 → 018 → 002 → 003 → ... → 017
--
-- ⚠️  PERINGATAN: Script ini DESTRUCTIF.
--     Backup data jika diperlukan sebelum menjalankan.
-- =================================================================

-- Tabel lama di schema osce (dipindahkan dari public.osce_*):
--
--   public.osce_scores         → osce.scores
--   public.osce_answers        → osce.answers
--   public.osce_session_members→ osce.session_members
--   public.osce_case_items     → osce.case_items
--   public.osce_case_sections  → osce.case_sections
--   public.osce_cases          → osce.cases
--   public.osce_stage_questions→ osce.stage_questions
--   public.osce_stages         → osce.stages
--   public.osce_sessions       → osce.sessions

-- =================================================================
-- DROP tabel lama (urutan: child tables dulu)
-- =================================================================

-- 1. Skor (child)
DROP TABLE IF EXISTS osce.scores CASCADE;

-- 2. Jawaban (child)
DROP TABLE IF EXISTS osce.answers CASCADE;

-- 3. Member Sesi (child)
DROP TABLE IF EXISTS osce.session_members CASCADE;

-- 4. Item Kasus (child dari case_sections)
DROP TABLE IF EXISTS osce.case_items CASCADE;

-- 5. Section Kasus (child dari cases)
DROP TABLE IF EXISTS osce.case_sections CASCADE;

-- 6. Kasus Master
DROP TABLE IF EXISTS osce.cases CASCADE;

-- 7. Pertanyaan Stase (child dari stages)
DROP TABLE IF EXISTS osce.stage_questions CASCADE;

-- 8. Stase (child dari sessions)
DROP TABLE IF EXISTS osce.stages CASCADE;

-- 9. Sesi Utama (parent table)
DROP TABLE IF EXISTS osce.sessions CASCADE;

-- =================================================================
-- VERIFIKASI: Pastikan schema osce kosong (siap untuk migration 002+)
-- =================================================================
-- Jalankan query berikut setelah cleanup:
--
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'osce'
-- ORDER BY table_name;
--
-- Hasil seharusnya: 0 rows (kosong, siap diisi tabel baru)
-- =================================================================
