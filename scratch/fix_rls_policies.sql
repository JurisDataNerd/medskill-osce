-- =================================================================
-- FIX RLS POLICIES FOR QUESTION BANK & OSCE TABLES
-- Grants SELECT and ALL permissions to anon and authenticated roles
-- so web application clients can access osce schema without RLS blocks.
-- =================================================================

-- 1. QUESTION BANK
ALTER TABLE osce.question_bank ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "question_bank_all_policy" ON osce.question_bank;
CREATE POLICY "question_bank_all_policy" ON osce.question_bank
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 2. QUESTION BANK RUBRIC ITEMS
ALTER TABLE osce.question_bank_rubric_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "question_bank_rubric_items_all_policy" ON osce.question_bank_rubric_items;
CREATE POLICY "question_bank_rubric_items_all_policy" ON osce.question_bank_rubric_items
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 3. QUESTION BANK AUXILIARY CONFIGS
ALTER TABLE osce.question_bank_auxiliary_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "question_bank_aux_configs_all_policy" ON osce.question_bank_auxiliary_configs;
CREATE POLICY "question_bank_aux_configs_all_policy" ON osce.question_bank_auxiliary_configs
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 4. SESSIONS
ALTER TABLE osce.sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sessions_all_policy" ON osce.sessions;
CREATE POLICY "sessions_all_policy" ON osce.sessions
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 5. STATIONS
ALTER TABLE osce.stations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stations_all_policy" ON osce.stations;
CREATE POLICY "stations_all_policy" ON osce.stations
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. RUBRIC ITEMS
ALTER TABLE osce.rubric_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rubric_items_all_policy" ON osce.rubric_items;
CREATE POLICY "rubric_items_all_policy" ON osce.rubric_items
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 7. STATION AUXILIARY CONFIGS
ALTER TABLE osce.station_auxiliary_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "station_auxiliary_configs_all_policy" ON osce.station_auxiliary_configs;
CREATE POLICY "station_auxiliary_configs_all_policy" ON osce.station_auxiliary_configs
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 8. SESSION PARTICIPANTS
ALTER TABLE osce.session_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "session_participants_all_policy" ON osce.session_participants;
CREATE POLICY "session_participants_all_policy" ON osce.session_participants
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 9. SESSION EXAMINERS
ALTER TABLE osce.session_examiners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "session_examiners_all_policy" ON osce.session_examiners;
CREATE POLICY "session_examiners_all_policy" ON osce.session_examiners
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 10. ROTATION STATES & TIMER
ALTER TABLE osce.rotation_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rotation_states_all_policy" ON osce.rotation_states;
CREATE POLICY "rotation_states_all_policy" ON osce.rotation_states
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

ALTER TABLE osce.session_timer_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "session_timer_state_all_policy" ON osce.session_timer_state;
CREATE POLICY "session_timer_state_all_policy" ON osce.session_timer_state
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- =================================================================
-- VERIFIKASI: Tampilkan daftar policy yang aktif di schema osce
-- =================================================================
SELECT tablename, policyname, roles FROM pg_policies WHERE schemaname = 'osce';
