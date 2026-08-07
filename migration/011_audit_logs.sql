-- =================================================================
-- 011: TABEL AUDIT LOGS & TRIGGER OTOMATIS
-- Audit trail imutabel untuk setiap perubahan skor/evaluasi.
-- WAJIB untuk ujian nasional (banding, compliance AIPKI/KKI).
-- =================================================================

-- ---------------------------------------------------------------
-- A. Tabel Audit Logs (Imutabel — INSERT ONLY)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS osce.audit_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name    TEXT NOT NULL,                            -- 'examiner_evaluations', 'rubric_scores', dll.
    record_id     UUID NOT NULL,                            -- PK dari record yang diubah
    action        TEXT NOT NULL,                            -- 'INSERT', 'UPDATE', 'DELETE'
    old_data      JSONB,                                   -- Snapshot data sebelum perubahan
    new_data      JSONB,                                   -- Snapshot data setelah perubahan
    changed_by    UUID,                                    -- auth.uid() user yang melakukan perubahan
    ip_address    INET,
    user_agent    TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE osce.audit_logs IS 'Audit trail imutabel: setiap perubahan evaluasi & skor tercatat untuk compliance ujian nasional';

-- ---------------------------------------------------------------
-- B. Function: Generic Audit Trigger
-- Dapat dipasang ke tabel manapun yang perlu di-audit
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION osce.fn_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO osce.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (
        TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        COALESCE(
            current_setting('request.jwt.claims', true)::jsonb->>'sub',
            NULL
        )::uuid
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION osce.fn_audit_trigger IS 'Generic audit trigger: log INSERT/UPDATE/DELETE ke osce.audit_logs';

-- ---------------------------------------------------------------
-- C. Pasang Audit Trigger di Tabel Kritis
-- ---------------------------------------------------------------

-- Audit: Evaluasi Penguji
DROP TRIGGER IF EXISTS audit_examiner_evaluations ON osce.examiner_evaluations;
CREATE TRIGGER audit_examiner_evaluations
    AFTER INSERT OR UPDATE OR DELETE ON osce.examiner_evaluations
    FOR EACH ROW EXECUTE FUNCTION osce.fn_audit_trigger();

-- Audit: Skor Rubrik
DROP TRIGGER IF EXISTS audit_rubric_scores ON osce.rubric_scores;
CREATE TRIGGER audit_rubric_scores
    AFTER INSERT OR UPDATE OR DELETE ON osce.rubric_scores
    FOR EACH ROW EXECUTE FUNCTION osce.fn_audit_trigger();

-- Audit: Status Sesi (start/stop/pause)
DROP TRIGGER IF EXISTS audit_sessions_status ON osce.sessions;
CREATE TRIGGER audit_sessions_status
    AFTER UPDATE ON osce.sessions
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION osce.fn_audit_trigger();

-- Audit: Jawaban Peserta (lock/submit)
DROP TRIGGER IF EXISTS audit_participant_answers ON osce.participant_answers;
CREATE TRIGGER audit_participant_answers
    AFTER UPDATE ON osce.participant_answers
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION osce.fn_audit_trigger();
