# CLAUDE.md — Suiviseries

> Entry point for **Claude Code**. The detailed conventions live in **[`AGENTS.md`](AGENTS.md)** — read it first.
> This file only maps the Claude Code ecosystem for the repo.

## Source of Truth

**[`AGENTS.md`](AGENTS.md)** is the single source of truth for architecture, rules, and patterns
(tech stack, services vs signals, rxResource, Material Design 3, testing, i18n, PWA, etc.).
Read it before any code change. `llms.txt` is a condensed variant for other LLM tooling.

## Skills (`.claude/skills/`)

Domain guides loaded on demand — Claude Code picks the relevant one from its description.

| Skill                    | When it applies                                   |
| ------------------------ | ------------------------------------------------- |
| `angular-components`     | Editing `*.component.ts`                          |
| `angular-templates`      | Editing `*.html` templates                        |
| `angular-services`       | Editing `src/app/services/**`                     |
| `rxresource-patterns`    | Reactive data fetching with `rxResource`          |
| `typescript-conventions` | Any `*.ts` file                                   |
| `material-design-3`      | Angular Material / M3 markup, theming, components |
| `scss-styling`           | Editing `*.scss` (M3 tokens, theme, utilities)    |
| `api-data-mapping`       | Backend snake_case ↔ frontend model mapping       |
| `transloco-i18n`         | Translations and `MessageFormat` pluralization    |
| `pwa-service-worker`     | Service worker, push notifications, app updates   |
| `vitest-testing`         | `*.spec.ts` unit tests                            |
| `e2e-playwright`         | `e2e/**` Playwright tests                         |
| `github-actions`         | `.github/workflows/**` CI                         |

## Subagents (`.claude/agents/`)

| Agent               | Purpose                                                             |
| ------------------- | ------------------------------------------------------------------- |
| `angular-migration` | Modernize legacy code to signals / OnPush / zoneless / control flow |
| `pwa-debug`         | Debug service worker, Web Push, and app-update flows                |
| `test-debug`        | Diagnose failing Vitest unit tests and Playwright E2E specs         |

## Slash commands (`.claude/commands/`)

`/create-component` · `/create-service` · `/create-test` · `/create-e2e-test` ·
`/refactor-to-signals` · `/debug-performance` · `/code-review`

## Hooks (`.claude/settings.json`)

`PostToolUse` on `Edit|Write|MultiEdit` runs `prettier --write` then `eslint --fix`
on the touched `*.{ts,html,scss,css,json,md}` file.

## CI code review (`.github/workflows/`)

- `claude-code-review.yml` — automatic Claude review on every PR to `main`; reads the
  review rules from the **base** branch (`AGENTS.md`, `code-review.md`, skills) and
  escalates Sonnet→Opus on large/sensitive PRs. Posts a summary + inline suggestions.
- `claude-review-reply.yml` — discuss-only `@claude` replies inside PR review threads
  (never edits files).

Both require the `CLAUDE_CODE_OAUTH_TOKEN` repository secret.

## Everyday commands

```bash
npm start             # Dev server with API proxy (http://localhost:4200)
npm test              # Vitest watch
npm run test:coverage # Coverage (target ≥ 80%)
npm run lint          # ESLint
npm run build         # Production build
npm run e2e           # Playwright E2E
```
