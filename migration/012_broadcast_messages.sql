-- =================================================================
-- 012: TABEL BROADCAST MESSAGES
-- Pesan broadcast dari admin ke peserta/penguji secara realtime.
-- Digunakan untuk pengumuman darurat, peringatan waktu, dll.
-- =================================================================

CREATE TABLE IF NOT EXISTS osce.broadcast_messages (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id    UUID NOT NULL REFERENCES osce.sessions(id) ON DELETE CASCADE,

    -- Konten Pesan
    message       TEXT NOT NULL,                            -- Isi pesan broadcast
    priority      TEXT DEFAULT 'info',                      -- 'info', 'warning', 'urgent'
    target_role   TEXT DEFAULT 'all',                       -- 'all', 'participants', 'examiners'

    -- Metadata
    sent_by       UUID REFERENCES public.profiles(id),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE osce.broadcast_messages IS 'Pesan broadcast admin ke layar peserta/penguji secara realtime';
COMMENT ON COLUMN osce.broadcast_messages.priority IS 'Tingkat prioritas: info (biasa), warning (peringatan), urgent (darurat)';
COMMENT ON COLUMN osce.broadcast_messages.target_role IS 'Target penerima: all (semua), participants (peserta saja), examiners (penguji saja)';
