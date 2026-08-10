-- Pro cloud backup for the local-first Engineering Workspace.
-- The browser never receives direct table access: all reads and writes go
-- through authenticated Next.js route handlers using the server-only key.

create table if not exists public.workspace_documents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  document jsonb not null check (jsonb_typeof(document) = 'object'),
  schema_version smallint not null default 1 check (schema_version = 1),
  updated_at timestamptz not null default now()
);

comment on table public.workspace_documents is
  'Latest encrypted-in-transit workspace document for each Engineering Calculator Hub Pro user.';

alter table public.workspace_documents enable row level security;

-- Defense in depth: the application uses a server-side service credential.
-- No public client role can query or mutate workspace documents directly.
revoke all on table public.workspace_documents from anon, authenticated;
grant select, insert, update, delete on table public.workspace_documents to service_role;

create index if not exists workspace_documents_updated_at_idx
  on public.workspace_documents (updated_at desc);
