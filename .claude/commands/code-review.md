---
description: Review code changes against Suiviseries project conventions
---

# Code Review

Review code changes against Suiviseries project conventions.

For domain-specific rules not detailed below, consult the matching
`.claude/skills/<name>/SKILL.md` for the areas the diff touches — e.g.
`material-design-3`, `api-data-mapping`, `rxresource-patterns`, `angular-templates`,
`transloco-i18n`, `pwa-service-worker`, `scss-styling`. These skills hold rules not
fully repeated here.

## Checklist

### Architecture

- [ ] State lives in `providedIn: 'root'` services exposing signals — no `@ngrx/signals` store, no `BehaviorSubject` for shared state
- [ ] Services own HTTP + business logic; components consume signals
- [ ] HTTP calls check the `success` envelope, return a default on error, and notify via `NotificationService` (translation key)

### Components

- [ ] `changeDetection` NOT set (OnPush is the zoneless default; flag explicit `ChangeDetectionStrategy.OnPush`)
- [ ] `standalone: true` NOT set (default since Angular 19+)
- [ ] `styleUrl` (singular), separate template/style files
- [ ] `inject()` — no constructor injection
- [ ] `readonly` on all injected dependencies and signals
- [ ] Signal values accessed with function-call syntax: `this.value()`
- [ ] No `ChangeDetectorRef` / `markForCheck()`
- [ ] `input()` / `output()` functions, not decorators

### Templates

- [ ] Modern control flow `@if` / `@for` / `@switch` — not `*ngIf` / `*ngFor`
- [ ] `@for` has a stable `track`
- [ ] `class` / `style` bindings — not `ngClass` / `ngStyle`
- [ ] All user-facing text via Transloco keys — no hard-coded strings
- [ ] No function calls / `new Date()` / arrow functions in templates
- [ ] No redundant `tabindex` / `role` / `keydown` on Material directives

### Styles (Material Design 3)

- [ ] M3 tokens/CSS custom properties — not arbitrary values
- [ ] Elevation via `--md-sys-elevation-*`; radii per M3 shape scale
- [ ] Responsive via `respond-to()` / `respond-below()` mixins — not raw `@media`
- [ ] Hover effects guarded by `@media (hover: hover)`

### Data / API

- [ ] Models mirror backend snake_case (no invented camelCase aliases)
- [ ] Nullable fields (`poster_path`, `air_date`, …) guarded before use
- [ ] Reactive fetches use `rxResource` (skip request via `undefined` params)

### PWA (if touched)

- [ ] SW/push code feature-detects (`'serviceWorker' in navigator`, `Notification.permission`)
- [ ] Update/push side effects centralized in `UpdateService` / `PushNotificationService`

### Code Quality

- [ ] No `any` types
- [ ] No dead code (unused imports, variables, methods)
- [ ] English-only `//` comments (no JSDoc)
- [ ] `console.error()` in catch handlers — no empty functions

### Testing

- [ ] Vitest (not Jasmine/Karma)
- [ ] `getTranslocoTestingModule()` + `createMock*` factories — no inline Transloco module
- [ ] Signal assertions use function-call syntax
- [ ] Asserts against translation keys, not translated strings
