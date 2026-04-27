-- Ensure resume scoring fields exist in environments created from incremental migrations.
alter table if exists public.resumes
  add column if not exists ats_score numeric(5,2),
  add column if not exists feedback jsonb;
