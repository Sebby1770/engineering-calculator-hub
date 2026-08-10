-- Donations recorded by the Stripe webhook (server-only access via service role).
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  amount_total integer,
  currency text,
  payment_status text,
  created_at timestamptz not null default now()
);

-- Visitor feedback submitted through /api/feedback (server-only access via service role).
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(message) between 10 and 2000),
  email text check (email is null or char_length(email) <= 320),
  page text check (page is null or (page like '/%' and char_length(page) <= 200)),
  created_at timestamptz not null default now()
);

-- Lock both tables down hard:
-- 1) RLS on with no policies = anon/authenticated are denied every row operation.
alter table public.donations enable row level security;
alter table public.feedback enable row level security;

-- 2) Belt and braces: revoke table privileges from client roles entirely.
revoke all on table public.donations from anon, authenticated;
revoke all on table public.feedback from anon, authenticated;

comment on table public.donations is 'Stripe checkout sessions recorded by the webhook. Written only via service role from the server.';
comment on table public.feedback is 'Visitor feedback from /api/feedback. Written only via service role from the server.';
