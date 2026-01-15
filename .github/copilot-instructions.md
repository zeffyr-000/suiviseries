You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Architecture Overview

Suiviseries is an Angular 21 PWA for TV series tracking with Google OAuth authentication. The app uses a zoneless architecture with signals.

### Key Service Patterns

- **AuthService** (`services/auth.service.ts`): Manages Google OAuth, JWT tokens in localStorage, and user state via signals
- **SeriesService** (`services/series.service.ts`): REST API calls to `/api/*` endpoints, caches user series, provides `rxResource` for search
- **NotificationService** (`services/notification.service.ts`): Wrapper around `MatSnackBar` using translation keys
- **UserNotificationService** (`services/user-notification.service.ts`): Real-time notification state with signals

### rxResource Pattern (Angular 21.1+)

For reactive data fetching with automatic request cancellation, use `rxResource` in **services**:

```typescript
// In service - exposes resource factory
createSearchResource(): SearchResource {
    const query = signal('');
    const resource = rxResource<Serie[], string | undefined>({
        params: () => {
            const q = query().trim();
            return q.length >= 2 ? q : undefined; // undefined skips request
        },
        stream: ({ params: q }) => q ? this.searchSeries(q) : of([])
    });
    return {
        results: computed(() => resource.value() ?? []),
        isLoading: resource.isLoading,
        error: resource.error,
        hasValue: computed(() => resource.hasValue()),
        query
    };
}

// In component - consumes resource
private readonly searchResource = this.seriesService.createSearchResource();
protected readonly results = computed(() => this.searchResource.results());
protected readonly loading = computed(() => this.searchResource.isLoading());
```

Key benefits:

- **Automatic cancellation**: Previous requests cancelled when params change (like `switchMap`)
- **Built-in states**: `isLoading`, `error`, `hasValue` signals
- **Service responsibility**: Data-fetching logic stays in service

### Data Flow

```
Google OAuth → AuthService → JWT token → authInterceptor → Backend API (/api/*)
                                                              ↓
                          SeriesService ← HTTP responses ←────┘
```

### API Proxy (Development)

Calls to `/api/*` are proxied to `http://localhost:8888/suiviseries-api/www/` via `proxy.conf.json`.

### HTTP Error Handling Pattern

All HTTP calls follow this pattern - return empty/default value on error, notify user:

```typescript
return this.http.get<Response>(`${this.apiUrl}/endpoint`).pipe(
  map((response) => (response.success ? response.results : [])),
  catchError(() => {
    this.notificationService.error('notifications.errors.your_key');
    return of([]);
  })
);
```

### Auth Guard

`authGuard` redirects unauthenticated users to home with login dialog:

```typescript
router.navigate(['/'], { queryParams: { returnUrl: state.url, login: 'true' } });
```

## Developer Commands

```bash
npm start          # Dev server with API proxy (http://localhost:4200)
npm test           # Vitest unit tests
npm run e2e        # Playwright E2E tests
npm run e2e:ui     # Playwright with UI mode
npm run lint       # ESLint
npm run format     # Prettier
```

## Testing Framework: Vitest (NOT Jasmine)

**CRITICAL**: This project uses **Vitest**, NOT Jasmine/Karma.

### Vitest Patterns

```typescript
import { vi, expect } from 'vitest';

// Mock: vi.fn().mockReturnValue(of(data))
// Timers: vi.useFakeTimers(), vi.advanceTimersByTime(1000)
// Inspect: mockMethod.mock.calls, mockMethod.mockClear()
// Cleanup: vi.restoreAllMocks() in afterEach()
```

### Test Setup with Mocks

Use factory functions from `testing/mocks/` - **NEVER inline TranslocoTestingModule.forRoot()**:

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

### Available Mock Factories

- `createMockSerie(overrides?)`, `createMockSeason()`, `createMockEpisode()`
- `createMockUser()`, `createMockAuthService()`, `createMockAuthenticatedAuthService()`
- `createMockSeriesService()`, `createMockMetadataService()`, `createMockMatDialog()`

