-- Phase 3 billing automation hardening

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_payment_events_type on public.payment_events(event_type);
create index if not exists idx_payment_events_created_at on public.payment_events(created_at desc);
