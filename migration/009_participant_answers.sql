-- =================================================================
-- 009: TABEL PARTICIPANT ANSWERS (Lembar Jawaban Peserta)
-- Progres real-time & jawaban pengerjaan peserta pada flow 4-halaman:
--   Halaman 1: Read Skenario
--   Halaman 2: Anamnesis & Pemeriksaan Fisik
--   Halaman 3: Permintaan Berkas Penunjang
--   Halaman 4: Diagnosis, Resep & Edukasi
-- =================================================================

CREATE TABLE IF NOT EXISTS osce.participant_answers (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Referensi Relasi
    session_id               UUID NOT NULL REFERENCES osce.sessions(id) ON DELETE CASCADE,
    station_id               UUID NOT NULL REFERENCES osce.stations(id) ON DELETE CASCADE,
    participant_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rotation_round           INT NOT NULL,

    -- Progres Step (4-halaman)
    current_step             TEXT DEFAULT 'PAGE_1_SCENARIO',
    -- Values: 'PAGE_1_SCENARIO', 'PAGE_2_ANAMNESIS_PHYSICAL',
    --         'PAGE_3_AUXILIARY_EXAM', 'PAGE_4_DIAGNOSIS_THERAPY', 'SUBMITTED'

    -- Halaman 2: Catatan Anamnesis & Pemeriksaan Fisik
    anamnesis_notes          TEXT,
    physical_exam_notes      TEXT,

    -- Halaman 3: Permintaan Penunjang
    requested_auxiliary_json JSONB DEFAULT '[]'::jsonb,     -- Array ID item penunjang yang diminta

    -- Halaman 4: Diagnosis (terstruktur)
    working_diagnosis        TEXT,                          -- 1 WDx (Diagnosis Kerja)
    differential_dx_1        TEXT,                          -- DDx 1
    differential_dx_2        TEXT,                          -- DDx 2
    differential_dx_3        TEXT,                          -- DDx 3

    -- Halaman 4: Tatalaksana
    prescription_text        TEXT,                          -- Resep obat (long text)
    therapy_notes            TEXT,                          -- Tatalaksana non-farmakoterapi
    education_notes          TEXT,                          -- Catatan edukasi pasien

    -- Legacy blob fields (backward compat, akan di-deprecate)
    diagnosis_notes          TEXT,                          -- Gabungan diagnosis (legacy)

    -- Status
    status                   TEXT DEFAULT 'in_progress',    -- 'in_progress', 'submitted', 'locked'

    -- Timestamp
    started_at               TIMESTAMPTZ DEFAULT NOW(),
    submitted_at             TIMESTAMPTZ,

    -- Constraint: 1 peserta per 1 stase per 1 ronde
    UNIQUE(session_id, station_id, participant_id, rotation_round)
);

COMMENT ON TABLE osce.participant_answers IS 'Lembar jawaban peserta per stase dengan progres 4-halaman realtime';
COMMENT ON COLUMN osce.participant_answers.current_step IS 'Posisi halaman aktif peserta: PAGE_1 → PAGE_2 → PAGE_3 → PAGE_4 → SUBMITTED';
COMMENT ON COLUMN osce.participant_answers.working_diagnosis IS 'Diagnosis Kerja (WDx) - 1 baris';
COMMENT ON COLUMN osce.participant_answers.differential_dx_1 IS 'Diagnosis Banding (DDx) ke-1';
COMMENT ON COLUMN osce.participant_answers.requested_auxiliary_json IS 'Array ID item penunjang yang diminta peserta untuk ditampilkan hasilnya';
