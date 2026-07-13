# AGENTS.md — Suiviseries

> Single source of truth for architecture, conventions, and patterns.
> Read this before any code change. `CLAUDE.md` maps the Claude Code ecosystem; `llms.txt` is a condensed variant for other LLM tooling.

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Stack

- **Angular 22** — standalone, **zoneless** (`provideZonelessChangeDetection`), signals
- **Angular Material 22** + **CDK** — Material Design 3 (M3), **NOT Bootstrap**
- **TypeScript 6** — strict typing
- **RxJS 7** — HTTP + `rxResource`
- **Transloco 8** + MessageFormat — i18n (`fr` primary)
- **Vitest 4** — unit tests (via `ng test`), **NOT Jasmine/Karma**
- **Playwright 1.x** — E2E
- **Service Worker** (`@angular/service-worker`) — PWA + Web Push notifications
- **ngx-google-analytics** — analytics
- Backend: separate PHP API (`suiviseries-api`), TMDB data source

## Architecture Overview

Suiviseries is an Angular 22 PWA for **TV series tracking** with Google OAuth authentication. Users search TMDB-backed series, follow them, and track watched seasons/episodes. There is **no SSR** and **no `@ngrx/signals` store** — state lives in `providedIn: 'root'` services exposing signals.

### Data Flow

```
Google OAuth → AuthService → JWT token → authInterceptor → Backend API (/api/*)
                                                              ↓
                          SeriesService ← HTTP responses ←────┘
```

### Key Services (`src/app/services/`)

- **AuthService** — Google OAuth, JWT in `localStorage`, user state via signals
- **SeriesService** — REST calls to `/api/*`, caches user series, `rxResource` for search
- **MetadataService** — series detail/season/episode metadata
- **NotificationService** — wrapper around `MatSnackBar` using translation keys
- **UserNotificationService** — real-time notification state with signals
- **PushNotificationService** — Web Push subscription lifecycle
- **UpdateService** — service-worker update prompts (`SwUpdate`)
- **KeepAliveService** — keeps the backend session warm
- **AnalyticsRouterService** — GA page-view tracking on route change

### Routing (`app.routes.ts`)

Lazy-loaded routes with `loadComponent`. `authGuard` protects `/my-series` and other authenticated routes.

```typescript
// authGuard redirects unauthenticated users to home with the login dialog
router.navigate(['/'], { queryParams: { returnUrl: state.url, login: 'true' } });
```

### API Proxy (Development)

Calls to `/api/*` are proxied to `http://localhost:8888/suiviseries-api/www/` via `proxy.conf.json`.

## Developer Commands

```bash
npm start           # Dev server with API proxy (http://localhost:4200)
npm test            # Vitest unit tests
npm run test:coverage # Coverage (target ≥ 80%)
npm run e2e         # Playwright E2E tests
npm run e2e:ui      # Playwright UI mode
npm run lint        # ESLint
npm run format      # Prettier
npm run build       # Production build
```

> Node.js v22.22.3+, v24.15.0+, or v26.0.0+ required.

## Angular Patterns

### Component Structure

```typescript
@Component({
  selector: 'app-example',
  imports: [TranslocoModule, MatButtonModule], // standalone by default in v22+
  templateUrl: './example.component.html', // ALWAYS separate files
  styleUrl: './example.component.scss', // singular
  // Zoneless app: omitting changeDetection is safe (signal-driven scheduling).
  // Prefer OnPush if setting explicitly.
})
export class ExampleComponent {
  readonly data = input.required<Data>(); // input(), not @Input()
  protected readonly derived = computed(() => this.data().value);
}
```

### Component Rules

- Must NOT set `standalone: true` — it is the default in Angular v22+
- Do NOT set `changeDetection` — OnPush is the zoneless default; add `ChangeDetectionStrategy.OnPush` only when setting explicitly, never `.markForCheck()`
- Use `input()`, `output()` functions instead of decorators; `computed()` for derived state
- **ALWAYS separate files** for templates/styles — never inline
- Use `inject()` — never constructor injection
- `readonly` on all injected dependencies and signals
- Use the `host` object in the decorator instead of `@HostBinding`/`@HostListener`

