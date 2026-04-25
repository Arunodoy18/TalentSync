# API Surface

## Auth

- POST /auth/signup
- POST /auth/login
- POST /auth/logout

## Resume

- POST /resume/upload
- GET /resume/:id
- POST /resume/parse
- POST /resume/ats-score
- POST /resume/tailor

## Jobs

- GET /jobs/recommend
- GET /jobs/:id
- POST /jobs/save
- POST /api/jobs/seed
- POST /api/jobs/match

## Admin Jobs Sync

- POST /api/admin/jobs/sync
- GET /api/admin/jobs/sync
- GET /api/admin/jobs/sync?mode=status

## Matching

- POST /match/run
- GET /match/results

## Auto Apply

- POST /apply/auto
- GET /apply/status

## Payments

- POST /payment/create-order
- POST /payment/verify
- POST /payment/webhook

## Analytics

- GET /analytics/dashboard

## Notes

Current repository has equivalent routes under Next.js API handlers.
As part of microservices split, preserve these contracts via API gateway/BFF.
