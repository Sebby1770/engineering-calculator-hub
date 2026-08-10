-- Durable Stripe webhook inbox and cancellation metadata.
--
-- Supabase projects created under the newer Data API defaults may not expose a
-- newly created public table automatically. After applying this migration,
-- verify that `public.stripe_events` is exposed to the Data API used by the
-- server-side PostgREST helper. Do not grant anon/authenticated access to make
-- it appear: keep the table private and expose it only to `service_role`.

alter table public.profiles
  add column if not exists cancel_at_period_end boolean;
alter table public.profiles
  add column if not exists canceled_at timestamptz;

update public.profiles
set cancel_at_period_end = false
where cancel_at_period_end is null;

alter table public.profiles
  alter column cancel_at_period_end set default false;
alter table public.profiles
  alter column cancel_at_period_end set not null;

create table if not exists public.stripe_events (
  event_id text primary key,
  event_type text not null,
  object_id text,
  event_created_at bigint not null,
  livemode boolean not null,
  status text not null default 'pending',
  last_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'stripe_events_event_id_length_check'
      and conrelid = 'public.stripe_events'::regclass
  ) then
    alter table public.stripe_events
      add constraint stripe_events_event_id_length_check
      check (char_length(event_id) between 5 and 255) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'stripe_events_event_type_length_check'
      and conrelid = 'public.stripe_events'::regclass
  ) then
    alter table public.stripe_events
      add constraint stripe_events_event_type_length_check
      check (char_length(event_type) between 3 and 255) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'stripe_events_object_id_length_check'
      and conrelid = 'public.stripe_events'::regclass
  ) then
    alter table public.stripe_events
      add constraint stripe_events_object_id_length_check
      check (object_id is null or char_length(object_id) between 1 and 255) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'stripe_events_created_at_check'
      and conrelid = 'public.stripe_events'::regclass
  ) then
    alter table public.stripe_events
      add constraint stripe_events_created_at_check
      check (event_created_at >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'stripe_events_status_check'
      and conrelid = 'public.stripe_events'::regclass
  ) then
    alter table public.stripe_events
      add constraint stripe_events_status_check
      check (status in ('pending', 'processed', 'ignored', 'failed')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'stripe_events_last_error_length_check'
      and conrelid = 'public.stripe_events'::regclass
  ) then
    alter table public.stripe_events
      add constraint stripe_events_last_error_length_check
      check (last_error is null or char_length(last_error) <= 1000) not valid;
  end if;
end $$;

create index if not exists stripe_events_status_received_at_idx
  on public.stripe_events (status, received_at);
create index if not exists stripe_events_received_at_idx
  on public.stripe_events (received_at desc);

alter table public.stripe_events enable row level security;
alter table public.stripe_events force row level security;

revoke all on table public.stripe_events from public, anon, authenticated, service_role;
grant select, insert, update on table public.stripe_events to service_role;

comment on table public.stripe_events is
  'Private, idempotent inbox for verified Stripe webhook delivery and processing state.';
comment on column public.stripe_events.object_id is
  'Stripe object identifier retained instead of the full webhook payload to minimise stored billing data.';
