---
name: material-design-3
description: Angular Material + Material Design 3 conventions for Suiviseries — M3 typography/shape/elevation/motion tokens, component sizing (buttons, cards, sidenav), NotificationService over raw MatSnackBar, and accessibility. Use when writing Material markup, theming, or component styles.
---

# Material Design 3

This app uses **Angular Material 22** with **Material Design 3 (M3)** — not Bootstrap. Follow M3 design tokens; never hardcode arbitrary values.

## User Notifications

Never call `MatSnackBar` directly for user-facing text — use `NotificationService`, which wraps it and takes **translation keys**:

```typescript
this.notificationService.error('notifications.errors.load_series');
this.notificationService.success('notifications.success.serie_added');
```

## Layout — Sidenav over Menu

- **MatMenu is capped at max-width 280px.** For wider panels use `MatSidenav` with `position="end"`.
- Sidenav: `mode="over"`, sync open state with `(openedChange)`; multiple sidenavs need unique template refs (`#sidenav`, `#notificationsSidenav`).
- The app uses a leading nav drawer (280px) and a trailing notifications drawer (400px) — see `app.scss`.

## Design Tokens

Prefer CSS custom properties / M3 tokens over literals.

**Typography classes** (never inline `font-size`):
`display-large|medium|small`, `headline-large|medium|small`, `title-*`, `body-large|medium|small`, `label-large|medium|small`.

**Shape (border-radius):**

| Element             | Radius                   |
| ------------------- | ------------------------ |
| Buttons             | 20px (full, 40px height) |
| Cards               | 16px (large shape)       |
| Dialogs / Menus     | 12px (medium)            |
| Form field outlines | 28px (full)              |
| Chips               | 12px                     |
| Active nav items    | 28px                     |

**Elevation:** use `var(--md-sys-elevation-level0..5)` — never custom `box-shadow`. Cards at rest = level1, hover/menus = level2.

**Motion:** standard hover/active = `150ms cubic-bezier(0.2, 0, 0, 1)` (emphasized easing); enter/exit = `300–400ms`. Press: `&:active { transform: scale(0.96); transition-duration: 100ms; }`.

## Component Sizing (M3)

- Standard buttons: `min-height: 40px`, `border-radius: 20px`, `label-large` typography
- Icon buttons: `40×40px`, icon `24px`
- FAB: `56×56px`; mini-FAB: `40×40px`
- Respect touch-target minimums (≥ 40px, ideally 48px)

## Theming

The M3 theme is generated (`src/styles/_theme-colors.scss`, from `ng generate @angular/material:theme-color`) and applied via `mat.theme(...)`. Palette is gold/blue-based (primary ~#C8A951, secondary ~#3E4D8C). Edit the generated file with caution — prefer regenerating. See the `scss-styling` skill for how tokens are consumed.

## Extended Reference

The full M3 token catalog and component-override rules (typography scale, shape/elevation/motion tables, MDC overrides) live in `docs/MATERIAL_DESIGN_GUIDELINES.md`, with `docs/MATERIAL_DESIGN_REVIEW.md` and `docs/MATERIAL_DESIGN_VALIDATION.md` for review/validation checklists. Consult them for exhaustive values beyond this summary.

## Accessibility

- Target WCAG AA (AAA where feasible) and pass AXE checks
- Let Material handle ARIA and keyboard — do **not** add redundant `tabindex`, `role`, or `keydown` handlers
- Keep visible focus states (`:focus-visible` outline; see `src/styles/_focus.scss`)
- Maintain color contrast when overriding palette colors
