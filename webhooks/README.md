# Webhook Service

Architecture standard:
- Controller: transport + signature validation
- Service: business logic + idempotency
- Repository: database writes

Must-haves:
- HMAC verification
- Duplicate prevention using event ID
- Retry and dead-letter strategy
- Full payload logging
