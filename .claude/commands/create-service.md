---
description: Scaffold a new Angular service following Suiviseries conventions
---

# Create Service

Create a `providedIn: 'root'` service with signal state and the project's HTTP error pattern. Consult the `angular-services`, `api-data-mapping`, and `rxresource-patterns` skills.

## Requirements

- `@Injectable({ providedIn: 'root' })`
- `inject()` for dependencies (`private readonly`) — no constructor injection
- State as `private readonly _state = signal<T>()` + `readonly state = this._state.asReadonly()`
- Update signals with `set()` / `update()` — never `mutate()`
- HTTP calls check the `success` envelope, return a default on error, and notify via `NotificationService` (translation key)

## Template

```typescript
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class FeatureService {
    private readonly http = inject(HttpClient);
    private readonly notificationService = inject(NotificationService);
    private readonly apiUrl = environment.apiUrl;

    private readonly _items = signal<Item[]>([]);
    readonly items = this._items.asReadonly();

    loadItems(): void {
        this.http
            .get<ItemsResponse>(`${this.apiUrl}/items`)
            .pipe(
                map((res) => (res.success ? res.results : [])),
                catchError(() => {
                    this.notificationService.error('notifications.errors.load_items');
                    return of([]);
                }),
            )
            .subscribe((items) => this._items.set(items));
    }
}
```

## rxResource factory (for reactive search)

See the `rxresource-patterns` skill — expose `createXResource()` returning `{ results, isLoading, error, query }`.

Scaffold a matching `*.service.spec.ts` and add a `createMockFeatureService()` factory in `testing/mocks/` if other components will depend on it.
