---
description: Scaffold a Vitest unit test following Suiviseries conventions
---

# Create Test

Write a Vitest unit test (NOT Jasmine/Karma). Consult the `vitest-testing` skill.

## Requirements

- Import from `vitest` (`vi`, `expect`, `describe`, `it`, `beforeEach`, `afterEach`)
- Use `getTranslocoTestingModule()` — never inline `TranslocoTestingModule.forRoot()`
- Use mock factories from `testing/mocks/` (`createMock*`)
- Signal assertions with function-call syntax: `component.value()`
- Assert against **translation keys**, not translated strings
- `afterEach(() => vi.restoreAllMocks())`

## Template

```typescript
import { TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { of } from 'rxjs';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';
import { createMockSeriesService, createMockSerie } from '../testing/mocks';
import { SeriesService } from '../services/series.service';
import { FeatureComponent } from './feature.component';

describe('FeatureComponent', () => {
    let seriesService: ReturnType<typeof createMockSeriesService>;

    beforeEach(() => {
        seriesService = createMockSeriesService();
        TestBed.configureTestingModule({
            imports: [FeatureComponent, getTranslocoTestingModule()],
            providers: [{ provide: SeriesService, useValue: seriesService }],
        });
    });

    afterEach(() => vi.restoreAllMocks());

    it('should create', () => {
        const fixture = TestBed.createComponent(FeatureComponent);
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should notify on load error', () => {
        seriesService.getSerieDetails.mockReturnValue(of({ success: false } as never));
        const fixture = TestBed.createComponent(FeatureComponent);
        fixture.componentInstance.ngOnInit();
        // expect(notificationService.error).toHaveBeenCalledWith('notifications.errors.your_key');
    });
});
```

## Coverage

Target ≥ 80%. Run `npm run test:coverage`. Cover: happy path, error path (notification key), and edge/empty states.
