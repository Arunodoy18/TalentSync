-- BEGIN 001_phase1_foundation.sql
-- Phase 1 foundation migration for TalentSync
-- Backward-compatible with current Supabase tables in this repo

create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- -----------------------------------------------------
-- Fresh project baseline tables (safe no-op if existing)
-- -----------------------------------------------------

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  plan text not null default 'free' check (plan in ('free', 'pro', 'auto_apply', 'lifetime')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text,
  content jsonb,
  is_base boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text,
  company text,
  location text,
  salary_range text,
  description text,
  job_type text,
  url text,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  job_id uuid,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------
-- Existing tables hardening (non-breaking)
-- -----------------------------------------------------

alter table if exists public.resumes
  add column if not exists resume_file_url text,
  add column if not exists parsed_json jsonb,
  add column if not exists created_at timestamptz default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'resumes'
      and column_name = 'content'
  ) then
    execute 'update public.resumes set parsed_json = content where parsed_json is null and content is not null';
  end if;
end
$$;

alter table if exists public.resumes
  alter column parsed_json set default '{}'::jsonb;

alter table if exists public.jobs
  add column if not exists salary text,
  add column if not exists job_description text,
  add column if not exists skills_required text[] default '{}',
  add column if not exists source text default 'manual',
  add column if not exists embeddings vector(1536),
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'jobs'
      and column_name = 'salary_range'
  )
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'jobs'
      and column_name = 'description'
  ) then
    execute 'update public.jobs set salary = coalesce(salary, salary_range), job_description = coalesce(job_description, description), source = coalesce(source, ''manual'')';
  else
    execute 'update public.jobs set source = coalesce(source, ''manual'')';
  end if;
end
$$;

-- Keep compatibility with current code path using jobs.embedding
alter table if exists public.jobs
  add column if not exists embedding vector(1536);

-- Backfill long embedding column when legacy embedding exists
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'jobs'
      and column_name = 'embedding'
  ) then
    execute 'update public.jobs set embeddings = embedding where embeddings is null and embedding is not null';
  end if;
end
$$;

alter table if exists public.job_applications
  add column if not exists resume_version uuid,
  add column if not exists cover_letter text,
  add column if not exists application_status text default 'draft',
  add column if not exists applied_at timestamptz,
  add column if not exists updated_at timestamptz default now();

-- -----------------------------------------------------
-- New production tables
-- -----------------------------------------------------

create table if not exists public.job_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  job_id uuid not null references public.jobs(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  match_score numeric(5,2) not null,
  semantic_score numeric(5,2),
  missing_skills text[] not null default '{}',
  status text not null default 'not_applied' check (status in ('not_applied', 'queued', 'applied', 'skipped', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, job_id, resume_id)
);

create index if not exists idx_job_matches_user_id on public.job_matches(user_id);
create index if not exists idx_job_matches_score on public.job_matches(match_score desc);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  amount integer not null,
  plan text not null check (plan in ('free', 'pro', 'auto_apply', 'lifetime')),
  status text not null check (status in ('created', 'authorized', 'captured', 'failed', 'refunded')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payments_user_id on public.payments(user_id);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  plan text not null check (plan in ('free', 'pro', 'auto_apply', 'lifetime')),
  start_date timestamptz not null,
  end_date timestamptz,
  status text not null check (status in ('active', 'expired', 'cancelled', 'trial')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics (
  user_id uuid primary key,
  applications_sent integer not null default 0,
  interviews integer not null default 0,
  responses integer not null default 0,
  rejections integer not null default 0,
  resume_score numeric(5,2),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------
-- Utility trigger for updated_at
-- -----------------------------------------------------

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_resumes_updated_at on public.resumes;
create trigger trg_resumes_updated_at
before update on public.resumes
for each row execute function public.set_updated_at();

drop trigger if exists trg_jobs_updated_at on public.jobs;
create trigger trg_jobs_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

drop trigger if exists trg_job_applications_updated_at on public.job_applications;
create trigger trg_job_applications_updated_at
before update on public.job_applications
for each row execute function public.set_updated_at();

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

-- -----------------------------------------------------
-- Updated match function (supports existing jobs columns)
-- -----------------------------------------------------

create or replace function public.match_jobs(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  company text,
  location text,
  salary_range text,
  description text,
  job_type text,
  url text,
  similarity float
)
language sql stable as $$
  select
    j.id,
    j.title,
    j.company,
    j.location,
    j.salary_range,
    j.description,
    j.job_type,
    j.url,
    1 - (j.embedding <=> query_embedding) as similarity
  from public.jobs j
  where j.embedding is not null
    and (1 - (j.embedding <=> query_embedding)) >= match_threshold
  order by j.embedding <=> query_embedding
  limit match_count;
$$;
-- END 001_phase1_foundation.sql

-- BEGIN 002_phase3_billing_automation.sql
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
-- END 002_phase3_billing_automation.sql

-- BEGIN 003_phase4_growth.sql
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
-- END 003_phase4_growth.sql

-- BEGIN 004_referral_conversion.sql
-- Referral conversion attribution enhancements

alter table if exists public.referrals
  add column if not exists converted_at timestamptz,
  add column if not exists first_payment_id text;

create index if not exists idx_referrals_user_id on public.referrals(user_id);
create index if not exists idx_referrals_converted_at on public.referrals(converted_at);
-- END 004_referral_conversion.sql

-- BEGIN 005_ats_shares_and_replay.sql
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
-- END 005_ats_shares_and_replay.sql

-- BEGIN 006_payments_reconciliation_and_event_outbox.sql
-- Phase 6: production payment reconciliation + webhook durability + event outbox

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments(id) on delete set null,
  razorpay_order_id text,
  razorpay_payment_id text,
  event_id text not null,
  event_type text not null,
  amount integer,
  currency text not null default 'INR',
  status text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(event_id)
);

create index if not exists idx_payment_transactions_payment_id on public.payment_transactions(payment_id);
create index if not exists idx_payment_transactions_order_id on public.payment_transactions(razorpay_order_id);
create index if not exists idx_payment_transactions_event_type on public.payment_transactions(event_type);
create index if not exists idx_payment_transactions_created_at on public.payment_transactions(created_at desc);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  razorpay_refund_id text not null unique,
  amount integer not null,
  status text not null,
  reason text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_refunds_user_id on public.refunds(user_id);
create index if not exists idx_refunds_payment_id on public.refunds(payment_id);
create index if not exists idx_refunds_status on public.refunds(status);

create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  event_type text not null,
  source text not null default 'razorpay',
  payload jsonb not null default '{}'::jsonb,
  signature_valid boolean not null default false,
  status text not null default 'received' check (status in ('received', 'processed', 'failed', 'duplicate', 'ignored')),
  retry_count integer not null default 0,
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(event_id, source)
);

create index if not exists idx_webhook_logs_event_type on public.webhook_logs(event_type);
create index if not exists idx_webhook_logs_status on public.webhook_logs(status);
create index if not exists idx_webhook_logs_created_at on public.webhook_logs(created_at desc);

create table if not exists public.event_outbox (
  id uuid primary key default gen_random_uuid(),
  aggregate_type text not null,
  aggregate_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'published', 'failed')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_event_outbox_pending on public.event_outbox(status, available_at);
create index if not exists idx_event_outbox_event_type on public.event_outbox(event_type);

-- Keep refunds.updated_at current.
drop trigger if exists trg_refunds_updated_at on public.refunds;
create trigger trg_refunds_updated_at before update on public.refunds
for each row execute function set_updated_at();
-- END 006_payments_reconciliation_and_event_outbox.sql

