# Branch Protection Policy (main)

This document defines recommended GitHub branch protection settings for `main`.

## Required Settings

1. Require a pull request before merging
- Require approvals: 1 minimum
- Dismiss stale approvals when new commits are pushed
- Require review from Code Owners

2. Require status checks to pass before merging
- `CI / build-and-validate`
- `Commitlint / commitlint`
- CI lint is warning-free (`npm run lint -- --max-warnings=0`)

3. Require branches to be up to date before merging
- Enable this to avoid merging stale branches

4. Require conversation resolution before merging

5. Restrict force pushes
- Disable force push on `main`

6. Restrict deletions
- Prevent branch deletion

## Optional Hardening

- Require signed commits
- Require linear history
- Lock branch (for freeze windows)

## Admin and Bypass

- Keep bypass list minimal
- Avoid broad admin bypass for routine changes

## Setup Steps

1. Open repository settings.
2. Go to `Branches`.
3. Add rule for `main`.
4. Apply all required settings above.
5. Save changes.

## Notes

- `CODEOWNERS` controls reviewer ownership.
- CI workflows must stay green for merges.
- If new workflows are added, include them in required checks.
