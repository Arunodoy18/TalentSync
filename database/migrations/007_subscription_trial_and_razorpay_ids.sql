-- Phase 7: subscription trial + Razorpay subscription metadata

alter table if exists public.subscriptions
  add column if not exists plan_name text,
  add column if not exists plan_id text,
  add column if not exists subscription_id text,
  add column if not exists trial_end timestamptz,
  add column if not exists next_billing_date timestamptz;

create unique index if not exists idx_subscriptions_subscription_id
  on public.subscriptions(subscription_id)
  where subscription_id is not null;

create index if not exists idx_subscriptions_trial_end
  on public.subscriptions(trial_end);

create index if not exists idx_subscriptions_user_status
  on public.subscriptions(user_id, status);
