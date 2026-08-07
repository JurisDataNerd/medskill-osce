-- =================================================================
-- 010: TABEL EXAMINER EVALUATIONS & RUBRIC SCORES
-- Penilaian evaluasi dokter penguji (GRS, catatan, skor terbobot)
-- dan rincian skor per item rubrik (0-3).
-- =================================================================

-- ---------------------------------------------------------------
-- A. Evaluasi Penguji (1 record per peserta per stase per penguji)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS osce.examiner_evaluations (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Referensi Relasi
    session_id               UUID NOT NULL REFERENCES osce.sessions(id) ON DELETE CASCADE,
    station_id               UUID NOT NULL REFERENCES osce.stations(id) ON DELETE CASCADE,
    participant_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    examiner_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rotation_round           INT NOT NULL,

    -- Global Performance Rating (Penilaian Holistik)
    grs_rating               osce.grs_rating NOT NULL DEFAULT 'SATISFACTORY',

    -- Catatan Evaluasi
    examiner_notes           TEXT,                          -- Feedback kualitatif penguji

    -- Skor Terbobot (dihitung dari rubric_scores)
    total_points_earned      NUMERIC NOT NULL DEFAULT 0,    -- Σ(Poin × Bobot)
    max_points_possible      NUMERIC NOT NULL DEFAULT 0,    -- Σ(3 × Bobot)
    final_score_percentage   NUMERIC NOT NULL DEFAULT 0,    -- (earned / possible) × 100

    -- Status Penguncian
    is_locked                BOOLEAN DEFAULT FALSE,         -- Dikunci setelah submit final

    -- Timestamp
    submitted_at             TIMESTAMPTZ DEFAULT NOW(),

    -- Constraint: 1 evaluasi per peserta per stase per penguji per ronde
    UNIQUE(session_id, station_id, participant_id, examiner_id, rotation_round)
);

COMMENT ON TABLE osce.examiner_evaluations IS 'Evaluasi penguji per peserta per stase: GRS, feedback, dan skor terbobot';

-- ---------------------------------------------------------------
-- B. Skor Detail per Item Rubrik (Score 0, 1, 2, 3)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS osce.rubric_scores (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id            UUID NOT NULL REFERENCES osce.examiner_evaluations(id) ON DELETE CASCADE,
    rubric_item_id           UUID NOT NULL REFERENCES osce.rubric_items(id) ON DELETE CASCADE,

    -- Skor
    score_given              INT NOT NULL DEFAULT 0,        -- 0, 1, 2, atau 3
    feedback                 TEXT,                          -- Feedback per item (opsional)

    -- Timestamp (kapan skor di-input/diubah)
    scored_at                TIMESTAMPTZ DEFAULT NOW(),

    -- Constraint: 1 skor per item rubrik per evaluasi
    UNIQUE(evaluation_id, rubric_item_id)
);

COMMENT ON TABLE osce.rubric_scores IS 'Nilai detail per item rubrik (0-3) dengan timestamp input';
