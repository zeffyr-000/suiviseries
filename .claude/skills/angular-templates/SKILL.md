---
name: angular-templates
description: Angular template conventions for Suiviseries — native control flow (@if/@for/@switch), class/style bindings over ngClass/ngStyle, Transloco for all user-facing text, loading and empty states, and Material Design markup. Use when editing *.html templates.
---

# Angular Template Instructions

## Control Flow

Use native control flow — NEVER `*ngIf` / `*ngFor` / `*ngSwitch`:

```html
@if (loading()) {
  <mat-spinner diameter="40" />
} @else if (results().length === 0) {
  <p class="body-large empty-state">{{ 'search.empty' | transloco }}</p>
} @else {
  <div class="series-grid">
    @for (serie of results(); track serie.id) {
      <app-serie-card [serie]="serie" />
    }
  </div>
}
```

- Always provide a `track` expression in `@for` (use a stable id, never `$index` for keyed data)
- Use `@empty` blocks on `@for` where a distinct empty state helps

## Bindings

- Use `class` bindings — NOT `ngClass`: `[class.is-active]="isActive()"`
- Use `style` bindings — NOT `ngStyle`: `[style.width.px]="width()"`
- No arrow functions in templates; no globals like `new Date()` — compute in the component with `computed()`
- Use the `| async` pipe for observables

## Transloco (mandatory for all user-facing text)

```html
<h1 class="display-large">{{ 'home.title' | transloco }}</h1>
<button mat-button>{{ 'actions.follow' | transloco }}</button>

<!-- With parameters / pluralization -->
<span>{{ 'serie.seasons' | transloco: { count: serie().number_of_seasons } }}</span>
```

No hard-coded strings in templates — every label goes through a translation key (see the `transloco-i18n` skill).

## Loading & Empty States

- Show a Material spinner or skeleton while `loading()` is true
- Render a clear empty state (`.empty-state`) when a list is empty
- Use `@if`/`@else` to switch between loading / empty / content

## Material Markup

- Prefer Material components (`mat-card`, `mat-button`, `mat-icon`, `matInput`) — see the `material-design-3` skill
- Use M3 typography classes (`display-*`, `headline-*`, `body-*`, `label-*`) instead of inline font sizes
- Let Material handle ARIA/keyboard — do not add redundant `tabindex`/`role`/`keydown`
