-- =================================================================
-- 019: SCHEMA OSCE PERMISSIONS & POSTGREST EXPOSED SCHEMAS
-- Grant USAGE & ALL permissions to anon, authenticated, and service_role
-- on schema `osce` to prevent PostgREST permission denied (PGRST106 / 42501).
-- =================================================================

GRANT USAGE ON SCHEMA osce TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA osce TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA osce TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA osce TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA osce GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA osce GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA osce GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

ALTER ROLE authenticator SET search_path TO osce, public;
ALTER ROLE anon SET search_path TO osce, public;
ALTER ROLE authenticated SET search_path TO osce, public;

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
