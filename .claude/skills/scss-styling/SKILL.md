---
name: scss-styling
description: SCSS conventions for Suiviseries — component-scoped styleUrl files, M3 design tokens and CSS custom properties, the responsive breakpoint mixins in src/styles, spacing variables, and hover-guarded interactions. Use when editing *.scss files.
---

# SCSS Styling

## Organization

- Component styles live in the component's own `*.component.scss` (referenced via `styleUrl`, singular)
- Shared partials in `src/styles/`: `_theme-colors.scss` (generated M3 palette), `_mixins.scss` (breakpoints), `_focus.scss` (focus-visible styles)
- Global app-shell styles in `src/app/app.scss`
- Import mixins with `@use '../styles/mixins' as *;`

## Design Tokens (use, don't hardcode)

- Colors: CSS custom properties — `var(--primary-color)`, and M3 system tokens; use `color-mix(in srgb, var(--primary-color) 16%, transparent)` for tints
- Spacing: `var(--spacing-xs|sm|md|lg)` — never magic pixel gaps
- Shape: M3 radii (buttons 20px, cards 16px, dialogs 12px, nav items 28px)
- Elevation: `var(--md-sys-elevation-level1..5)` — never custom `box-shadow`
- Motion: `150ms cubic-bezier(0.2, 0, 0, 1)` for hover/active; `300–400ms` for enter/exit

See the `material-design-3` skill for the full token reference.

## Responsive — use the mixins

Breakpoints (`src/styles/_mixins.scss`): `xs 0`, `sm 600px`, `md 905px`, `lg 1240px`, `xl 1440px`.

```scss
@use '../styles/mixins' as *;

.series-grid {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: 1fr;

  @include respond-to(sm) {
    grid-template-columns: repeat(2, 1fr);
  }
  @include respond-to(lg) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

Use `respond-to($breakpoint)` (min-width) and `respond-below($breakpoint)` (max-width) — do not write raw `@media (min-width: 600px)`.

## Interaction Rules

- Guard hover effects: `@media (hover: hover) { &:hover { … } }` so touch devices don't get stuck hover states
- Keyboard focus: rely on `:focus-visible` (see `_focus.scss`), 2px outline with offset
- Press feedback: `&:active { transform: scale(0.96); transition-duration: 100ms; }`
- Respect `@media (prefers-reduced-motion: reduce)` for non-essential animation

## Rules

- Prefer Material component styling and utility patterns over bespoke CSS when a token/component covers it
- Keep `!important` to the narrow cases where Material's MDC styles must be overridden (documented in the M3 guidelines)
- Nest no deeper than needed; keep selectors shallow and component-scoped
