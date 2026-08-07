-- =================================================================
-- 016: SUPABASE REALTIME PUBLICATION
-- Mendaftarkan tabel-tabel yang perlu di-subscribe secara realtime.
-- =================================================================

-- ---------------------------------------------------------------
-- Tabel yang perlu realtime subscription:
-- 1. sessions         → Status sesi (start/stop/pause)
-- 2. session_timer_state → Timer sync (future timestamp pattern)
-- 3. rotation_states   → Matriks rotasi live
-- 4. participant_answers → Progres step peserta (PAGE_1→4)
-- 5. examiner_evaluations → Notifikasi skor dikunci
-- 6. broadcast_messages → Pesan broadcast admin
-- ---------------------------------------------------------------

-- Cek apakah publication sudah ada, jika belum buat baru
-- Supabase secara default memiliki publication 'supabase_realtime'
-- Kita hanya perlu menambahkan tabel ke dalamnya

ALTER PUBLICATION supabase_realtime ADD TABLE osce.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE osce.session_timer_state;
ALTER PUBLICATION supabase_realtime ADD TABLE osce.rotation_states;
ALTER PUBLICATION supabase_realtime ADD TABLE osce.participant_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE osce.examiner_evaluations;
ALTER PUBLICATION supabase_realtime ADD TABLE osce.broadcast_messages;
