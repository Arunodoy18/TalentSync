-- Phase 8: jobs sync run metrics

create table if not exists public.job_sync_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'remoteok',
  status text not null check (status in ('success', 'failed')),
  inserted_count integer not null default 0 check (inserted_count >= 0),
  skipped_count integer not null default 0 check (skipped_count >= 0),
  embedding_failures integer not null default 0 check (embedding_failures >= 0),
  triggered_by text not null default 'admin-cron',
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_job_sync_runs_created_at
  on public.job_sync_runs(created_at desc);

create index if not exists idx_job_sync_runs_status
  on public.job_sync_runs(status, created_at desc);
