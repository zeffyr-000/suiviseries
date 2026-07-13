---
name: github-actions
description: CI conventions for Suiviseries — the PR Check workflow (lint, production build, bundle-size gate) running on a Node version matrix, and npm ci --legacy-peer-deps. Use when editing .github/workflows/**.
---

# GitHub Actions CI

## PR Check (`.github/workflows/pr-check.yml`)

Runs on `pull_request` targeting `main`, across a Node version matrix (`22.22.3`, `24.x`):

1. Checkout
2. Setup Node (`cache: 'npm'`)
3. `npm ci --legacy-peer-deps`
4. `npm run lint`
5. `npm run build -- --configuration production`
6. Bundle-size check — fails if `dist/suiviseries` is missing

## Conventions

- **Always** install with `npm ci --legacy-peer-deps` (the project relies on it for peer-dep resolution)
- Keep the Node matrix aligned with `package.json` `engines` (v22.22.3+, v24.15.0+, v26.0.0+)
- Pin action versions (`actions/checkout@v4`, `actions/setup-node@v4`)
- Enable npm caching via `actions/setup-node` `cache: 'npm'`
- The production build must stay green — lint and build are the gate for merging

## Claude Code Review Workflows

Two AI-review workflows use `anthropics/claude-code-action@v1` (require the `CLAUDE_CODE_OAUTH_TOKEN` secret):

- `claude-code-review.yml` — runs on `pull_request` to `main`; skips drafts/Dependabot; reads review rules from the **base** branch (a PR cannot weaken its own rules); picks Sonnet or Opus by PR size/sensitivity; posts a summary + inline suggestions. `permissions: contents: read, pull-requests: write, id-token: write`.
- `claude-review-reply.yml` — `pull_request_review_comment` / `issue_comment`; replies only when a human `OWNER`/`MEMBER`/`COLLABORATOR` mentions `@claude`; discuss-only (`contents: read`, no commits). Note: comment-triggered workflows run from the **default branch** definition, so edits take effect only once merged to `main`.

When editing these: keep base-branch rule reading, the draft/Dependabot skip, `concurrency` cancellation, and least-privilege `permissions` intact — they are security-critical.

## Adding Steps

- Unit tests: `npm run test:coverage` (Vitest, headless) — safe to add to CI
- E2E: `npm run e2e` needs the dev server; Playwright's `webServer` auto-starts it, and browsers must be installed (`npx playwright install --with-deps chromium`)
- Add jobs rather than overloading the existing `test` job when concerns differ (build vs e2e)
