---
name: angular-services
description: Service conventions for Suiviseries — providedIn:'root' singletons, inject(), signal state with the _private/asReadonly pattern, HTTP error handling that returns defaults and notifies via NotificationService, and rxResource factories. Use when editing src/app/services/**.
---

# Angular Service Instructions

State lives in services (this project has **no `@ngrx/signals` store**). Services own HTTP calls, business logic, and signal-based state.

## Structure

```typescript
@Injectable({ providedIn: 'root' })
export class SeriesService {
    private readonly http = inject(HttpClient);
    private readonly notificationService = inject(NotificationService);
    private readonly apiUrl = environment.apiUrl;

    // Signal state: private writable + public readonly
    private readonly _userSeries = signal<Serie[]>([]);
    readonly userSeries = this._userSeries.asReadonly();

    loadUserSeries(): void {
        this.http
            .get<UserSeriesResponse>(`${this.apiUrl}/user/series`)
            .pipe(
                map((res) => (res.success ? res.results.map((r) => r.serie) : [])),
                catchError(() => {
                    this.notificationService.error('notifications.errors.load_series');
                    return of([]);
                }),
            )
            .subscribe((series) => this._userSeries.set(series));
    }
}
```

## Rules

- `providedIn: 'root'` for singletons
- `inject()` — never constructor injection
- `readonly` on all injected dependencies
- Expose state as `private readonly _state = signal<T>()` + `readonly state = this._state.asReadonly()`
- Update with `set()` / `update()` — never `mutate()`
- Access signals with function-call syntax: `this.userSeries()`

## HTTP Error Handling Pattern

Every HTTP call returns an empty/default value on error and notifies the user with a translation key:

```typescript
return this.http.get<Response>(`${this.apiUrl}/endpoint`).pipe(
    map((response) => (response.success ? response.results : [])),
    catchError(() => {
        this.notificationService.error('notifications.errors.your_key');
        return of([]);
    }),
);
```

- Always check the `success` envelope flag before using `results` / `serie`
- Never swallow errors silently — notify via `NotificationService` (translation key, not literal text)
- Backend payloads are snake_case (TMDB-shaped) — see the `api-data-mapping` skill

## rxResource Factories

For reactive fetching with auto-cancellation, expose an `rxResource` factory from the service — see the `rxresource-patterns` skill.

## Key Services

- `AuthService` — Google OAuth, JWT in localStorage, `isAuthenticated()` signal
- `SeriesService` — user series cache + search `rxResource`
- `MetadataService` — series/season/episode detail
- `NotificationService` — `MatSnackBar` wrapper (translation keys)
- `UserNotificationService` — notification state signals
- `PushNotificationService`, `UpdateService`, `KeepAliveService`, `AnalyticsRouterService`
