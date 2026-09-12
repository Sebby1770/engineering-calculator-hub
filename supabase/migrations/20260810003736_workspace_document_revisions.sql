-- Revision-aware Pro workspace sync with atomic recovery snapshots.
--
-- Pre-revision application versions remain compatible: when an old client updates
-- a row without changing `revision`, the trigger advances it automatically.
-- Revision-aware clients use compare-and-swap filters so stale devices cannot
-- silently overwrite a newer cloud document.

alter table public.workspace_documents
  add column if not exists revision bigint;

update public.workspace_documents
set revision = 1
where revision is null;

alter table public.workspace_documents
  alter column revision set default 1,
  alter column revision set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.workspace_documents'::regclass
      and conname = 'workspace_documents_revision_positive'
  ) then
    alter table public.workspace_documents
      add constraint workspace_documents_revision_positive
      check (revision > 0) not valid;
  end if;
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.workspace_documents'::regclass
      and conname = 'workspace_documents_document_size'
  ) then
    alter table public.workspace_documents
      add constraint workspace_documents_document_size
      check (octet_length(document::text) <= 512000) not valid;
  end if;
end
$$;

alter table public.workspace_documents
  validate constraint workspace_documents_revision_positive,
  validate constraint workspace_documents_document_size;

comment on column public.workspace_documents.revision is
  'Monotonic server revision used for optimistic concurrency control.';

create table if not exists public.workspace_document_versions (
  user_id uuid not null references auth.users(id) on delete cascade,
  revision bigint not null check (revision > 0),
  document jsonb not null check (
    jsonb_typeof(document) = 'object'
    and octet_length(document::text) <= 512000
  ),
  schema_version smallint not null check (schema_version = 1),
  saved_at timestamptz not null,
  archived_at timestamptz not null default statement_timestamp(),
  primary key (user_id, revision)
);

comment on table public.workspace_document_versions is
  'Superseded Pro workspace snapshots retained for conflict-safe recovery.';
comment on column public.workspace_document_versions.saved_at is
  'Server timestamp from when this snapshot was the current cloud document.';
comment on column public.workspace_document_versions.archived_at is
  'Server timestamp from when a newer revision superseded this snapshot.';

create index if not exists workspace_document_versions_retention_idx
  on public.workspace_document_versions (user_id, archived_at);

alter table public.workspace_documents enable row level security;
alter table public.workspace_documents force row level security;
alter table public.workspace_document_versions enable row level security;
alter table public.workspace_document_versions force row level security;

revoke all on table public.workspace_document_versions
  from public, anon, authenticated, service_role;
grant select on table public.workspace_document_versions
  to service_role;

revoke all on table public.workspace_documents
  from public, anon, authenticated, service_role;
grant select, insert, update on table public.workspace_documents
  to service_role;

create or replace function private.prepare_workspace_document_write()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.revision := 1;
  else
    if new.user_id <> old.user_id then
      raise exception 'A workspace owner cannot be changed.'
        using errcode = '23514';
    end if;

    -- Retried and otherwise identical saves are true no-ops.
    if new.document is not distinct from old.document
       and new.schema_version is not distinct from old.schema_version then
      new.revision := old.revision;
      new.updated_at := old.updated_at;
      return new;
    end if;

    -- Backwards compatibility for the pre-revision route. New clients send
    -- OLD.revision + 1 and filter on OLD.revision in the same UPDATE.
    if new.revision = old.revision then
      new.revision := old.revision + 1;
    elsif new.revision <> old.revision + 1 then
      raise exception 'Workspace revisions must advance by exactly one.'
        using errcode = '23514';
    end if;
  end if;

  new.updated_at := clock_timestamp();
  return new;
end
$$;

create or replace function private.archive_workspace_document_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.document is distinct from new.document
     or old.schema_version is distinct from new.schema_version then
    insert into public.workspace_document_versions (
      user_id,
      revision,
      document,
      schema_version,
      saved_at,
      archived_at
    ) values (
      old.user_id,
      old.revision,
      old.document,
      old.schema_version,
      old.updated_at,
      clock_timestamp()
    )
    on conflict (user_id, revision) do nothing;
  end if;

  -- Keep recovery useful without allowing unbounded JSON history growth.
  delete from public.workspace_document_versions
  where user_id = old.user_id
    and archived_at < clock_timestamp() - interval '30 days';

  delete from public.workspace_document_versions
  where user_id = old.user_id
    and revision in (
      select revision
      from public.workspace_document_versions
      where user_id = old.user_id
      order by revision desc
      offset 50
    );

  return null;
end
$$;

create or replace function private.prune_workspace_document_versions()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count bigint;
begin
  delete from public.workspace_document_versions
  where archived_at < clock_timestamp() - interval '30 days';

  get diagnostics deleted_count = row_count;
  return deleted_count;
end
$$;

revoke all on function private.prepare_workspace_document_write()
  from public, anon, authenticated, service_role;
revoke all on function private.archive_workspace_document_version()
  from public, anon, authenticated, service_role;
revoke all on function private.prune_workspace_document_versions()
  from public, anon, authenticated, service_role;

drop trigger if exists workspace_documents_prepare_write
  on public.workspace_documents;
create trigger workspace_documents_prepare_write
  before insert or update on public.workspace_documents
  for each row execute function private.prepare_workspace_document_write();

drop trigger if exists workspace_documents_archive_version
  on public.workspace_documents;
create trigger workspace_documents_archive_version
  after update on public.workspace_documents
  for each row execute function private.archive_workspace_document_version();

-- Supabase Cron exposes pg_cron. Schedule global expiry when it is already
-- enabled; otherwise active users are still pruned on every successful save.
do $$
begin
  if to_regprocedure('cron.schedule(text,text,text)') is not null then
    perform cron.schedule(
      'engineering-calculator-workspace-version-retention',
      '17 3 * * *',
      'select private.prune_workspace_document_versions();'
    );
  else
    raise notice 'pg_cron is not enabled; workspace history is pruned on save.';
  end if;
end
$$;
