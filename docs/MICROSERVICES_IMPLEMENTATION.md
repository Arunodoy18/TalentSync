# TalentSync Microservices Implementation Blueprint

This document maps the target production architecture and the implementation shape for each service.

## Service Topology

- Frontend: Next.js App Router
- Backend API: Node.js BFF
- AI Service: Python (FastAPI)
- Matching Engine: Python + vector index (pgvector/Pinecone)
- Job Scraper Service: Python (Scrapy + Playwright)
- Auto Apply Service: Python (Playwright workers)
- Payment Service: Node.js Razorpay integration
- Webhook Service: controller -> service -> repository architecture
- Notification Service: Email/SMS/Push fan-out
- Analytics Service: Aggregations + dashboard APIs
- Admin Panel: role-protected operations UI

## Event-Driven Domains

Use Redis stream or queue topics for asynchronous boundaries.

- payment.order.created
- payment.captured
- payment.failed
- subscription.activated
- subscription.cancelled
- scraper.jobs.fetched
- scraper.jobs.normalized
- matching.completed
- autoapply.requested
- autoapply.completed
- autoapply.failed
- notification.requested

## Webhook Processing Standard

1. Controller validates signature and payload shape.
2. Service applies idempotency and business rules.
3. Repository updates transactional tables.
4. Outbox event is written for async fan-out.
5. Webhook log is persisted with final status.

## Data Requirements

Mandatory payment durability tables:

- payments
- payment_transactions
- refunds
- webhook_logs
- subscriptions
- event_outbox

## Deployment Targets

- Frontend: Vercel
- Backend/API services: AWS EC2 or ECS
- PostgreSQL: AWS RDS
- Vector DB: Pinecone or pgvector
- Object storage: AWS S3
- Queue: Redis
- Worker runtime: Celery/RQ/BullMQ
- Monitoring: Grafana + Prometheus
- Central logs: ELK/OpenSearch

## SLO / Reliability Baseline

- API availability: >= 99.9%
- Webhook processing success: >= 99.95%
- At-least-once event delivery with idempotent consumers
- Dead-letter queue for repeated processing failures

## Security Baseline

- JWT auth for APIs
- RBAC for admin operations
- HMAC SHA256 verification for payment webhooks
- Encryption at rest and in transit
- PCI-DSS aligned handling (tokenized payments, no card storage)
- Request-level audit logs for privileged endpoints
