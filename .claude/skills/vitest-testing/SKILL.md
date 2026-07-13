---
name: vitest-testing
description: Unit testing conventions for Suiviseries — Vitest (NOT Jasmine/Karma), TestBed with getTranslocoTestingModule(), mock factories from testing/mocks/, signal assertions with function-call syntax, and asserting against translation keys. Use when writing or fixing *.spec.ts unit tests.
---

# Vitest Testing

**CRITICAL**: this project uses **Vitest**, not Jasmine/Karma. Run with `npm test` (watch) or `npm run test:coverage` (target ≥ 80%).

## Vitest API

```typescript
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest';
// Mock:    vi.fn().mockReturnValue(of(data))  /  .mockResolvedValue(x)
// Timers:  vi.useFakeTimers(), vi.advanceTimersByTime(1000)
// Inspect: mockMethod.mock.calls, mockMethod.mockClear()
// Cleanup: vi.restoreAllMocks() in afterEach()
```

## TestBed Setup

Use `getTranslocoTestingModule()` and mock factories — **NEVER** inline `TranslocoTestingModule.forRoot()`:

```typescript
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';
import { createMockAuthService, createMockSeriesService, createMockSerie } from '../testing/mocks';

describe('HomeComponent', () => {
  let seriesService: ReturnType<typeof createMockSeriesService>;

  beforeEach(() => {
    seriesService = createMockSeriesService();
    TestBed.configureTestingModule({
      imports: [HomeComponent, getTranslocoTestingModule()],
      providers: [
        { provide: AuthService, useValue: createMockAuthService() },
        { provide: SeriesService, useValue: seriesService },
      ],
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('should load series on init', () => {
    seriesService.getSerieDetails.mockReturnValue(of(createMockSerie()));
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.loading()).toBe(false);
  });
});
```

## Mock Factories (`src/app/testing/mocks/`)

- Data: `createMockSerie(overrides?)`, `createMockSeason()`, `createMockEpisode()`, `createMockSerieStats()`, `createMockUser()`
- Services: `createMockAuthService()`, `createMockAuthenticatedAuthService()`, `createMockSeriesService()`, `createMockMetadataService()`, `createMockMatDialog()`

Prefer these over hand-rolling mocks so the shape stays in sync with the models.

## Rules

- **Signal assertions use function-call syntax**: `expect(component.loading()).toBe(false)`
- **Assert against translation keys**, not translated strings:
  ```typescript
  expect(notificationService.error).toHaveBeenCalledWith('notifications.errors.load_series');
  ```
- Reset mocks in `afterEach(() => vi.restoreAllMocks())`
- Test behavior/outputs, not implementation details
- Keep unit tests off the real network — mock `HttpClient`-backed services via the factories
