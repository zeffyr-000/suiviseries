---
description: Scaffold a new Angular component following Suiviseries conventions
---

# Create Component

Create a new Angular component following project conventions. Consult the `angular-components` and `angular-templates` skills.

## Requirements

- Do NOT set `changeDetection` — OnPush is the zoneless default
- Do NOT set `standalone: true` (default since Angular 19+)
- Use `inject()` for dependencies (`private readonly`)
- Use `signal()` for local state, `computed()` for derived state
- Use `input()` / `input.required()` and `output()` — not decorators
- Separate template/style files (`templateUrl` + `styleUrl`, singular)
- All user-facing text via Transloco keys; Material components for UI

## Template

```typescript
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-component-name',
    imports: [TranslocoModule],
    templateUrl: './component-name.component.html',
    styleUrl: './component-name.component.scss',
    // OnPush is the zoneless default — do NOT set changeDetection
})
export class ComponentNameComponent {
    // Injected dependencies
    private readonly someService = inject(SomeService);

    // Signal inputs
    readonly data = input.required<DataType>();

    // Outputs
    readonly closed = output<void>();

    // Local signals
    protected readonly loading = signal(false);

    // Computed signals
    protected readonly displayValue = computed(() => this.data().name);

    // Methods
    handleClick(): void {
        this.closed.emit();
    }
}
```

## HTML template

```html
@if (loading()) {
<mat-spinner diameter="40" />
} @else {
<p class="body-large">{{ displayValue() }}</p>
}
```

## For routed components, add SEO

```typescript
ngOnInit(): void {
  this.title.setTitle(this.transloco.translate('page.title'));
  this.meta.updateTag({ name: 'description', content: this.transloco.translate('page.description') });
}
```

Also scaffold a matching `*.component.spec.ts` (see `/create-test`).
