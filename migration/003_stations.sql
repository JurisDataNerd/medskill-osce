-- =================================================================
-- 003: TABEL STATIONS (Pos Ruangan / Slot Stase Sirkuit)
-- Setiap stase dalam sirkuit: bisa Stase Ujian atau Stase Istirahat.
-- Penamaan otomatis: "Stase 1", "Stase 2", "Stase Istirahat 1", dll.
-- =================================================================

CREATE TABLE IF NOT EXISTS osce.stations (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id               UUID NOT NULL REFERENCES osce.sessions(id) ON DELETE CASCADE,

    -- Identifikasi Stase
    station_number           INT NOT NULL,                  -- Urutan fisik pos (1, 2, 3...)
    is_break                 BOOLEAN DEFAULT FALSE,         -- true = Stase Istirahat, false = Stase Ujian
    title                    TEXT NOT NULL,                  -- Auto-name: "Stase 1", "Stase Istirahat 1"

    -- Konten Kasus Medis (null untuk stase istirahat)
    case_title               TEXT,                          -- "STEMI Anteroseptal", "Asma Bronkial Akut"
    system_organ             TEXT,                          -- "Kardiovaskular", "Respirasi", "Neurologi"
    skdi_level               TEXT,                          -- "4A", "3B", "3A"
    scenario                 TEXT,                          -- Skenario klinis lengkap
    participant_instructions TEXT,                          -- Instruksi tugas peserta ujian
    examiner_instructions    TEXT,                          -- Panduan & instruksi khusus penguji

    -- Kunci Jawaban Baku (Gold Standard Answer Key)
    answer_key_diagnosis     TEXT,                          -- Kunci WDx + DDx
    answer_key_prescription  TEXT,                          -- Kunci Resep Obat

    -- Referensi Bank Soal
    question_bank_id         UUID,                          -- FK ke osce.question_bank (ditambahkan setelah tabel dibuat)

    -- Lokasi Fisik
    room_number              TEXT,                          -- "Ruang 101", "Skill Lab Lt.2 R.05"

    -- Urutan DND (Drag & Drop)
    sort_order               INT DEFAULT 0,

    -- Timestamp
    created_at               TIMESTAMPTZ DEFAULT NOW(),
    updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- Komentar tabel
COMMENT ON TABLE osce.stations IS 'Slot pos ruangan sirkuit (stase ujian medis & stase istirahat)';
COMMENT ON COLUMN osce.stations.is_break IS 'true = Stase Istirahat (tanpa penguji/kasus), false = Stase Ujian Aktif';
COMMENT ON COLUMN osce.stations.answer_key_diagnosis IS 'Kunci jawaban resmi diagnosis kerja + banding untuk acuan penguji';
COMMENT ON COLUMN osce.stations.answer_key_prescription IS 'Kunci jawaban resmi resep obat untuk acuan penguji';
COMMENT ON COLUMN osce.stations.question_bank_id IS 'Referensi ke bank soal jika stase dibuat dari template (FK ditambahkan di 006)';
