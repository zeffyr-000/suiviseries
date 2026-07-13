---
description: Investigate and fix performance issues in Suiviseries
---

# Debug Performance

Diagnose runtime and bundle performance issues. Consult the `angular-components`, `rxresource-patterns`, and `scss-styling` skills.

## Runtime (change detection & rendering)

- Confirm components use the zoneless OnPush default (no stray `changeDetection`, no `markForCheck()`)
- Derived state should be `computed()` (memoized) — not recomputed in templates or getters
- `@for` must have a stable `track` (never `$index` for keyed data) to avoid full re-renders
- No function calls / `new Date()` / arrow functions in templates — move to `computed()`
- Reactive fetches should use `rxResource` (auto-cancels stale requests) instead of leaking subscriptions
- Use `NgOptimizedImage` for static images; lazy-load routes with `loadComponent`

## Network / data

- Cache user series in the service signal; avoid refetching on every navigation
- `rxResource` `params()` returns `undefined` to skip needless requests (e.g. short queries)
- Debounce search input before writing to the resource `query` signal

## Bundle

```bash
npm run build -- --configuration production
```

- Check output sizes; keep routes lazy (`loadComponent`)
- Watch for accidental eager imports of large Material modules
- Review the CI bundle-size gate (`.github/workflows/pr-check.yml`)

## Measure

- Chrome DevTools → Performance (record an interaction) and Lighthouse (PWA + performance)
- Angular DevTools → profiler for change-detection hotspots

## Workflow

1. Reproduce and **measure** the bottleneck (don't guess)
2. Identify the category: change detection, template work, network, or bundle
3. Apply the targeted fix
4. Re-measure to confirm the improvement
