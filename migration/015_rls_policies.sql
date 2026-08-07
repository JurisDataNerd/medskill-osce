-- =================================================================
-- 015: ROW LEVEL SECURITY (RLS) POLICIES
-- Kebijakan keamanan granular per role (admin, examiner, participant).
-- Deny-by-default: RLS diaktifkan → tanpa policy = akses ditolak.
-- =================================================================

-- ---------------------------------------------------------------
-- Helper Function: Ambil role user dari public.profiles
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION osce.fn_get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------------
-- Helper Function: Cek apakah user adalah admin
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION osce.fn_is_admin()
RETURNS BOOLEAN AS $$
    SELECT COALESCE(
        (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
        FALSE
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- =================================================================
-- SESSIONS
-- =================================================================
ALTER TABLE osce.sessions ENABLE ROW LEVEL SECURITY;

-- Admin: Full access
CREATE POLICY "admin_sessions_all" ON osce.sessions
    FOR ALL TO authenticated
    USING (osce.fn_is_admin());

-- Non-admin: Read only
CREATE POLICY "authenticated_sessions_read" ON osce.sessions
    FOR SELECT TO authenticated
    USING (true);


-- =================================================================
-- STATIONS
-- =================================================================
ALTER TABLE osce.stations ENABLE ROW LEVEL SECURITY;

-- Admin: Full access
CREATE POLICY "admin_stations_all" ON osce.stations
    FOR ALL TO authenticated
    USING (osce.fn_is_admin());

-- Penguji: Read stase yang ditugaskan
CREATE POLICY "examiner_stations_read" ON osce.stations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM osce.session_examiners se
            WHERE se.user_id = auth.uid()
              AND se.session_id = stations.session_id
              AND se.assigned_station_number = stations.station_number
        )
    );

-- Peserta: Read stase pada sesi yang diikuti
CREATE POLICY "participant_stations_read" ON osce.stations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM osce.session_participants sp
            WHERE sp.user_id = auth.uid()
              AND sp.session_id = stations.session_id
        )
    );


-- =================================================================
-- RUBRIC ITEMS
-- =================================================================
ALTER TABLE osce.rubric_items ENABLE ROW LEVEL SECURITY;

-- Admin: Full access
CREATE POLICY "admin_rubric_items_all" ON osce.rubric_items
    FOR ALL TO authenticated
    USING (osce.fn_is_admin());

-- Penguji: Read rubrik stase yang ditugaskan
CREATE POLICY "examiner_rubric_items_read" ON osce.rubric_items
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM osce.stations s
            JOIN osce.session_examiners se ON se.session_id = s.session_id
                AND se.assigned_station_number = s.station_number
            WHERE s.id = rubric_items.station_id
              AND se.user_id = auth.uid()
        )
    );


-- =================================================================
-- AUXILIARY EXAM CATALOG
-- =================================================================
ALTER TABLE osce.auxiliary_exam_catalog ENABLE ROW LEVEL SECURITY;

-- Semua authenticated user bisa baca katalog
CREATE POLICY "authenticated_aux_catalog_read" ON osce.auxiliary_exam_catalog
    FOR SELECT TO authenticated
    USING (true);

-- Admin: Full access
CREATE POLICY "admin_aux_catalog_all" ON osce.auxiliary_exam_catalog
    FOR ALL TO authenticated
    USING (osce.fn_is_admin());


-- =================================================================
-- STATION AUXILIARY CONFIGS
-- =================================================================
ALTER TABLE osce.station_auxiliary_configs ENABLE ROW LEVEL SECURITY;

-- Admin: Full access
CREATE POLICY "admin_aux_configs_all" ON osce.station_auxiliary_configs
    FOR ALL TO authenticated
    USING (osce.fn_is_admin());

