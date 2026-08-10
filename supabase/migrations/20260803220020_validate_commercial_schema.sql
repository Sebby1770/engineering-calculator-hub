-- Finalise commercial-schema hardening after the restored prototype tables
-- have been normalised. Fresh installations retain the standalone unique
-- indexes created by the hardening migration; restored installations prefer
-- their existing constraint-backed indexes and remove only exact duplicates.

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'donations_stripe_session_id_key'
      and conrelid = 'public.donations'::regclass
      and contype = 'u'
  ) and to_regclass('public.donations_stripe_session_id_uidx') is not null then
    drop index public.donations_stripe_session_id_uidx;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'profiles_stripe_customer_id_key'
      and conrelid = 'public.profiles'::regclass
      and contype = 'u'
  ) and to_regclass('public.profiles_stripe_customer_id_uidx') is not null then
    drop index public.profiles_stripe_customer_id_uidx;
  end if;
end $$;

-- The preceding migrations add these checks as NOT VALID so legacy rows can
-- be normalised first. Validation now proves every existing row satisfies the
-- same rules that already protect new writes.
alter table public.profiles
  validate constraint profiles_email_length_check;
alter table public.profiles
  validate constraint profiles_subscription_status_check;

alter table public.donations
  validate constraint donations_amount_total_check;
alter table public.donations
  validate constraint donations_currency_check;

alter table public.feedback
  validate constraint feedback_message_length_check;
alter table public.feedback
  validate constraint feedback_email_length_check;

alter table public.stripe_events
  validate constraint stripe_events_event_id_length_check;
alter table public.stripe_events
  validate constraint stripe_events_event_type_length_check;
alter table public.stripe_events
  validate constraint stripe_events_object_id_length_check;
alter table public.stripe_events
  validate constraint stripe_events_created_at_check;
alter table public.stripe_events
  validate constraint stripe_events_status_check;
alter table public.stripe_events
  validate constraint stripe_events_last_error_length_check;
