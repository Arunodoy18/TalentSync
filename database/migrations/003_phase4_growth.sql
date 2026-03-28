-- Phase 4 growth primitives

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  ref_code text not null,
  source text,
  campaign text,
  medium text,
  visitor_id text,
  user_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_referrals_ref_code on public.referrals(ref_code);
create index if not exists idx_referrals_created_at on public.referrals(created_at desc);
