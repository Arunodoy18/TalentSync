-- TalentSync production database schema
-- PostgreSQL 15+ with pgvector

create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- =====================================================
-- Core Users and Auth Profile
-- =====================================================

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null unique,
  password_hash text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'auto_apply', 'lifetime')),
  credits integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional link table if using external auth provider IDs
create table if not exists user_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  provider text not null,
  provider_user_id text not null,
  created_at timestamptz not null default now(),
  unique(provider, provider_user_id)
);

-- =====================================================
-- Resume Domain
-- =====================================================

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text,
  resume_file_url text,
  parsed_json jsonb not null default '{}'::jsonb,
  ats_score numeric(5,2),
  is_base boolean not null default false,
  parent_resume_id uuid references resumes(id) on delete set null,
  target_job_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists resume_data (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null unique references resumes(id) on delete cascade,
  skills text[] not null default '{}',
  education jsonb not null default '[]'::jsonb,
  experience jsonb not null default '[]'::jsonb,
  projects jsonb not null default '[]'::jsonb,
  embeddings vector(3072),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_resumes_user_id on resumes(user_id);
create index if not exists idx_resumes_target_job_id on resumes(target_job_id);

-- =====================================================
-- Jobs and Matching
-- =====================================================

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location text,
  salary text,
  job_description text not null,
  skills_required text[] not null default '{}',
  source text not null check (source in ('linkedin', 'indeed', 'glassdoor', 'naukri', 'manual')),
  job_url text,
  embeddings vector(3072),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_jobs_source on jobs(source);
create index if not exists idx_jobs_created_at on jobs(created_at desc);

create table if not exists job_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  resume_id uuid references resumes(id) on delete set null,
  match_score numeric(5,2) not null,
  semantic_score numeric(5,2),
  missing_skills text[] not null default '{}',
  status text not null default 'not_applied' check (status in ('not_applied', 'queued', 'applied', 'skipped', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, job_id, resume_id)
);

create index if not exists idx_job_matches_user_id on job_matches(user_id);
create index if not exists idx_job_matches_status on job_matches(status);
create index if not exists idx_job_matches_score on job_matches(match_score desc);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  resume_version uuid references resumes(id) on delete set null,
  cover_letter text,
  application_status text not null default 'draft' check (
    application_status in (
      'draft',
      'queued',
      'submitted',
      'under_review',
      'interview',
      'offer',
      'rejected',
      'failed'
    )
  ),
  applied_at timestamptz,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_applications_user_id on applications(user_id);
create index if not exists idx_applications_status on applications(application_status);
create index if not exists idx_applications_job_id on applications(job_id);

-- =====================================================
-- Billing
-- =====================================================

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  amount integer not null,
  plan text not null check (plan in ('free', 'pro', 'auto_apply', 'lifetime')),
  status text not null check (status in ('created', 'authorized', 'captured', 'failed', 'refunded')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payments_user_id on payments(user_id);
create index if not exists idx_payments_status on payments(status);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  plan text not null check (plan in ('free', 'pro', 'auto_apply', 'lifetime')),
  start_date timestamptz not null,
  end_date timestamptz,
  status text not null check (status in ('active', 'expired', 'cancelled', 'trial')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_status on subscriptions(status);

-- =====================================================
-- Analytics
-- =====================================================

create table if not exists analytics (
  user_id uuid primary key references users(id) on delete cascade,
  applications_sent integer not null default 0,
  interviews integer not null default 0,
  responses integer not null default 0,
  rejections integer not null default 0,
  resume_score numeric(5,2),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- Optional supporting tables for operational scale
-- =====================================================

create table if not exists llm_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  feature text not null,
  model text not null,
  input_tokens integer,
  output_tokens integer,
  latency_ms integer,
  status text not null default 'ok',
  created_at timestamptz not null default now()
);

create index if not exists idx_llm_events_feature on llm_events(feature);
create index if not exists idx_llm_events_created_at on llm_events(created_at desc);

create table if not exists automation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  application_id uuid references applications(id) on delete set null,
  provider text not null default 'playwright',
  status text not null check (status in ('queued', 'running', 'submitted', 'failed', 'manual_review')),
  error_message text,
  artifacts jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_automation_runs_user_id on automation_runs(user_id);
create index if not exists idx_automation_runs_status on automation_runs(status);

-- =====================================================
-- Updated-at trigger helper
-- =====================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at before update on users
for each row execute function set_updated_at();

drop trigger if exists trg_resumes_updated_at on resumes;
create trigger trg_resumes_updated_at before update on resumes
for each row execute function set_updated_at();

drop trigger if exists trg_resume_data_updated_at on resume_data;
create trigger trg_resume_data_updated_at before update on resume_data
for each row execute function set_updated_at();

drop trigger if exists trg_jobs_updated_at on jobs;
create trigger trg_jobs_updated_at before update on jobs
for each row execute function set_updated_at();

drop trigger if exists trg_job_matches_updated_at on job_matches;
create trigger trg_job_matches_updated_at before update on job_matches
for each row execute function set_updated_at();

drop trigger if exists trg_applications_updated_at on applications;
create trigger trg_applications_updated_at before update on applications
for each row execute function set_updated_at();

drop trigger if exists trg_payments_updated_at on payments;
create trigger trg_payments_updated_at before update on payments
for each row execute function set_updated_at();

drop trigger if exists trg_subscriptions_updated_at on subscriptions;
create trigger trg_subscriptions_updated_at before update on subscriptions
for each row execute function set_updated_at();

-- =====================================================
-- Vector similarity function example (resume -> jobs)
-- Requires pgvector cosine operators
-- =====================================================

create or replace function match_jobs(
  query_embedding vector(3072),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  title text,
  company text,
  location text,
  salary text,
  job_description text,
  skills_required text[],
  source text,
  job_url text,
  similarity float
)
language sql stable as $$
  select
    j.id,
    j.title,
    j.company,
    j.location,
    j.salary,
    j.job_description,
    j.skills_required,
    j.source,
    j.job_url,
    1 - (j.embeddings <=> query_embedding) as similarity
  from jobs j
  where j.embeddings is not null
    and (1 - (j.embeddings <=> query_embedding)) >= match_threshold
  order by j.embeddings <=> query_embedding
  limit match_count;
$$;
