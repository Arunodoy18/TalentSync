# Contributing to TalentSync

Thank you for contributing to TalentSync.

## Development Setup

1. Fork and clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` with required variables from `README.md`.
4. Start local dev server:

```bash
npm run dev
```

## Branching Strategy

- Use feature branches from `main`.
- Branch naming:
  - `feat/<short-description>`
  - `fix/<short-description>`
  - `chore/<short-description>`

## Commit Guidelines

Use clear commit messages. Conventional style is recommended:

- `feat: add ats share endpoint`
- `fix: handle webhook replay duplicate event`
- `docs: update architecture notes`

## Pull Request Guidelines

Before opening a PR:

1. Ensure lint passes:

```bash
npm run lint
```

2. Ensure type checks pass:

```bash
npx tsc --noEmit
```

3. Ensure production build works:

```bash
npm run build
```

4. Add tests or validation notes for your changes.
5. Update docs when behavior or architecture changes.

## Code Standards

- Prefer strict typing over `any`.
- Keep API responses explicit and stable.
- Never hardcode secrets.
- Preserve existing style in each file.
- Add concise comments only where logic is non-obvious.

## Database and Migrations

- Add new migrations under `database/migrations/`.
- Use incremental migration naming: `NNN_description.sql`.
- Document schema-impacting changes in `docs/PHASE_STATUS.md`.

## Security and Privacy

- Do not commit secrets, credentials, or user data.
- If you find a security issue, follow `SECURITY.md`.

## Release Notes

For impactful changes, include in PR:

- What changed
- Why it changed
- Rollback considerations
- Any required environment variable updates