### Services

- Use `providedIn: 'root'` for singletons, `inject()` instead of constructor injection
- Expose signals with the `_private` pattern: `private readonly _state = signal<T>()` / `readonly state = this._state.asReadonly()`
- Use `set()` or `update()` on signals — NOT `mutate()`
- Services hold HTTP + business logic; components consume signals

### rxResource Pattern (Angular 22+)

For reactive data fetching with automatic request cancellation, expose an `rxResource` factory from a **service**:

```typescript
// In service — exposes a resource factory
createSearchResource(): SearchResource {
  const query = signal('');
  const resource = rxResource<Serie[], string | undefined>({
    params: () => {
      const q = query().trim();
      return q.length >= 2 ? q : undefined; // undefined skips the request
    },
    stream: ({ params: q }) => (q ? this.searchSeries(q) : of([])),
  });
  return {
    results: computed(() => resource.value() ?? []),
    isLoading: resource.isLoading,
    error: resource.error,
    hasValue: computed(() => resource.hasValue()),
    query,
  };
}
```

```typescript
// In component — consumes the resource
private readonly searchResource = this.seriesService.createSearchResource();
protected readonly results = computed(() => this.searchResource.results());
protected readonly loading = computed(() => this.searchResource.isLoading());
```

Benefits: automatic cancellation (like `switchMap`), built-in `isLoading`/`error`/`hasValue` signals, data-fetching stays in the service.

### HTTP Error Handling Pattern

All HTTP calls return an empty/default value on error and notify the user:

```typescript
return this.http.get<Response>(`${this.apiUrl}/endpoint`).pipe(
  map((response) => (response.success ? response.results : [])),
  catchError(() => {
    this.notificationService.error('notifications.errors.your_key');
    return of([]);
  })
);
```

## TypeScript Best Practices

- Strict type checking; prefer type inference when obvious
- Avoid `any`; use `unknown` when the type is uncertain
- Use `(value as Type)` instead of casting through `any`
- **Comments**: simple `//` in English only, NOT JSDoc `/** */`
- **Error handlers**: use `console.error()`, never empty functions (`@typescript-eslint/no-empty-function`)

## API Data Mapping

The backend returns **snake_case** JSON (TMDB-shaped). Frontend models in `models/serie.model.ts` mirror those fields directly (`poster_path`, `first_air_date`, `user_data`, `is_watched`, …). Response envelopes carry a `success` boolean plus a `results` / `serie` payload — always check `success` before using `results`.

Key models: `Serie`, `Season`, `Episode`, `SerieUserData`, `SerieStats`, `SearchResponse`, `SerieDetailResponse`, `UserSeriesResponse`, `SerieStatus` (enum). Helpers: `getTmdbImageUrl(path, size)`, `formatRating(rating)`.

### Hierarchical Watched State

Series → Season → Episode marking is synchronized: marking a series marks all seasons and episodes; marking a season marks its episodes and re-checks whether the whole series is watched.

## Material Design 3

- Use `NotificationService` (wraps `MatSnackBar`) with translation keys — never call `MatSnackBar` directly for user text
- **MatMenu max-width is 280px** — use `MatSidenav` with `position="end"` for wider panels
- For sidenav: `mode="over"`, sync state with `(openedChange)`; use unique template refs (`#sidenav`, `#notificationsSidenav`) for multiple sidenavs
- M3 theme is configured in SCSS via `mat.theme(...)` (rose primary, red tertiary) — see the `material-design-3` and `scss-styling` skills
- Use M3 typography classes (`.display-large`, `.headline-medium`, `.body-large`, `.label-large`, …) — never inline `font-size`
- Use `NgOptimizedImage` for static images (NOT for inline base64)

## Templates

