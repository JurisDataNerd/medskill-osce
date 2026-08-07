-- =================================================================
-- 001: SCHEMA OSCE & ENUM TYPES
-- Membuat schema terpisah 'osce' dan mendefinisikan semua custom enum
-- =================================================================

-- 1. Buat Schema Khusus OSCE (isolasi dari public)
CREATE SCHEMA IF NOT EXISTS osce;

-- 2. ENUM: Status Sesi Ujian
DO $$ BEGIN
    CREATE TYPE osce.session_status AS ENUM (
        'draft',
        'scheduled',
        'ongoing',
        'paused',
        'completed',
        'archived'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. ENUM: Global Rating Scale (Penilaian Holistik Penguji)
DO $$ BEGIN
    CREATE TYPE osce.grs_rating AS ENUM (
        'UNSATISFACTORY',
        'BORDERLINE',
        'SATISFACTORY',
        'SUPERIOR'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. ENUM: Status Rotasi Sirkuit
DO $$ BEGIN
    CREATE TYPE osce.rotation_status AS ENUM (
        'scheduled',
        'running',
        'paused',
        'transition',
        'completed'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 5. ENUM: Area Kompetensi SKDI (8 Area Standar Nasional)
DO $$ BEGIN
    CREATE TYPE osce.competency_area AS ENUM (
        'ANAMNESIS',
        'PHYSICAL_EXAM',
        'AUXILIARY_EXAM',
        'DIAGNOSIS_DDX',
        'PHARMACOTHERAPY',
        'NON_PHARMACOTHERAPY',
        'COMMUNICATION',
        'PROFESSIONALISM'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. ENUM: Tipe Ujian (regular, remedial, try_out)
DO $$ BEGIN
    CREATE TYPE osce.exam_type AS ENUM (
        'regular',
        'remedial',
        'try_out'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
