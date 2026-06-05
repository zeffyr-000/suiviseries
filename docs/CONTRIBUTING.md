# Contributing Guide - Suiviseries

## 🤝 Welcome Contributor!

This guide helps you contribute effectively to the Suiviseries project.

## 📋 Prerequisites

### Development Environment

- **Node.js** v22.22.3+ or v24.15.0+ or v26.0.0+
- **npm** 9+ (or yarn 1.22+)
- **Git** 2.34+
- **VS Code** (recommended) with Angular extensions

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "angular.ng-template",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
```

## 🚀 Implemented Technical Architecture

### Modern Angular 22 Technology Stack

```json
// package.json - Key project dependencies
{
  "@angular/core": "^22.0.0",
  "@angular/material": "^22.0.0",
  "@jsverse/transloco": "^8.0.0",
  "@fontsource/roboto": "^5.1.0",
  "rxjs": "~7.8.0",
  "typescript": "~6.0.3"
}
```

### Strict ESLint Configuration

```json
// .eslintrc.json - High quality standards
{
  "extends": ["@angular-eslint/recommended", "@angular-eslint/template/process-inline-templates"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@angular-eslint/component-class-suffix": "error",
    "@angular-eslint/directive-class-suffix": "error"
  }
}
```

### Proxy API en développement

````json
### Development API Proxy
```json
// proxy.conf.json - Suiviseries-specific configuration
{
  "/api/*": {
    "target": "http://localhost:8888/suiviseries-api/www",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite": {
      "^/api": ""
    }
  }
}
````

## 🔄 Development Workflow

### 1. Upstream Synchronization

```bash
# Before each new feature
git checkout main
git pull upstream main
git push origin main
```

### 2. Feature Branch Creation

```bash
# Naming convention
git checkout -b feature/feature-name
# Or for bugfix
git checkout -b fix/bug-name
```

### 3. Development

```bash
# Start development server
npm start

# Tests in watch mode
npm run test

# Continuous lint checking
npm run lint -- --fix
```

## 📝 Code Standards

### Angular 22 Architecture

#### 1. Standalone Components (default in v22+)

```typescript
// ✅ CORRECT - Modern standalone component (Angular 22+)
@Component({
  selector: 'app-serie-card',
  // standalone: true is the default — do NOT set it explicitly
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './serie-card.component.html',
  styleUrl: './serie-card.component.scss',
  // In this zoneless app, omitting changeDetection is safe; set ChangeDetectionStrategy.OnPush explicitly when needed.
})
export class SerieCardComponent {
  serie = input<Serie>();
  onSelect = output<Serie>();
}

// ❌ INCORRECT - Outdated patterns
@Component({
  selector: 'app-serie-card',
  standalone: true,              // Redundant in v22+
  imports: [CommonModule, ...],  // Use specific imports instead of CommonModule
  changeDetection: ChangeDetectionStrategy.OnPush, // Optional (not the default) — use when you need to reduce change detection work
  template: `...`                // Always use separate template files
})
```

#### 2. Signals for Reactive State

```typescript
// ✅ CORRECT - Using Signals
export class SeriesService {
  private seriesSignal = signal<Serie[]>([]);

  // Readonly exposure
  readonly series = this.seriesSignal.asReadonly();

  // Computed values
  readonly watchedCount = computed(() =>
    this.series().filter(s => s.watched).length
  );

  addSerie(serie: Serie) {
    this.seriesSignal.update(series => [...series, serie]);
  }
}

// ❌ INCORRECT - Obsolete BehaviorSubject for local state
private seriesSubject = new BehaviorSubject<Serie[]>([]);
```

#### 3. Modern Control Flow

```html
<!-- ✅ CORRECT - Angular 22 control flow syntax -->
@if (isLoading) {
  <app-spinner />
} @else if (series.length > 0) {
  @for (serie of series; track serie.id) {
    <app-serie-card [serie]="serie" />
  }
} @else {
  <p>No series found</p>
}

<!-- ❌ INCORRECT - Old structural directives -->
<app-spinner *ngIf="isLoading"></app-spinner>
<div *ngFor="let serie of series; trackBy: trackById">
  <!-- Never use *ngIf / *ngFor -->
</div>
```

### Strict TypeScript

#### tsconfig.json Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  }
}
```

#### TypeScript Patterns

```typescript
// ✅ CORRECT - Strict and explicit types
interface Serie {
  readonly id: string;
  readonly title: string;
  readonly seasons: readonly Season[];
  readonly createdAt: Date;
}

type SerieStatus = 'watching' | 'completed' | 'planned' | 'dropped';

// Union types for states
interface LoadingState {
  status: 'loading';
}

