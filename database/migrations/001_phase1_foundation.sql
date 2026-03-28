-- Phase 1 foundation migration for TalentSync
-- Backward-compatible with current Supabase tables in this repo

create extension if not exists "vector";

-- -----------------------------------------------------
-- Existing tables hardening (non-breaking)
-- -----------------------------------------------------

alter table if exists public.resumes
  add column if not exists resume_file_url text,
  add column if not exists parsed_json jsonb,
  add column if not exists created_at timestamptz default now();

update public.resumes
set parsed_json = content
where parsed_json is null and content is not null;

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

update public.jobs
set salary = coalesce(salary, salary_range),
    job_description = coalesce(job_description, description),
    source = coalesce(source, 'manual')
where true;

-- Keep compatibility with current code path using jobs.embedding
alter table if exists public.jobs
  add column if not exists embedding vector(1536);

-- Backfill long embedding column when legacy embedding exists
update public.jobs
set embeddings = embedding
where embeddings is null and embedding is not null;

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