-- Penguji & Peserta: Read pada sesi yang relevan
CREATE POLICY "authenticated_aux_configs_read" ON osce.station_auxiliary_configs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM osce.stations s
            WHERE s.id = station_auxiliary_configs.station_id
              AND (
                EXISTS (SELECT 1 FROM osce.session_participants sp WHERE sp.session_id = s.session_id AND sp.user_id = auth.uid())
                OR
                EXISTS (SELECT 1 FROM osce.session_examiners se WHERE se.session_id = s.session_id AND se.user_id = auth.uid())
              )
        )
    );


-- =================================================================
-- QUESTION BANK
-- =================================================================
ALTER TABLE osce.question_bank ENABLE ROW LEVEL SECURITY;

-- Admin: Full access
CREATE POLICY "admin_qbank_all" ON osce.question_bank
    FOR ALL TO authenticated
    USING (osce.fn_is_admin());


-- =================================================================
-- QUESTION BANK SUB-TABLES
-- =================================================================
ALTER TABLE osce.question_bank_rubric_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_qbank_rubric_all" ON osce.question_bank_rubric_items
    FOR ALL TO authenticated
    USING (osce.fn_is_admin());

ALTER TABLE osce.question_bank_auxiliary_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_qbank_aux_all" ON osce.question_bank_auxiliary_configs
    FOR ALL TO authenticated
    USING (osce.fn_is_admin());


-- =================================================================
-- SESSION PARTICIPANTS
-- =================================================================
ALTER TABLE osce.session_participants ENABLE ROW LEVEL SECURITY;

-- Admin: Full access
CREATE POLICY "admin_participants_all" ON osce.session_participants
    FOR ALL TO authenticated
    USING (osce.fn_is_admin());

-- Peserta: Read data sendiri
CREATE POLICY "participant_own_read" ON osce.session_participants
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Penguji: Read peserta pada sesi yang ditugaskan
CREATE POLICY "examiner_participants_read" ON osce.session_participants
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM osce.session_examiners se
            WHERE se.user_id = auth.uid()
              AND se.session_id = session_participants.session_id
        )
    );


-- =================================================================
-- SESSION EXAMINERS
-- =================================================================
ALTER TABLE osce.session_examiners ENABLE ROW LEVEL SECURITY;

-- Admin: Full access
CREATE POLICY "admin_examiners_all" ON osce.session_examiners
    FOR ALL TO authenticated
    USING (osce.fn_is_admin());

-- Penguji: Read data sendiri
CREATE POLICY "examiner_own_read" ON osce.session_examiners
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());


-- =================================================================
-- PARTICIPANT ANSWERS
-- =================================================================
ALTER TABLE osce.participant_answers ENABLE ROW LEVEL SECURITY;

-- Admin: Read all
CREATE POLICY "admin_answers_read" ON osce.participant_answers
    FOR SELECT TO authenticated
    USING (osce.fn_is_admin());

-- Peserta: INSERT & UPDATE jawaban sendiri yang belum locked
CREATE POLICY "participant_answers_insert" ON osce.participant_answers
    FOR INSERT TO authenticated
    WITH CHECK (participant_id = auth.uid());

CREATE POLICY "participant_answers_update" ON osce.participant_answers
    FOR UPDATE TO authenticated
    USING (participant_id = auth.uid() AND status = 'in_progress');

CREATE POLICY "participant_answers_read_own" ON osce.participant_answers
    FOR SELECT TO authenticated
    USING (participant_id = auth.uid());

-- Penguji: Read jawaban peserta pada stase yang ditugaskan
CREATE POLICY "examiner_answers_read" ON osce.participant_answers
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM osce.stations s
            JOIN osce.session_examiners se ON se.session_id = s.session_id
                AND se.assigned_station_number = s.station_number
            WHERE s.id = participant_answers.station_id
              AND se.user_id = auth.uid()
        )
    );


-- =================================================================
-- EXAMINER EVALUATIONS
-- =================================================================
ALTER TABLE osce.examiner_evaluations ENABLE ROW LEVEL SECURITY;

