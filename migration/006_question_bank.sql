-- =================================================================
-- 006: TABEL QUESTION BANK (Master Bank Soal Medis)
-- Bank soal baku yang dapat digunakan ulang (1-click Auto-Fill).
-- Termasuk sub-tabel relasional untuk rubrik dan penunjang.
-- =================================================================

-- ---------------------------------------------------------------
-- A. Tabel Utama Bank Soal
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS osce.question_bank (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identitas Soal
    title                    TEXT NOT NULL,                  -- Judul paket soal
    system_organ             TEXT NOT NULL,                  -- "Kardiovaskular", "Respirasi", dll.
    skdi_level               TEXT NOT NULL,                  -- "4A", "3B", "3A"
    case_title               TEXT NOT NULL,                  -- Topik kasus klinis

    -- Konten Skenario
    scenario                 TEXT NOT NULL,                  -- Skenario kasus lengkap
    participant_instructions TEXT NOT NULL,                  -- Instruksi peserta
    examiner_instructions    TEXT NOT NULL,                  -- Instruksi penguji

    -- Kunci Jawaban Baku
    answer_key_diagnosis     TEXT,                           -- Kunci WDx + DDx
    answer_key_prescription  TEXT,                           -- Kunci Resep Obat

    -- Legacy JSONB (backward compatibility, akan di-deprecate)
    checklist_items_json     JSONB DEFAULT '[]'::jsonb,
    auxiliary_configs_json   JSONB DEFAULT '[]'::jsonb,

    -- Metadata
    created_by               UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at               TIMESTAMPTZ DEFAULT NOW(),
    updated_at               TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE osce.question_bank IS 'Master bank soal medis baku untuk 1-click auto-fill ke stase';

-- ---------------------------------------------------------------
-- B. Sub-tabel: Rubrik Items Bank Soal (normalisasi dari JSONB)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS osce.question_bank_rubric_items (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_bank_id  UUID NOT NULL REFERENCES osce.question_bank(id) ON DELETE CASCADE,

    question_number   INT NOT NULL,
    question          TEXT NOT NULL,
    answer_key        TEXT NOT NULL,
    max_points        INT DEFAULT 3,
    weight            NUMERIC DEFAULT 1.0,
    competency_area   osce.competency_area,
    descriptors       JSONB DEFAULT '{}'::jsonb,
    sort_order        INT DEFAULT 0
);

COMMENT ON TABLE osce.question_bank_rubric_items IS 'Item rubrik penilaian per soal bank (normalisasi dari checklist_items_json)';

-- ---------------------------------------------------------------
-- C. Sub-tabel: Auxiliary Configs Bank Soal (normalisasi dari JSONB)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS osce.question_bank_auxiliary_configs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_bank_id  UUID NOT NULL REFERENCES osce.question_bank(id) ON DELETE CASCADE,

    item_id           TEXT NOT NULL,
    name              TEXT NOT NULL,
    category          TEXT NOT NULL,
    image_storage_path TEXT,                                -- Path di Supabase Storage
    report_text       TEXT,
    sort_order        INT DEFAULT 0
);

COMMENT ON TABLE osce.question_bank_auxiliary_configs IS 'Konfigurasi penunjang per soal bank (normalisasi dari auxiliary_configs_json)';

-- ---------------------------------------------------------------
-- D. Tambahkan FK stations.question_bank_id → question_bank
-- (Stations sudah dibuat di 003, sekarang tambahkan FK constraint)
-- ---------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_stations_question_bank'
    ) THEN
        ALTER TABLE osce.stations
        ADD CONSTRAINT fk_stations_question_bank
        FOREIGN KEY (question_bank_id) REFERENCES osce.question_bank(id) ON DELETE SET NULL;
    END IF;
END $$;
