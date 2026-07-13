---
name: rxresource-patterns
description: The rxResource reactive-fetching pattern for Suiviseries (Angular 22+) — service-owned resource factories, params() returning undefined to skip requests, automatic request cancellation, and consuming isLoading/error/hasValue signals in components. Use when adding search or reactive data fetching.
---

# rxResource Patterns

`rxResource` (Angular 22+) fetches data reactively with automatic request cancellation — like `switchMap`, but exposing `isLoading` / `error` / `hasValue` signals. Data-fetching logic stays in the **service**; the component consumes signals.

## Service — expose a resource factory

```typescript
// models/search-resource.model.ts defines SearchResource
createSearchResource(): SearchResource {
  const query = signal('');
  const resource = rxResource<Serie[], string | undefined>({
    params: () => {
      const q = query().trim();
      return q.length >= 2 ? q : undefined; // undefined => request is skipped
    },
    stream: ({ params: q }) => (q ? this.searchSeries(q) : of([])),
  });

  return {
    results: computed(() => resource.value() ?? []),
    isLoading: resource.isLoading,
    error: resource.error,
    hasValue: computed(() => resource.hasValue()),
    query, // component writes into this signal
  };
}
```

## Component — consume the resource

```typescript
private readonly searchResource = this.seriesService.createSearchResource();

protected readonly results = computed(() => this.searchResource.results());
protected readonly loading = computed(() => this.searchResource.isLoading());
protected readonly hasResults = computed(() => this.searchResource.results().length > 0);

onQueryChange(value: string): void {
  this.searchResource.query.set(value); // triggers params() re-evaluation
}
```

## Rules

- Return **`undefined` from `params()`** to skip the request (e.g. query too short) — do not fetch on empty input
- Keep the `rxResource` creation inside the service factory, not the component
- `stream` returns an Observable; reuse the existing HTTP method (which already has `catchError`)
- Consume `resource.value() ?? []` — `value()` is `undefined` before the first successful load
- Previous in-flight requests are cancelled automatically when `params()` changes

## When NOT to use rxResource

- One-shot loads triggered imperatively (button click, `ngOnInit`) → a plain `http.get(...).subscribe()` writing into a signal is simpler
- Shared cached state read across components → keep it in a service signal (`_state` / `asReadonly()`)
