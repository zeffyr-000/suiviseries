You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Project-Specific Rules

### Testing Framework

- **CRITICAL**: This project uses **Vitest**, NOT Jasmine/Karma
- Use `vi.fn()` for mocks, NOT `jasmine.createSpyObj()`
- Use `vi.spyOn()` for spying on methods
- Use `vi.useFakeTimers()` and `vi.advanceTimersByTime()` for timers, NOT `fakeAsync()` and `tick()`
- Use `.mockClear()`, `.mockReturnValue()`, `.mockImplementation()` for mock controls
- Access mock calls with `.mock.calls`, NOT `.calls.allArgs()`
- Import `expect` from `vitest` when using advanced matchers
- Use `vi.restoreAllMocks()` in `afterEach()` to clean up

### Code Style

- Use **simple comments** `//` for documentation, NOT JSDoc `/** */`
- Keep comments concise and inline when possible
- Use `console.error()` in error handlers, NOT empty functions `() => {}`
- Follow ESLint rule `@typescript-eslint/no-empty-function`
- **Write all comments in English**, never in French or other languages
- Only comment when necessary; prefer self-documenting code
- Avoid redundant comments that simply restate what the code does

### Material Design Integration

- **ALWAYS prefer Material Design components** over custom implementations
- Use `MatSnackBar` for notifications (NOT custom notification components)
- Leverage Material's built-in accessibility features
- Use Material typography and theming system
- Import `provideAnimationsAsync()` in app config for Material components
- **MatMenu has a hardcoded max-width of 280px** - use `MatSidenav` with `position="end"` for wider panels (e.g., notifications)
- For side panels with rich content: use `mat-sidenav-container` with `mode="over"` and sync state with `(openedChange)` event

### Transloco i18n

- Use translation keys in tests, NOT translated strings
- Example: `expect(...).toBe('notifications.success.serie_added')` NOT `'Série ajoutée'`
- Create reusable `getTranslocoTestingModule()` helper for tests
- Never inline `TranslocoTestingModule.forRoot()` in individual test files
- All user-facing text MUST use Transloco translation keys
- Never hardcode display strings in templates or components

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- Use proper type assertions: `(value as Type)` instead of casting with `any`

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.
- Leverage Material Design's built-in ARIA attributes and keyboard navigation

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- **ALWAYS use separate files for templates and styles** - never inline `template` or `styles` in `@Component` decorator
- Use `templateUrl: './component.html'` and `styleUrl: './component.scss'` (relative paths)
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead
- When using Material components with two-way binding (`[opened]`), sync with `(openedChange)` event to avoid stale state

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).
- When integrating multiple `mat-sidenav` in a container, use unique template references (`#sidenav`, `#notificationsSidenav`)

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
- Prefer Material Design services (MatSnackBar, MatDialog) over custom implementations
