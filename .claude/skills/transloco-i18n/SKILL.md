---
name: transloco-i18n
description: Transloco internationalization for Suiviseries — translation keys in src/app/i18n/fr.ts, MessageFormat pluralization, the | transloco pipe and TranslocoService.translate(), and testing against keys. Use when adding user-facing text or translations.
---

# Transloco i18n

All user-facing text MUST go through Transloco translation keys — no hard-coded strings in templates or notifications.

## Translation Files

Keys live in `src/app/i18n/fr.ts` (French is primary). Keys are namespaced by feature/domain, e.g. `notifications.errors.load_series`, `serie.detail.title`, `actions.follow`.

## Usage

**Templates** — the `| transloco` pipe:

```html
<h1 class="display-large">{{ 'home.title' | transloco }}</h1>
<button mat-button>{{ 'actions.follow' | transloco }}</button>
<span>{{ 'serie.seasons' | transloco: { count: serie().number_of_seasons } }}</span>
```

**Components/Services** — `TranslocoService.translate()`:

```typescript
private readonly transloco = inject(TranslocoService);
this.title.setTitle(this.transloco.translate('serie.detail.title', { name }));
```

**Notifications** — pass the key to `NotificationService` (it translates):

```typescript
this.notificationService.error('notifications.errors.load_series');
```

## MessageFormat Pluralization

The project uses `@jsverse/transloco-messageformat`. Use ICU MessageFormat for counts/plurals:

```typescript
"seasons": "{count, plural, =0 {Aucune saison} one {# saison} other {# saisons}}",
"episodes": "{count, plural, =0 {Aucun épisode} one {# épisode} other {# épisodes}}"
```

- Cover `=0`, `one`, and `other` at minimum
- `#` interpolates the count
- Pass params as an object: `{ count: n }`

## Testing

- Use `getTranslocoTestingModule()` from `testing/transloco-testing.module.ts` — **never** inline `TranslocoTestingModule.forRoot()`
- Assert against **translation keys**, not translated strings:

```typescript
expect(notificationService.error).toHaveBeenCalledWith('notifications.errors.load_series');
```

## Rules

- Add a key to `i18n/fr.ts` whenever you introduce user-facing text
- Keep keys namespaced and descriptive; reuse existing namespaces
- Never concatenate translated fragments — use a single parameterized key
