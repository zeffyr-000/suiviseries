# Contributing Guide - Suiviseries

## 🤝 Welcome Contributor!

This guide helps you contribute effectively to the Suiviseries project.

## 📋 Prerequisites

### Development Environment

- **Node.js** 18.19+ or 20.9+
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

### Modern Angular 20 Technology Stack

```json
// package.json - Key project dependencies
{
  "@angular/core": "^20.3.0",
  "@angular/material": "^20.0.0",
  "@jsverse/transloco": "^8.0.0",
  "@fontsource/roboto": "^5.1.0",
  "rxjs": "~7.8.0",
  "typescript": "~5.7.0"
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

### Angular 20 Architecture

#### 1. Standalone Components

```typescript
// ✅ CORRECT - Modern standalone component
@Component({
  selector: 'app-serie-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    @if (serie) {
      <mat-card>
        @for (season of serie.seasons; track season.id) {
          <div>{{ season.name }}</div>
        }
      </mat-card>
    }
  `
})
export class SerieCardComponent {
  serie = input<Serie>();
  onSelect = output<Serie>();
}

// ❌ INCORRECT - Old NgModule pattern
@NgModule({
  declarations: [SerieCardComponent],
  // No longer use NgModule for new components
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
<!-- ✅ CORRECT - New Angular 20 syntax -->
@if (isLoading) {
<app-spinner />
} @else if (series.length > 0) { @for (serie of series; track serie.id) {
<app-serie-card [serie]="serie" />
} } @else {
<p>No series found</p>
}

<!-- ❌ INCORRECT - Old syntax -->
<app-spinner *ngIf="isLoading"></app-spinner>
<div *ngFor="let serie of series; trackBy: trackById">
  <!-- No longer use structural directives -->
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

#### Tests spécifiques au projet Suiviseries

```typescript
// serie-detail.component.spec.ts - Complex business logic tests
describe('SerieDetailComponent - Hierarchical Watch Management', () => {
  let component: SerieDetailComponent;
  let seriesService: jasmine.SpyObj<SeriesService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('SeriesService', [
      'markSerieAsWatched',
      'unmarkSerieAsWatched',
      'updateEpisodeStatus',
    ]);

    TestBed.configureTestingModule({
      imports: [SerieDetailComponent, NoopAnimationsModule],
      providers: [{ provide: SeriesService, useValue: spy }],
    });

    seriesService = TestBed.inject(SeriesService) as jasmine.SpyObj<SeriesService>;
  });

  it('should synchronize season status when all episodes are marked watched', () => {
    const mockSerie = createMockSerieWithEpisodes();
    component.serie.set(mockSerie);

    // Mark all episodes of season 1 as watched
    component.markAllEpisodesInSeason(1, true);

    expect(component.serie().seasons[0].watched).toBe(true);
    expect(seriesService.updateEpisodeStatus).toHaveBeenCalledTimes(7);
  });

  it('should handle partial season watching correctly', () => {
    const mockSerie = createMockSerieWithEpisodes();
    component.serie.set(mockSerie);

    // Mark only 3 out of 7 episodes as watched
    component.toggleEpisodeWatched(1, 1, true);
    component.toggleEpisodeWatched(1, 2, true);
    component.toggleEpisodeWatched(1, 3, true);

    const season = component.serie().seasons[0];
    expect(season.watched).toBe(false);
    expect(season.partiallyWatched).toBe(true);
    expect(component.getSeasonProgress(1)).toBe(43); // 3/7 * 100
  });
});
```

## 🎨 Standards UI/UX

### Angular Material 20 with Material Design 3

```typescript
// ✅ Theme configuration
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly darkMode = signal(false);

  readonly isDarkMode = this.darkMode.asReadonly();

  toggleDarkMode(): void {
    this.darkMode.update((dark) => !dark);
    // Apply theme to document
    document.documentElement.classList.toggle('dark-theme');
  }
}
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
npm run test -- --code-coverage

# Seuils minimum requis :
# Branches: 80%
# Functions: 85%
# Lines: 85%
# Statements: 85%
```

### Tests E2E spécifiques aux fonctionnalités Suiviseries

```typescript
// cypress/e2e/hierarchical-watching.cy.ts
describe('Hierarchical Watching System', () => {
  beforeEach(() => {
    cy.mockGoogleAuth();
    cy.intercept('GET', '/api/series/breaking-bad', { fixture: 'breaking-bad.json' });
    cy.visit('/series/breaking-bad');
  });

  it('should mark entire serie as watched with cascade effect', () => {
    // Click "Mark series as watched"
    cy.get('[data-cy=mark-serie-watched]').click();
    cy.get('[data-cy=confirm-action]').click();

    // Verify all seasons are marked
    cy.get('[data-cy=season-card]').each(($season) => {
      cy.wrap($season).should('have.class', 'watched');
    });

    // Verify global counter is correct
    cy.get('[data-cy=episodes-counter]').should('contain', '62/62 épisodes vus');
  });

  it('should handle partial season watching with correct progress', () => {
    // Mark some individual episodes
    cy.get('[data-cy=episode-1-1] .episode-checkbox').click();
    cy.get('[data-cy=episode-1-2] .episode-checkbox').click();

    // Verify season progress
    cy.get('[data-cy=season-1-progress]').should('contain', '2/7 épisodes');

    // Verify season is not marked complete
    cy.get('[data-cy=season-1]')
      .should('have.class', 'partially-watched')
      .should('not.have.class', 'fully-watched');
  });
});

// cypress/e2e/search-and-filters.cy.ts
describe('Advanced Search Features', () => {
  it('should filter series by genre and status', () => {
    cy.visit('/search');

    cy.get('[data-cy=search-input]').type('drama');
    cy.get('[data-cy=genre-filter]').select('Crime');
    cy.get('[data-cy=status-filter]').select('ended');

    cy.get('[data-cy=search-results] .serie-card')
      .should('have.length.greaterThan', 0)
      .each(($card) => {
        cy.wrap($card).should('contain', 'Crime');
      });
  });
});
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
ng update @angular/core @angular/cli

# Autres dépendances
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
chore(deps): update Angular to v20
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

**This architecture demonstrates advanced mastery of Angular 20** and **modern web development patterns**, with a **focus on performance**, **maintainability**, and **user experience**.
