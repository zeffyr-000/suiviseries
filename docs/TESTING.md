# Testing Guide

This document provides comprehensive testing guidelines for the Suiviseries project.

## Framework: Vitest

**CRITICAL**: This project uses **Vitest**, NOT Jasmine/Karma.

### Why Vitest?

- **Modern**: Built for Vite, faster test execution
- **Compatible**: Jest-like API, easier migration from modern tools
- **Performance**: Faster than Karma with hot module replacement
- **Developer Experience**: Better error messages and debugging

## Common Migration Issues

### ❌ Jasmine Patterns to AVOID

```typescript
// DON'T: Jasmine spy creation
const spy = jasmine.createSpyObj('ServiceName', ['method1', 'method2']);

// DON'T: Jasmine timer API
fakeAsync(() => {
  tick(1000);
  // assertions
});

// DON'T: Jasmine mock call inspection
spy.calls.allArgs();
spy.calls.reset();
spy.and.returnValue(42);
spy.and.throwError(new Error('fail'));
```

### ✅ Vitest Patterns to USE

```typescript
import { vi } from 'vitest';

// DO: Vitest mock creation
const mockMethod1 = vi.fn();
const mockMethod2 = vi.fn();
const spy = { method1: mockMethod1, method2: mockMethod2 };

// DO: Vitest timer API
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
// assertions
vi.restoreAllMocks();

// DO: Vitest mock call inspection
spy.method1.mock.calls;
spy.method1.mockClear();
spy.method1.mockReturnValue(42);
spy.method1.mockImplementation(() => {
  throw new Error('fail');
});
```

## Testing Services

### Basic Service Test

```typescript
import { TestBed } from '@angular/core/testing';
import { vi, expect } from 'vitest';
import { MyService } from './my.service';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoTestingModule()],
      providers: [MyService],
    });
    service = TestBed.inject(MyService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

### Testing with Material Design Services

```typescript
import { MatSnackBar } from '@angular/material/snack-bar';

beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [getTranslocoTestingModule()],
    providers: [NotificationService, MatSnackBar],
  });
  service = TestBed.inject(NotificationService);
  snackBar = TestBed.inject(MatSnackBar);

  // Spy on Material service methods
  vi.spyOn(snackBar, 'open');
  vi.spyOn(snackBar, 'dismiss');
});

it('should open snackbar', () => {
  service.show('notifications.success.saved');

  expect(snackBar.open).toHaveBeenCalledWith('Saved successfully', undefined, {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
    panelClass: ['snackbar-success'],
  });
});
```

### Testing with Timers

```typescript
import { vi } from 'vitest';

describe('Timer-dependent tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should auto-dismiss after duration', () => {
    service.showNotification('Hello', 3000);

    expect(service.notifications().length).toBe(1);

    vi.advanceTimersByTime(3000);

    expect(service.notifications().length).toBe(0);
  });
});
```

### Testing HTTP Services

```typescript
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('SeriesService', () => {
  let service: SeriesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoTestingModule()],
      providers: [SeriesService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SeriesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch series', () => {
    const mockSeries = [{ id: 1, name: 'Test' }];

    service.getSeries().subscribe((series) => {
      expect(series).toEqual(mockSeries);
    });

    const req = httpMock.expectOne('/api/series');
    expect(req.request.method).toBe('GET');
    req.flush(mockSeries);
  });
});
```

## Transloco Testing

### Setup

Always use the shared testing module for consistency:

```typescript
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';

TestBed.configureTestingModule({
  imports: [getTranslocoTestingModule()],
  // ...
});
```

### Assertion Strategy

**❌ INCORRECT**: Asserting against translated strings

```typescript
// DON'T: Fragile, breaks when translations change
expect(notification.message).toBe('notifications.success.serie_added');
```

**✅ CORRECT**: Asserting against translation keys

```typescript
// DO: Stable, tests the right contract
expect(translationKey).toBe('notifications.success.serie_added');
// Then verify the translation separately if needed
expect(transloco.translate(translationKey)).toBe('Serie added to your list');
```

## Code Style in Tests

### Comments

Use simple comments `//`, NOT JSDoc `/** */`:

```typescript
// ✅ CORRECT
// Test that the service initializes correctly
it('should initialize', () => { ... });

// ❌ INCORRECT
/**
 * Test that the service initializes correctly
 */
it('should initialize', () => { ... });
```

### Error Handling

Use `console.error()`, NOT empty functions:

```typescript
// ✅ CORRECT
service.doSomething().catch((err) => console.error('Operation failed:', err));

// ❌ INCORRECT - violates @typescript-eslint/no-empty-function
service.doSomething().catch(() => {});
```

## Type Safety

Avoid `any`, use `unknown` with type assertions:

```typescript
// ❌ AVOID
const result: any = mockFn();

// ✅ PREFER
const result: unknown = mockFn();
const typedResult = result as ExpectedType;

// For mock type assertions
const mockCalls = (spy as unknown as ReturnType<typeof vi.fn>).mock.calls;
```

## Common Test Patterns

### Testing Signals

```typescript
it('should update signal', () => {
  const initialValue = service.mySignal();
  expect(initialValue).toBe(0);

  service.updateSignal(42);

  expect(service.mySignal()).toBe(42);
});
```

### Testing Computed Signals

```typescript
it('should compute derived value', () => {
  service.setValue(10);

  expect(service.doubleValue()).toBe(20);
});
```

### Mocking Dependencies with Signals

```typescript
// Mock a service with signal-based API
const authServiceMock = {
  isAuthenticated: signal(false),
  currentUser: signal(null),
  login: vi.fn().mockResolvedValue(undefined),
};

TestBed.configureTestingModule({
  providers: [{ provide: AuthService, useValue: authServiceMock }],
});
```

## Coverage Goals

### Target Metrics

- **Overall**: 80% minimum
- **Services**: 70%+ (critical business logic)
- **Models**: 100% (simple interfaces, easy to test)
- **Components**: Focus on logic over templates

### Excluded from Coverage

- `src/environments/*.ts` - Configuration files
- `src/app/i18n/*.ts` - Translation files
- `*.html` files - Templates (tested via E2E if needed)

### Running Coverage

```bash
# Full coverage report
npm run test:coverage

# View detailed HTML report
open coverage/index.html
```

## Debugging Tests

### Vitest UI

```bash
npm run test -- --ui
```

Opens an interactive UI for debugging tests.

### Isolate Single Test

```typescript
// Run only this test
it.only('should do something', () => {
  // ...
});

// Skip this test
it.skip('should do something', () => {
  // ...
});
```

## Best Practices Summary

1. ✅ **Use Vitest API** (`vi.fn()`, `vi.spyOn()`, `vi.useFakeTimers()`)
2. ✅ **Use simple comments** (`//`), not JSDoc (`/** */`)
3. ✅ **Use translation keys** in assertions, not translated strings
4. ✅ **Use shared Transloco testing module** (`getTranslocoTestingModule()`)
5. ✅ **Mock Material services** (MatSnackBar, MatDialog) with `vi.spyOn()`
6. ✅ **Clean up mocks** with `vi.restoreAllMocks()` in `afterEach()`
7. ✅ **Use `console.error()`** in error handlers, not empty functions
8. ✅ **Prefer `unknown`** over `any` for type safety
9. ✅ **Test business logic** thoroughly, templates optionally
10. ✅ **Aim for 80% coverage** overall, 70%+ for services