- Use `@if`, `@for`, `@switch` — NOT `*ngIf`, `*ngFor`, `*ngSwitch`
- Use `class` bindings (NOT `ngClass`), `style` bindings (NOT `ngStyle`)
- No arrow functions in templates; no globals like `new Date()`
- Use the `| async` pipe for observables
- All user-facing text MUST use Transloco translation keys

## Transloco i18n

Translations live in `src/app/i18n/fr.ts` with MessageFormat:

```typescript
"seasons": "{count, plural, =0 {Aucune saison} one {# saison} other {# saisons}}"
```

All user-facing text MUST go through translation keys via `TranslocoModule`.

## PWA / Service Worker

- Service worker config in `ngsw-config.json`; registered in `app.config.ts`
- `UpdateService` handles `SwUpdate` version prompts
- `PushNotificationService` manages Web Push subscription/unsubscription
- Guard all browser APIs — this app targets browser only, but keep push/SW logic behind capability checks (`'serviceWorker' in navigator`, `Notification.permission`)

## Testing — Vitest (NOT Jasmine)

**CRITICAL**: this project uses **Vitest**, not Jasmine/Karma.

```typescript
import { vi, expect } from 'vitest';
// Mock:    vi.fn().mockReturnValue(of(data))
// Timers:  vi.useFakeTimers(), vi.advanceTimersByTime(1000)
// Inspect: mockMethod.mock.calls, mockMethod.mockClear()
// Cleanup: vi.restoreAllMocks() in afterEach()
```

Use factory functions from `testing/mocks/` — **NEVER inline `TranslocoTestingModule.forRoot()`**:

```typescript
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';
import { createMockAuthService, createMockSeriesService } from '../testing/mocks';

beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [HomeComponent, getTranslocoTestingModule()],
    providers: [
      { provide: AuthService, useValue: createMockAuthService() },
      { provide: SeriesService, useValue: createMockSeriesService() },
    ],
  });
});

afterEach(() => vi.restoreAllMocks());
```

Available factories (from `testing/mocks/`): `createMockSerie(overrides?)`, `createMockSeason()`, `createMockEpisode()`, `createMockSerieStats()`, `createMockUser()`, `createMockAuthService()`, `createMockAuthenticatedAuthService()`, `createMockSeriesService()`, `createMockMetadataService()`, `createMockMatDialog()`.

Test against **translation keys**, not translated strings:

```typescript
expect(notificationService.error).toHaveBeenCalledWith('notifications.errors.load_series');
```

Signal assertions use function-call syntax: `expect(component.loading()).toBe(false)`.

## Accessibility

- MUST pass AXE checks and WCAG AA (project aims for AAA where feasible)
- Leverage Material's built-in ARIA and keyboard navigation — do not add redundant `tabindex`/`role`/`keydown`
- Provide alt text and visible focus states (see `src/styles/_focus.scss`)

## Key Files

- `app.config.ts` — providers (zoneless, router, HTTP, Transloco, service worker)
- `app.routes.ts` — lazy-loaded routes with `authGuard`
- `proxy.conf.json` — `/api/*` → local backend
- `ngsw-config.json` — service worker caching
- `src/app/testing/transloco-testing.module.ts` — Transloco test helper
- `src/app/testing/mocks/` — mock factories for all services
- `src/app/models/` — TypeScript interfaces (`serie.model.ts`, `user.model.ts`, `notification.model.ts`, `search-resource.model.ts`)
- `src/styles/` — `_theme-colors.scss`, `_mixins.scss`, `_focus.scss`

## Angular Official Context

For up-to-date Angular best practices and LLM context:

- Best practices: https://angular.dev/assets/context/best-practices.md
- Full LLM context: https://angular.dev/assets/context/llms-full.txt
- Angular llms.txt index: https://angular.dev/llms.txt

## AI Tooling

Primary agent: **Claude Code**. Config under `.claude/` (see `CLAUDE.md`): skills (`.claude/skills/*`), subagents (`.claude/agents/*`), slash commands (`.claude/commands/*`), and a `PostToolUse` prettier+eslint hook (`.claude/settings.json`).
