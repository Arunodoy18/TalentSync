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
