# Release Process

TalentSync uses Release Please to automate semantic releases on `main`.

## How It Works

1. Commits land on `main`.
2. GitHub Action `.github/workflows/release-please.yml` runs.
3. Release Please opens or updates a release PR:
   - bumps version
   - updates `CHANGELOG.md`
   - prepares release notes
4. When that PR is merged, Release Please creates:
   - git tag
   - GitHub Release

## Commit Message Guidance

Use conventional commit prefixes for predictable versioning:

- `feat:` -> minor bump
- `fix:` -> patch bump
- `docs:`, `chore:`, `refactor:` -> no bump unless configured

Breaking changes:

- include `!` in type (`feat!:`) or
- include `BREAKING CHANGE:` in commit body

## Manual Trigger

The workflow also supports `workflow_dispatch` in GitHub Actions.

## Files

- Workflow: `.github/workflows/release-please.yml`
- Config: `release-please-config.json`
- Manifest: `.release-please-manifest.json`

## Notes

- Ensure repository Actions permission allows write access to contents and pull requests.
- `GITHUB_TOKEN` is used by default in GitHub-hosted runs.