-- Admin: Read all
CREATE POLICY "admin_evaluations_read" ON osce.examiner_evaluations
    FOR SELECT TO authenticated
    USING (osce.fn_is_admin());

-- Penguji: INSERT & UPDATE evaluasi sendiri
CREATE POLICY "examiner_evaluations_insert" ON osce.examiner_evaluations
    FOR INSERT TO authenticated
    WITH CHECK (examiner_id = auth.uid());

CREATE POLICY "examiner_evaluations_update" ON osce.examiner_evaluations
    FOR UPDATE TO authenticated
    USING (examiner_id = auth.uid() AND is_locked = FALSE);

CREATE POLICY "examiner_evaluations_read_own" ON osce.examiner_evaluations
    FOR SELECT TO authenticated
    USING (examiner_id = auth.uid());


-- =================================================================
-- RUBRIC SCORES
-- =================================================================
ALTER TABLE osce.rubric_scores ENABLE ROW LEVEL SECURITY;

-- Admin: Read all
CREATE POLICY "admin_rubric_scores_read" ON osce.rubric_scores
    FOR SELECT TO authenticated
    USING (osce.fn_is_admin());

-- Penguji: CRUD skor pada evaluasi miliknya sendiri
CREATE POLICY "examiner_rubric_scores_all" ON osce.rubric_scores
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM osce.examiner_evaluations ee
            WHERE ee.id = rubric_scores.evaluation_id
              AND ee.examiner_id = auth.uid()
              AND ee.is_locked = FALSE
        )
    );


-- =================================================================
-- ROTATION STATES
-- =================================================================
ALTER TABLE osce.rotation_states ENABLE ROW LEVEL SECURITY;

-- Admin: Full access
CREATE POLICY "admin_rotation_all" ON osce.rotation_states
    FOR ALL TO authenticated
    USING (osce.fn_is_admin());

-- Semua authenticated: Read
CREATE POLICY "authenticated_rotation_read" ON osce.rotation_states
    FOR SELECT TO authenticated
    USING (true);


-- =================================================================
-- SESSION TIMER STATE
-- =================================================================
ALTER TABLE osce.session_timer_state ENABLE ROW LEVEL SECURITY;

-- Admin: Full access
CREATE POLICY "admin_timer_all" ON osce.session_timer_state
    FOR ALL TO authenticated
    USING (osce.fn_is_admin());

-- Semua authenticated: Read (untuk sync timer di client)
CREATE POLICY "authenticated_timer_read" ON osce.session_timer_state
    FOR SELECT TO authenticated
    USING (true);


-- =================================================================
-- BROADCAST MESSAGES
-- =================================================================
ALTER TABLE osce.broadcast_messages ENABLE ROW LEVEL SECURITY;

-- Admin: Full access
CREATE POLICY "admin_broadcast_all" ON osce.broadcast_messages
    FOR ALL TO authenticated
    USING (osce.fn_is_admin());

-- Semua authenticated: Read
CREATE POLICY "authenticated_broadcast_read" ON osce.broadcast_messages
    FOR SELECT TO authenticated
    USING (true);


-- =================================================================
-- AUDIT LOGS (Read-only untuk Admin, immutable)
-- =================================================================
ALTER TABLE osce.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin: Read only (tidak boleh UPDATE/DELETE audit logs)
CREATE POLICY "admin_audit_read" ON osce.audit_logs
    FOR SELECT TO authenticated
    USING (osce.fn_is_admin());

-- Insert: Hanya melalui trigger (SECURITY DEFINER)
-- Tidak perlu INSERT policy karena trigger function adalah SECURITY DEFINER


-- =================================================================
-- STANDARD SETTING RESULTS
-- =================================================================
ALTER TABLE osce.standard_setting_results ENABLE ROW LEVEL SECURITY;

-- Admin: Full access
CREATE POLICY "admin_standard_setting_all" ON osce.standard_setting_results
    FOR ALL TO authenticated
    USING (osce.fn_is_admin());