### Translation Keys in Tests

Test against translation keys, NOT translated strings:

```typescript
expect(notificationService.error).toHaveBeenCalledWith('notifications.errors.load_series');
```

## Code Style

- **Comments**: Simple `//` in English only, NOT JSDoc `/** */`
- **Error handlers**: Use `console.error()`, NOT empty functions per `@typescript-eslint/no-empty-function`

## TypeScript Best Practices

- Use strict type checking; prefer type inference when obvious
- Avoid `any`; use `unknown` when type is uncertain
- Use `(value as Type)` instead of casting with `any`

## Angular Patterns

### Component Structure

```typescript
@Component({
  selector: 'app-example',
  imports: [TranslocoModule, MatButtonModule], // Standalone by default in v21
  templateUrl: './example.component.html', // ALWAYS separate files
  styleUrl: './example.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {
  readonly data = input.required<Data>(); // input() not @Input()
  protected readonly derived = computed(() => this.data().value);
}
```

### Component Rules

- Must NOT set `standalone: true` - it's the default in Angular v21+
- Use `input()`, `output()` functions instead of decorators; `computed()` for derived state
- **ALWAYS separate files for templates/styles** - never inline
- Use `host` object in decorator instead of `@HostBinding`/`@HostListener`

### Signal Forms (Angular 21.1+)

Use Signal Forms from `@angular/forms/signals` instead of ReactiveFormsModule:

```typescript
import { form, FormField, minLength } from '@angular/forms/signals';

// In component
protected readonly model = signal({ query: '' });
protected readonly searchForm = form(this.model, (schema) => {
    minLength(schema.query, 2);
});

// In template
<input matInput [formField]="searchForm.query" />
<button [disabled]="searchForm.query().invalid()">Search</button>
```

Key differences from ReactiveFormsModule:

- Use `form()` instead of `FormGroup`/`FormControl`
- Use `[formField]` directive instead of `[formControl]`
- Access value with `.value()` signal, validity with `.invalid()` / `.valid()`
- Validators are functions like `minLength()`, `required()` applied in form schema

### Services

- Use `providedIn: 'root'` for singletons, `inject()` instead of constructor injection
- Use signals with `_private` pattern: `private readonly _state = signal<T>()` / `readonly state = this._state.asReadonly()`
- Use `set()` or `update()` on signals, NOT `mutate()`

## Material Design Integration

- Use `NotificationService` (wraps `MatSnackBar`) with translation keys
- **MatMenu max-width 280px** - use `MatSidenav` with `position="end"` for wider panels
- For sidenav: use `mode="over"` and sync state with `(openedChange)` event
- Multiple sidenav: use unique template references (`#sidenav`, `#notificationsSidenav`)

## Transloco i18n

Translations in `i18n/fr.ts` with MessageFormat:

```typescript
"seasons": "{count, plural, =0 {Aucune saison} one {# saison} other {# saisons}}"
```

All user-facing text MUST use translation keys via `TranslocoModule`.

## Templates

- Use `@if`, `@for`, `@switch` (NOT `*ngIf`, `*ngFor`)
- Use `class` bindings (NOT `ngClass`), `style` bindings (NOT `ngStyle`)
- No arrow functions in templates; no globals like `new Date()`
- Use `| async` pipe for observables

## Accessibility

- MUST pass AXE checks and WCAG AA
- Leverage Material's built-in ARIA and keyboard navigation
- Use `NgOptimizedImage` for static images (NOT for inline base64)

## Key Files

- `app.config.ts`: Providers (zoneless, router, HTTP, Transloco)
- `app.routes.ts`: Lazy-loaded routes with `authGuard`
- `testing/transloco-testing.module.ts`: Transloco test helper
- `testing/mocks/`: Mock factories for all services
- `models/`: TypeScript interfaces (`Serie`, `User`, `Notification`)
