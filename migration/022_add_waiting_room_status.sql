-- =================================================================
-- 022: TAMBAH STATUS 'waiting_room' KE ENUM session_status
-- Mendukung alur mirip Zoom: Admin buka Waiting Room → peserta join → Admin mulai ujian
-- =================================================================

-- Tambahkan value 'waiting_room' ke enum osce.session_status
-- Posisi: setelah 'scheduled', sebelum 'ongoing'
ALTER TYPE osce.session_status ADD VALUE IF NOT EXISTS 'waiting_room' AFTER 'scheduled';
