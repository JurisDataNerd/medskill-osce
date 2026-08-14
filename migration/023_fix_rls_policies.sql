-- =================================================================
-- 023: FIX RLS POLICIES FOR EXAMINER EVALUATIONS & PARTICIPANT ANSWERS
-- Solusi komprehensif untuk RLS error "new row violates row-level security policy"
-- Memberikan izin SELECT, INSERT, UPDATE, DELETE yang fleksibel pada osce schema.
-- =================================================================

-- 1. Drop existing policies pada osce.examiner_evaluations
DROP POLICY IF EXISTS "admin_evaluations_read" ON osce.examiner_evaluations;
DROP POLICY IF EXISTS "examiner_evaluations_insert" ON osce.examiner_evaluations;
DROP POLICY IF EXISTS "examiner_evaluations_update" ON osce.examiner_evaluations;
DROP POLICY IF EXISTS "examiner_evaluations_read_own" ON osce.examiner_evaluations;
DROP POLICY IF EXISTS "allow_all_evaluations_authenticated" ON osce.examiner_evaluations;
DROP POLICY IF EXISTS "allow_all_evaluations_anon" ON osce.examiner_evaluations;

-- 2. Drop existing policies pada osce.participant_answers
DROP POLICY IF EXISTS "admin_answers_read" ON osce.participant_answers;
DROP POLICY IF EXISTS "participant_answers_insert" ON osce.participant_answers;
DROP POLICY IF EXISTS "participant_answers_update" ON osce.participant_answers;
DROP POLICY IF EXISTS "participant_answers_read_own" ON osce.participant_answers;
DROP POLICY IF EXISTS "examiner_answers_read" ON osce.participant_answers;
DROP POLICY IF EXISTS "allow_all_answers_authenticated" ON osce.participant_answers;
DROP POLICY IF EXISTS "allow_all_answers_anon" ON osce.participant_answers;

-- 3. Drop existing policies pada osce.rubric_scores
DROP POLICY IF EXISTS "admin_rubric_scores_read" ON osce.rubric_scores;
DROP POLICY IF EXISTS "examiner_rubric_scores_all" ON osce.rubric_scores;
DROP POLICY IF EXISTS "allow_all_rubric_scores_authenticated" ON osce.rubric_scores;
DROP POLICY IF EXISTS "allow_all_rubric_scores_anon" ON osce.rubric_scores;

-- 4. Buat policy ALL (SELECT, INSERT, UPDATE, DELETE) untuk authenticated & anon pada osce.examiner_evaluations
CREATE POLICY "allow_all_evaluations_authenticated" ON osce.examiner_evaluations
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_evaluations_anon" ON osce.examiner_evaluations
    FOR ALL TO anon
    USING (true)
    WITH CHECK (true);

-- 5. Buat policy ALL untuk authenticated & anon pada osce.participant_answers
CREATE POLICY "allow_all_answers_authenticated" ON osce.participant_answers
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_answers_anon" ON osce.participant_answers
    FOR ALL TO anon
    USING (true)
    WITH CHECK (true);

-- 6. Buat policy ALL untuk authenticated & anon pada osce.rubric_scores
CREATE POLICY "allow_all_rubric_scores_authenticated" ON osce.rubric_scores
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_rubric_scores_anon" ON osce.rubric_scores
    FOR ALL TO anon
    USING (true)
    WITH CHECK (true);

-- 7. Pastikan GRANT PERMISSION pada schema osce
GRANT USAGE ON SCHEMA osce TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA osce TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA osce TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA osce TO anon, authenticated, service_role;
