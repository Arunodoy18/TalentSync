-- Referral conversion attribution enhancements

alter table if exists public.referrals
  add column if not exists converted_at timestamptz,
  add column if not exists first_payment_id text;

create index if not exists idx_referrals_user_id on public.referrals(user_id);
create index if not exists idx_referrals_converted_at on public.referrals(converted_at);
