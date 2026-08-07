-- =================================================================
-- 017: KIOSK TOKENS (Opsional)
-- Token autentikasi untuk Station Kiosk Mode.
-- Tablet di meja stase tidak perlu login/logout per peserta.
-- Peserta cukup scan QR atau pilih nama dari dropdown.
-- =================================================================

CREATE TABLE IF NOT EXISTS osce.station_kiosk_tokens (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id    UUID NOT NULL REFERENCES osce.sessions(id) ON DELETE CASCADE,
    station_id    UUID NOT NULL REFERENCES osce.stations(id) ON DELETE CASCADE,

    -- Token
    token         TEXT NOT NULL UNIQUE,                     -- Token QR yang di-scan peserta / diketik manual
    is_active     BOOLEAN DEFAULT TRUE,

    -- Timestamp
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    expires_at    TIMESTAMPTZ,                              -- Auto-expire setelah sesi selesai

    -- Constraint: 1 token per stase per sesi
    UNIQUE(session_id, station_id)
);

-- RLS
ALTER TABLE osce.station_kiosk_tokens ENABLE ROW LEVEL SECURITY;

-- Admin: Full access
CREATE POLICY "admin_kiosk_all" ON osce.station_kiosk_tokens
    FOR ALL TO authenticated
    USING (osce.fn_is_admin());

-- Authenticated: Read (untuk verifikasi token di kiosk)
CREATE POLICY "authenticated_kiosk_read" ON osce.station_kiosk_tokens
    FOR SELECT TO authenticated
    USING (is_active = TRUE);

COMMENT ON TABLE osce.station_kiosk_tokens IS '(Opsional) Token autentikasi untuk Station Kiosk Mode — peserta scan QR untuk identifikasi cepat';
