---
name: typescript-conventions
description: TypeScript conventions for Suiviseries — strict typing, no any (use unknown / proper types), English-only // comments (no JSDoc), console.error over empty handlers, and inference where obvious. Use for any *.ts file.
---

# TypeScript Conventions

## Typing

- Strict type checking; prefer inference when the type is obvious
- **Avoid `any`** — use `unknown` when the type is genuinely uncertain, then narrow
- Cast with `(value as Type)`, never through `any`
- Prefer `interface` for object shapes (see `models/`), `type` for unions/aliases
- Use `enum` sparingly — `SerieStatus` is the established one

## Comments

- Simple `//` comments in **English only**
- **No JSDoc** `/** */` blocks
- Comment the _why_, not the _what_

## Error Handling

- Use `console.error()` in catch handlers — never empty functions (`@typescript-eslint/no-empty-function` will flag them)
- In services, `catchError` should notify via `NotificationService` and return a default (see the `angular-services` skill)

## Style

- `readonly` for injected dependencies, signals, and immutable fields
- Single quotes (`'`), 2-space indentation, 100-char print width (enforced by Prettier)
- Prefer `const`; use `undefined` (not `null`) for "absent" unless the backend model uses `null`
- Model fields mirror the backend snake_case shape (see the `api-data-mapping` skill)
