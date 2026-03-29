# TalentSync

[![CI](https://github.com/Arunodoy18/TalentSync/actions/workflows/ci.yml/badge.svg)](https://github.com/Arunodoy18/TalentSync/actions/workflows/ci.yml)
[![Release](https://github.com/Arunodoy18/TalentSync/actions/workflows/release-please.yml/badge.svg)](https://github.com/Arunodoy18/TalentSync/actions/workflows/release-please.yml)

AI Career Operating System built with Next.js, Supabase, and OpenAI.

TalentSync helps job seekers move from resume creation to interview pipeline using:
- Resume parsing and structured editing
- ATS scoring with weighted breakdown
- Semantic job matching with explainability
- AI resume tailoring
- Career roadmap and skill-gap analysis
- Billing, subscriptions, referrals, and growth funnels

## Stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS
- Auth and data: Supabase (SSR + browser clients)
- AI: OpenAI (chat + embeddings)
- Billing: Razorpay (order, verify, webhook, replay)
- Analytics: referral and operations APIs + dashboard surfaces

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Create `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

OPENAI_API_KEY=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

INTERNAL_ADMIN_TOKEN=
OPS_ALERT_WEBHOOK_URL=
```

3. Run development server

```bash
npm run dev
```

4. Open app

`http://localhost:3000`

## Git Remote

This project is configured with:

- `origin`: `https://github.com/Arunodoy18/TalentSync.git`

## Core Product Surfaces

- Auth and onboarding: `/`
- Dashboard: `/dashboard`
- Jobs: `/dashboard/jobs`
- Analytics: `/dashboard/analytics`
- Pricing: `/pricing`
- ATS lead magnet: `/ats-checker`
- ATS shared result: `/ats-checker/share/:id`

## API Overview

### Resume and Career AI
- `POST /api/resume/parse`
- `POST /api/resume/tailor`
- `POST /api/resume/:id/ats`
- `POST /api/career/roadmap`
- `POST /api/career/skill-gap`
- `POST /api/career/portfolio`

### Jobs and Matching
- `POST /api/jobs/seed`
- `POST /api/jobs/match`

### Billing and Subscriptions
- `POST /api/billing/razorpay/order`
- `POST /api/billing/razorpay/verify`
- `POST /api/billing/razorpay/webhook`
- `POST /api/billing/razorpay/replay` (admin-token protected)
- `GET /api/billing/status`

### Growth and Analytics
- `POST /api/referrals/track`
- `GET /api/analytics/referrals`
- `POST /api/public/ats-check`
- `POST /api/public/ats-check/share`
- `GET /api/admin/analytics/overview` (admin-token protected)
- `GET /api/admin/ops/alerts` (admin-token protected)

## Database and Migrations

Production and migration files are in:

- `database/production_schema.sql`
- `database/migrations/001_phase1_foundation.sql`
- `database/migrations/002_phase3_billing_automation.sql`
- `database/migrations/003_phase4_growth.sql`
- `database/migrations/004_referral_conversion.sql`
- `database/migrations/005_ats_shares_and_replay.sql`
- `database/migrations/006_payments_reconciliation_and_event_outbox.sql`

Apply these in order for full feature coverage.

## Architecture Docs

- `docs/PRODUCTION_ARCHITECTURE.md`
- `docs/MICROSERVICES_IMPLEMENTATION.md`
- `docs/EVENT_CATALOG.md`
- `docs/API_SURFACE.md`
- `docs/PHASE_STATUS.md`
- `docs/RELEASE_PROCESS.md`
- `docs/BRANCH_PROTECTION.md`

## Operational Notes

- `INTERNAL_ADMIN_TOKEN` must be set for admin and replay endpoints.
- `OPS_ALERT_WEBHOOK_URL` can be set to dispatch warning/critical admin ops alerts to an external webhook sink.
- Webhook verification depends on `RAZORPAY_WEBHOOK_SECRET`.
- Billing and admin endpoints rely on `SUPABASE_SERVICE_ROLE_KEY`.
- This workspace currently ignores type and eslint build failures in `next.config.ts`; remove those flags before strict production release.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Recommended Next Steps

- Add alert delivery sink (email/slack/webhook) for ops alerts
- Add internal admin UI for protected analytics endpoints

## Repository Standards

- Contribution guide: `CONTRIBUTING.md`
- Code of conduct: `CODE_OF_CONDUCT.md`
- Security policy: `SECURITY.md`
- PR template: `.github/pull_request_template.md`
- Issue templates: `.github/ISSUE_TEMPLATE/`
- Code owners: `.github/CODEOWNERS`
- CI workflow: `.github/workflows/ci.yml`
- Commitlint workflow: `.github/workflows/commitlint.yml`
- Release workflow: `.github/workflows/release-please.yml`
- Release config: `release-please-config.json` and `.release-please-manifest.json`
- Commitlint config: `commitlint.config.cjs`
