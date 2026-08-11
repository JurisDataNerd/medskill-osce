-- =================================================================
-- 021: ALLOW PARTICIPANT REGISTRATION RLS POLICIES & STATIONS ACCESS
-- Memberikan izin INSERT dan UPDATE bagi user terotentikasi ke osce.session_participants,
-- serta izin SELECT penuh pada stations, rubric_items, dan session_examiners.
-- =================================================================

-- 1. Tambahkan kolom email jika belum ada
ALTER TABLE osce.session_participants ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Drop existing policies jika ada
DROP POLICY IF EXISTS "participant_own_insert" ON osce.session_participants;
DROP POLICY IF EXISTS "participant_own_update" ON osce.session_participants;
DROP POLICY IF EXISTS "authenticated_stations_read" ON osce.stations;
DROP POLICY IF EXISTS "authenticated_rubric_items_read" ON osce.rubric_items;
DROP POLICY IF EXISTS "authenticated_session_examiners_read" ON osce.session_examiners;

-- 3. Izinkan peserta terotentikasi mendaftar (INSERT) untuk akun sendiri
CREATE POLICY "participant_own_insert" ON osce.session_participants
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- 4. Izinkan peserta terotentikasi memperbarui (UPDATE) record miliknya sendiri
CREATE POLICY "participant_own_update" ON osce.session_participants
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- 5. Izinkan seluruh authenticated user membaca stations, rubric_items, dan session_examiners
CREATE POLICY "authenticated_stations_read" ON osce.stations
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "authenticated_rubric_items_read" ON osce.rubric_items
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "authenticated_session_examiners_read" ON osce.session_examiners
    FOR SELECT TO authenticated
    USING (true);
