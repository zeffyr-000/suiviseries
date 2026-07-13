---
description: Migrate legacy Angular code to signals, zoneless OnPush, and modern control flow
---

# Refactor to Signals

Modernize the target file to Suiviseries conventions. For multi-file efforts, delegate to the `angular-migration` subagent. Consult the `angular-components`, `angular-services`, and `rxresource-patterns` skills.

## Checklist

| Legacy                           | Modern                                   |
| -------------------------------- | ---------------------------------------- |
| `@Input()`                       | `input()` / `input.required()`           |
| `@Output()`                      | `output()`                               |
| `@HostBinding` / `@HostListener` | `host` object in decorator               |
| `*ngIf` / `*ngFor` / `*ngSwitch` | `@if` / `@for` / `@switch`               |
| `standalone: true`               | remove (default)                         |
| `changeDetection: …OnPush`       | remove (zoneless default)                |
| `ngClass` / `ngStyle`            | `class` / `style` bindings               |
| class field for state            | `signal()`                               |
| getter for derived state         | `computed()`                             |
| `markForCheck()`                 | remove                                   |
| constructor injection            | `inject()`                               |
| `BehaviorSubject` (shared state) | `signal()` + `asReadonly()` in a service |
| manual `switchMap` search        | `rxResource` factory                     |

## Project-Specific Rules

- Omit `changeDetection` (OnPush is the zoneless default)
- `readonly` on all injected deps and signals; access signals as `this.value()`
- State lives in services (no `@ngrx/signals` store)
- `styleUrl` singular; separate template/style files; English-only `//` comments

## After

```bash
npm test && npm run lint && npm run build
```

Show a summary of detected legacy patterns, apply changes grouped by type, and report verification results.
