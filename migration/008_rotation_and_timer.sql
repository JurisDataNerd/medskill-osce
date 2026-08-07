-- =================================================================
-- 008: TABEL ROTATION STATES & SESSION TIMER STATE
-- State matriks rotasi live dan timer server-side.
-- Timer menggunakan pattern "Future Timestamp" untuk sinkronisasi.
-- =================================================================

-- ---------------------------------------------------------------
-- A. Rotation States (Matriks Rotasi Sirkuit Live)
-- Melacak status setiap ronde rotasi per gelombang.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS osce.rotation_states (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id               UUID NOT NULL REFERENCES osce.sessions(id) ON DELETE CASCADE,

    -- Posisi Rotasi
    wave_number              INT NOT NULL DEFAULT 1,
    round_number             INT NOT NULL DEFAULT 1,

    -- Status
    status                   osce.rotation_status DEFAULT 'scheduled',

    -- Timer State (fallback/legacy)
    time_remaining_seconds   INT NOT NULL DEFAULT 720,      -- 12 menit default

    -- Timestamp
    started_at               TIMESTAMPTZ,
    paused_at                TIMESTAMPTZ,
    created_at               TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE osce.rotation_states IS 'State matriks rotasi sirkuit per gelombang dan ronde';

-- ---------------------------------------------------------------
-- B. Session Timer State (Server-Side Timer Sync)
-- Menggunakan "Future Timestamp Pattern":
-- - Simpan target_end_time (kapan timer berakhir)
-- - Client menghitung countdown secara lokal
-- - Kebal terhadap latensi jaringan & browser tab throttling
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS osce.session_timer_state (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id               UUID NOT NULL REFERENCES osce.sessions(id) ON DELETE CASCADE,

    -- Posisi Saat Ini
    wave_number              INT NOT NULL DEFAULT 1,
    round_number             INT NOT NULL DEFAULT 1,

    -- Phase Timer
    phase                    TEXT NOT NULL DEFAULT 'idle',   -- 'idle', 'reading', 'action', 'transition', 'break', 'paused'

    -- Future Timestamp (source of truth)
    target_end_time          TIMESTAMPTZ,                   -- Kapan phase saat ini berakhir
    paused_remaining_ms      INT,                           -- Sisa ms jika di-pause

    -- Bell System
    bell_sequence            INT DEFAULT 0,                 -- Counter bel (1=reading end, 2=2min warning, 3=rotation)

    -- Metadata
    updated_by               UUID REFERENCES public.profiles(id),
    updated_at               TIMESTAMPTZ DEFAULT NOW(),

    -- Constraint: 1 session = 1 timer state (singleton)
    UNIQUE(session_id)
);

COMMENT ON TABLE osce.session_timer_state IS 'Server-side timer state menggunakan Future Timestamp Pattern untuk sinkronisasi realtime';
COMMENT ON COLUMN osce.session_timer_state.target_end_time IS 'UTC timestamp kapan phase saat ini berakhir. Client menghitung: remaining = target_end_time - NOW()';
COMMENT ON COLUMN osce.session_timer_state.phase IS 'Phase aktif: idle (belum mulai), reading (baca skenario), action (pengerjaan), transition (pindah stase), break (istirahat), paused (jeda admin)';
