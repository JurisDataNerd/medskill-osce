-- =================================================================
-- 020: TAMBAH KOLOM DOKTER PENGUJI PADA TABEL STATIONS & FLEXIBLE EXAMINERS
-- Memastikan penugasan dokter penguji stase tersimpan baik di osce.stations
-- maupun osce.session_examiners.
-- =================================================================

-- 1. Tambahkan kolom dokter penguji di osce.stations jika belum ada
ALTER TABLE osce.stations
    ADD COLUMN IF NOT EXISTS assigned_examiner TEXT,
    ADD COLUMN IF NOT EXISTS examiner_name     TEXT,
    ADD COLUMN IF NOT EXISTS examiner_specialty TEXT,
    ADD COLUMN IF NOT EXISTS examiner_user_id  UUID;

-- 2. Buat user_id di osce.session_examiners menjadi NULLABLE agar penugasan dokter tanpa user account/profiles ID tetap tersimpan
ALTER TABLE osce.session_examiners
    ALTER COLUMN user_id DROP NOT NULL;

COMMENT ON COLUMN osce.stations.assigned_examiner IS 'Nama lengkap dokter penguji stase yang ditugaskan';
COMMENT ON COLUMN osce.stations.examiner_specialty IS 'Spesialisasi dokter penguji stase';
