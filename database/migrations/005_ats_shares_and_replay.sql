-- ATS share links and operational webhook replay support

create table if not exists public.ats_share_results (
  id uuid primary key default gen_random_uuid(),
  score numeric(5,2) not null,
  breakdown jsonb not null default '{}'::jsonb,
  missing_skills text[] not null default '{}',
  suggestions text[] not null default '{}',
  created_by_user_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_ats_share_results_created_at on public.ats_share_results(created_at desc);

alter table if exists public.payment_events
  add column if not exists replayed_at timestamptz,
  add column if not exists replay_status text,
  add column if not exists replay_error text;
