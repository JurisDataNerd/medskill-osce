-- =================================================================
-- 014: INDEXES (Indeks Performa Query Realtime)
-- Optimasi query yang paling sering digunakan pada saat ujian live.
-- =================================================================

-- ---------------------------------------------------------------
-- Stations: Lookup stase per sesi
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_stations_session
    ON osce.stations(session_id, station_number);

CREATE INDEX IF NOT EXISTS idx_stations_session_sort
    ON osce.stations(session_id, sort_order);

-- ---------------------------------------------------------------
-- Rubric Items: Lookup rubrik per stase
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_rubric_items_station
    ON osce.rubric_items(station_id, sort_order);

-- ---------------------------------------------------------------
-- Station Auxiliary Configs: Lookup penunjang per stase
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_aux_configs_station
    ON osce.station_auxiliary_configs(station_id);

-- ---------------------------------------------------------------
-- Session Participants: Lookup peserta per sesi + gelombang
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_participants_session_wave
    ON osce.session_participants(session_id, wave_number);

-- ---------------------------------------------------------------
-- Session Examiners: Lookup penguji per sesi + stase
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_examiners_session_station
    ON osce.session_examiners(session_id, assigned_station_number);

-- ---------------------------------------------------------------
-- Participant Answers: Hot path — realtime lookup per peserta per stase
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_answers_session_station_participant
    ON osce.participant_answers(session_id, station_id, participant_id);

CREATE INDEX IF NOT EXISTS idx_answers_session_round
    ON osce.participant_answers(session_id, rotation_round);

-- ---------------------------------------------------------------
-- Examiner Evaluations: Lookup evaluasi per peserta per stase
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_evaluations_session_station_participant
    ON osce.examiner_evaluations(session_id, station_id, participant_id);

CREATE INDEX IF NOT EXISTS idx_evaluations_session_locked
    ON osce.examiner_evaluations(session_id, is_locked);

-- ---------------------------------------------------------------
-- Rubric Scores: Lookup skor per evaluasi
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_rubric_scores_evaluation
    ON osce.rubric_scores(evaluation_id);

-- ---------------------------------------------------------------
-- Rotation States: Lookup rotasi aktif per sesi
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_rotation_session_wave_round
    ON osce.rotation_states(session_id, wave_number, round_number);

-- ---------------------------------------------------------------
-- Audit Logs: Query audit per tabel dan record
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_audit_table_record
    ON osce.audit_logs(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_changed_by
    ON osce.audit_logs(changed_by);

CREATE INDEX IF NOT EXISTS idx_audit_created_at
    ON osce.audit_logs(created_at DESC);

-- ---------------------------------------------------------------
-- Sessions: Partial index untuk sesi aktif only (performa dashboard)
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sessions_active
    ON osce.sessions(id) WHERE status IN ('ongoing', 'paused');

CREATE INDEX IF NOT EXISTS idx_sessions_date
    ON osce.sessions(session_date DESC);

-- ---------------------------------------------------------------
-- Question Bank: Pencarian bank soal
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_qbank_organ_level
    ON osce.question_bank(system_organ, skdi_level);

-- ---------------------------------------------------------------
-- Broadcast Messages: Lookup per sesi (terbaru dulu)
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_broadcast_session
    ON osce.broadcast_messages(session_id, created_at DESC);
