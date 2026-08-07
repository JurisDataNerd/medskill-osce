-- =================================================================
-- 004: TABEL RUBRIC ITEMS (Checklist Penilaian Medis per Stase)
-- Indikator rubrik dengan skor 0-3, bobot, deskriptor 4-level,
-- dan area kompetensi SKDI.
-- =================================================================

CREATE TABLE IF NOT EXISTS osce.rubric_items (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id        UUID NOT NULL REFERENCES osce.stations(id) ON DELETE CASCADE,

    -- Identifikasi
    question_number   INT NOT NULL,                        -- Nomor urut indikator
    question          TEXT NOT NULL,                        -- Indikator penilaian (misal: "Anamnesis PQRST")
    answer_key        TEXT NOT NULL,                        -- Kunci jawaban & pedoman penskoran (Level 3 = sempurna)

    -- Penskoran
    max_points        INT DEFAULT 3,                       -- Poin maksimal (biasanya 3)
    weight            NUMERIC DEFAULT 1.0,                 -- Bobot nilai indikator

    -- Area Kompetensi SKDI (8 area standar nasional)
    competency_area   osce.competency_area,                -- ANAMNESIS, PHYSICAL_EXAM, dll.

    -- Deskriptor Kriteria Kinerja 4-Level (Standar AIPKI)
    -- score_0: "Tidak dilakukan / Salah total"
    -- score_1: "Minimal / Sebagian besar tidak mengarah"
    -- score_2: "Cukup / Sebagian besar tepat"
    -- score_3: "Sempurna / Lengkap & tepat"
    descriptors       JSONB DEFAULT '{
        "score_0": "",
        "score_1": "",
        "score_2": "",
        "score_3": ""
    }'::jsonb,

    -- Urutan tampilan
    sort_order        INT DEFAULT 0,

    -- Timestamp
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Komentar
COMMENT ON TABLE osce.rubric_items IS 'Item rubrik penilaian per stase dengan skor 0-3, bobot, dan deskriptor kriteria';
COMMENT ON COLUMN osce.rubric_items.competency_area IS 'Area kompetensi SKDI: ANAMNESIS, PHYSICAL_EXAM, AUXILIARY_EXAM, DIAGNOSIS_DDX, PHARMACOTHERAPY, NON_PHARMACOTHERAPY, COMMUNICATION, PROFESSIONALISM';
COMMENT ON COLUMN osce.rubric_items.descriptors IS 'JSONB berisi deskripsi kriteria kinerja untuk skor 0, 1, 2, dan 3 sesuai standar AIPKI';
COMMENT ON COLUMN osce.rubric_items.weight IS 'Bobot kompetensi: Skor Item = Poin (0..3) × Bobot';
