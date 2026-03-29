# Event Catalog

## Payment Events

- payment.order.created
  - emitted by: Payment Service
  - consumed by: Analytics Service, Notification Service

- payment.captured
  - emitted by: Webhook Service
  - consumed by: Subscription Service, Analytics Service, Notification Service

- payment.failed
  - emitted by: Webhook Service
  - consumed by: Analytics Service, Notification Service

- subscription.activated
  - emitted by: Webhook Service
  - consumed by: Frontend entitlement refresh, Analytics Service

- subscription.cancelled
  - emitted by: Webhook Service
  - consumed by: Entitlements, Notification Service

## Scraping + Matching Events

- scraper.jobs.fetched
  - emitted by: Job Scraper Service
  - consumed by: Matching Engine

- matching.completed
  - emitted by: Matching Engine
  - consumed by: Notification Service, Analytics Service

## Auto-Apply Events

- autoapply.requested
  - emitted by: Backend API
  - consumed by: Auto Apply Service

- autoapply.completed
  - emitted by: Auto Apply Service
  - consumed by: Analytics Service, Notification Service

- autoapply.failed
  - emitted by: Auto Apply Service
  - consumed by: Analytics Service, Notification Service
