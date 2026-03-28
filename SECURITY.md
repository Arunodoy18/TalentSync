# Security Policy

## Reporting a Vulnerability

If you discover a security issue, do not open a public issue.

Please report privately with:

- Vulnerability description
- Impact assessment
- Reproduction steps
- Potential mitigation

Until a private contact mailbox is configured, use repository maintainers' private channels.

## Response Targets

- Initial acknowledgment: within 72 hours
- Triage decision: within 7 days
- Fix timeline: based on severity

## Supported Security Areas

- Authentication and session handling
- Billing and webhook verification
- Admin-token protected endpoints
- Data access control and sensitive PII handling
- Dependency vulnerabilities

## Security Best Practices for Contributors

- Never commit `.env` files or secrets.
- Use least-privilege credentials.
- Validate and sanitize request inputs.
- Use timing-safe comparisons for signatures.
- Prefer server-side verification for payment flows.

## Disclosure

Coordinated disclosure is expected. Please allow maintainers time to validate and patch before public disclosure.
