# Performance Optimization - User Series Cache

## Problem Identified

The `/api/users/me/series` endpoint was called on every URL change, especially when navigating between series detail pages (`/serie/:id/:slug`). This situation created unnecessary API calls because:

1. User's followed series data doesn't change simply by navigating between pages
2. The `isSerieReallyFollowed()` method was called in the `ngOnInit` chain of the `serie-detail` component
3. Each call to `isSerieReallyFollowed()` triggered a new HTTP call via `getUserSeries()`

## Implemented Solution

### Signal-based Cache

Implementation of a cache system using Angular signals in `SeriesService`:

```typescript
private readonly userSeriesCache = signal<Serie[] | null>(null);
```

### getUserSeries() Modification

```typescript
getUserSeries(forceRefresh = false): Observable<Serie[]> {
    // Use cached data if available and not forcing refresh
    const cachedData = this.userSeriesCache();
    if (!forceRefresh && cachedData !== null) {
        return of(cachedData);
    }

    return this.http.get<UserSeriesResponse>(`${this.apiUrl}/users/me/series`).pipe(
        map(response => response.success && response.results ? response.results.map(item => item.serie) : []),
        tap(series => this.userSeriesCache.set(series)),
        catchError(() => {
            this.notificationService.error('notifications.errors.load_user_series');
            return of([]);
        })
    );
}
```

### Cache Invalidation

The cache is automatically invalidated after operations that modify followed series:

```typescript
private invalidateCache(): void {
    this.userSeriesCache.set(null);
}
```

Called in:

- `followSerie()` - after adding a series
- `unfollowSerie()` - after removing a series

### Force Refresh for my-series

The `my-series` component forces cache refresh on initial load and refresh button:

```typescript
this.seriesService.getUserSeries(true).pipe(
    takeUntilDestroyed(this.destroyRef)
).subscribe({...});
```

## Benefits

1. **Reduced API Calls**: One call per session instead of one call per navigation
2. **Better Reactivity**: Data is returned instantly from cache
3. **Data Consistency**: Cache is automatically invalidated on modifications
4. **Flexibility**: Ability to force refresh when needed

## Tests

New tests verify:

- First call makes an HTTP request
- Second call uses cache (no HTTP request)
- `forceRefresh: true` triggers a new request
- Cache is invalidated after `followSerie()` and `unfollowSerie()`

## Impact

- **Before**: ~10 `/me/series` requests during a typical navigation session
- **After**: 1-2 `/me/series` requests per session (except manual refresh)