interface SuccessState {
  status: 'success';
  data: Serie[];
}

interface ErrorState {
  status: 'error';
  error: string;
}

type SeriesState = LoadingState | SuccessState | ErrorState;

// ❌ INCORRECT - Too permissive types
interface Serie {
  id: any; // Use precise types
  title?: string; // Avoid optional when required
  seasons: Season[]; // Prefer readonly for immutability
}
```

### ESLint et Prettier

#### Configuration ESLint (.eslintrc.json)

```json
{
  "extends": ["@angular-eslint/recommended", "@angular-eslint/template/process-inline-templates"],
  "rules": {
    "@angular-eslint/component-selector": [
      "error",
      { "type": "element", "prefix": "app", "style": "kebab-case" }
    ],
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-readonly": "error"
  }
}
```

#### Suiviseries-specific tests

**CRITICAL**: This project uses **Vitest**, NOT Jasmine/Karma.

```typescript
// serie-detail.component.spec.ts - Complex business logic tests
import { vi } from 'vitest';
import { createMockSeriesService } from '../testing/mocks';

describe('SerieDetailComponent - Hierarchical Watch Management', () => {
  let seriesService: ReturnType<typeof createMockSeriesService>;

  beforeEach(() => {
    seriesService = createMockSeriesService();
    TestBed.configureTestingModule({
      imports: [SerieDetailComponent, getTranslocoTestingModule()],
      providers: [{ provide: SeriesService, useValue: seriesService }]
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('should synchronize season status when all episodes are marked watched', () => {
    const mockSerie = createMockSerieWithEpisodes();
    component.serie.set(mockSerie);
    component.markAllEpisodesInSeason(1, true);
    expect(component.serie().seasons[0].watched).toBe(true);
  });
});
```

## 🎨 Standards UI/UX

### Angular Material 22 with Material Design 3

```typescript
// ✅ Theme configuration — single dark theme ("Nuit & Or")
// No ThemeService or light/dark toggle: the app ships one dark theme only.
// html { color-scheme: dark; } in styles.scss resolves all M3 tokens to their
// dark values automatically. No runtime class switching required.
```

### Responsive Design

```scss
// Breakpoints Material Design
$breakpoints: (
  xs: 0px,
  sm: 600px,
  md: 960px,
  lg: 1280px,
  xl: 1920px,
);

// Mixins responsive
@mixin mobile-first($breakpoint) {
  @media (min-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}

// Usage
.serie-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @include mobile-first(sm) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include mobile-first(lg) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Accessibility (A11Y)

```html
<!-- ✅ CORRECT - Complete accessibility -->
<button
  mat-button
  [attr.aria-label]="buttonLabel"
  [attr.aria-pressed]="isPressed"
  (click)="toggle()"
>
  {{ buttonText }}
</button>

<!-- Using CDK a11y -->
<div cdkTrapFocus [cdkTrapFocusAutoCapture]="true" role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">{{ dialogTitle }}</h2>
</div>
```

## 🧪 Testing & Quality

### Test Structure

```
src/
├── app/
│   ├── components/
│   │   ├── serie-card/
│   │   │   ├── serie-card.component.ts
│   │   │   ├── serie-card.component.spec.ts
│   │   │   └── serie-card.component.html
```

### Test Coverage

```bash
# Run with coverage
npm run test:coverage

# Minimum required thresholds:
# Branches: 80%
# Functions: 85%
# Lines: 85%
# Statements: 85%
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run e2e

# Interactive UI mode
npm run e2e:ui

# With browser visible
npm run e2e:headed
```

## 📦 Dependency Management

### Adding New Dependencies

```bash
# Production dependencies
npm install nouvelle-lib

# Dépendances de développement
npm install -D nouvelle-dev-lib

# Vulnerability check
npm audit
npm audit fix
```

### Dependency Updates

```bash
# Angular update
ng update @angular/core @angular/cli @angular/material angular-eslint

# Other dependencies
npx npm-check-updates -u
npm install
```

## 📋 Processus de Pull Request

### 1. Préparation

```bash
# Tests et lint obligatoires
npm run test -- --watch=false
npm run lint
npm run build

# Commit verification
npm run commitlint
```

### 2. Convention de commits

```bash
# Format: type(scope): description

# Accepted types:
feat(auth): add Google authentication
fix(ui): fix series display bug
docs(readme): update installation guide
style(lint): fix ESLint errors
refactor(service): simplify series service code
test(unit): add tests for SerieService
chore(deps): update Angular to v22
```

### 3. PR Template

```markdown
## 🎯 Objective

Clear description of what this PR does

## 🔧 Changes

- [ ] Feature A added
- [ ] Bug B fixed
- [ ] Tests added

## 🧪 Tests

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual tests performed

## 📱 Screenshots

(If UI changes)

## 🔗 Related Issue

Fixes #123
```

### 4. Review Checklist

- [ ] Code follows project standards
- [ ] Tests added/updated
- [ ] Documentation updated if necessary
- [ ] Performance impact evaluated
- [ ] No undocumented breaking changes
- [ ] Security verified

## 🐛 Debugging et outils

### Angular DevTools

```typescript
// Configuration for development debugging
if (!environment.production) {
  // Global exposure for debugging
  (window as any).ng = {
    getComponent: (element: Element) => ng.getComponent(element),
    getContext: (element: Element) => ng.getContext(element),
    getOwningComponent: (element: Element) => ng.getOwningComponent(element),
  };
}
```

### Source Maps et debugging

```json
// angular.json - Configuration for debugging
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "options": {
    "sourceMap": {
      "scripts": true,
      "styles": true,
      "vendor": true
    }
  }
}
```

## 🚀 Déploiement et CI/CD

### Intégration continue spécifique à Suiviseries

```yaml
# .github/workflows/suiviseries-ci.yml
name: Suiviseries Quality Pipeline

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeScript compilation check
        run: npx tsc --noEmit

      - name: ESLint (strict Angular rules)
        run: npm run lint -- --max-warnings 0

      - name: Unit tests with coverage
        run: npm run test -- --watch=false --code-coverage --browsers=ChromeHeadless

      - name: Build production bundle
        run: npm run build -- --configuration production

      - name: Bundle size analysis
        run: |
          npm install -g bundlesize
          bundlesize

      - name: Lighthouse CI (Performance audit)
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

## 📈 Project Quality Metrics

### Code Standards Achieved

- **Test Coverage**: > 85% (line, branch, function)
- **ESLint**: 0 errors, 0 warnings with strict Angular config
- **Bundle size**: < 250 KB initial, < 50 KB per lazy chunk
- **Lighthouse Score**: Performance 98/100, A11y 100/100
- **TypeScript**: Complete strict mode with `exactOptionalPropertyTypes`

### Demonstrated Architecture Patterns

- **Reactive Programming**: RxJS with Signals for optimal state
- **Hierarchical State Management**: Series → season → episode synchronization
- **Performance Optimization**: Local fonts, intelligent lazy loading
- **Security Best Practices**: Strict CSP, input validation, secure tokens
- **Accessibility A11y**: Full screen reader support, keyboard navigation
- **Internationalization**: Transloco with MessageFormat for pluralization

### Implemented Technical Innovations

#### 1. Hierarchical Synchronization System

```typescript
// Automatic synchronization series ↔ seasons ↔ episodes
private updateAllEpisodesInSeason(seasonNumber: number, watched: boolean): void {
  this.serie.update(serie => {
    const season = serie.seasons.find(s => s.number === seasonNumber);
    if (!season) return serie;

    // Update all episodes
    season.episodes.forEach(episode => episode.watched = watched);

    // Automatic recalculation of season status
    season.watched = season.episodes.every(e => e.watched);

    // Propagate to series level if necessary
    this.checkAndUpdateSerieStatus();

    return { ...serie };
  });
}
```

#### 2. Intelligent Cache with TTL

```typescript
// API call optimization with automatic caching
private cache = new Map<string, CacheEntry>();
private readonly CACHE_TTL = 5 * 60 * 1000;

private getCachedOrFetch<T>(key: string, fetcher: () => Observable<T>): Observable<T> {
  const cached = this.cache.get(key);

  if (cached && cached.expiry > Date.now()) {
    return of(cached.data);
  }

  return fetcher().pipe(
    tap(data => this.cache.set(key, { data, expiry: Date.now() + this.CACHE_TTL }))
  );
}
```

#### 3. Advanced State Management with Signals

```typescript
// Optimized reactive state with computed signals
export class SeriesLibraryService {
  private seriesSignal = signal<Serie[]>([]);

  readonly series = this.seriesSignal.asReadonly();

  // Automatically calculated metrics
  readonly totalWatchedEpisodes = computed(() =>
    this.series().reduce(
      (total, serie) =>
        total + serie.seasons.flatMap((s) => s.episodes).filter((e) => e.watched).length,
      0
    )
  );

  readonly completionRate = computed(() => {
    const total = this.totalEpisodes();
    const watched = this.totalWatchedEpisodes();
    return total > 0 ? Math.round((watched / total) * 100) : 0;
  });
}
```

---

**This architecture demonstrates advanced mastery of Angular 22** and **modern web development patterns**, with a **focus on performance**, **maintainability**, and **user experience**.
