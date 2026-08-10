-- Existing Supabase projects can automatically grant Data API roles access to
-- every new object in public. Make exposure opt-in so a future migration must
-- explicitly grant only the operations its server route actually needs.

alter default privileges for role postgres in schema public
  revoke all privileges on tables from public, anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke all privileges on sequences from public, anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke all privileges on functions from anon, authenticated, service_role;

-- PostgreSQL grants EXECUTE on new functions to PUBLIC globally by default.
-- A schema-scoped revoke cannot override that built-in global default.
alter default privileges for role postgres
  revoke execute on functions from public;
