---
name: angular-components
description: Angular component structure and conventions for Suiviseries — zoneless OnPush default, signal inputs/outputs/computed, inject(), styleUrl, separate template/style files, and SEO for routed components. Use when creating or editing *.component.ts files.
---

# Angular Component Instructions

## Structure

```typescript
@Component({
    selector: 'app-my-feature',
    imports: [TranslocoModule, MatCardModule, MatButtonModule],
    templateUrl: './my-feature.component.html', // ALWAYS separate files
    styleUrl: './my-feature.component.scss', // singular
    // Zoneless default = OnPush — do NOT set changeDetection
})
export class MyFeatureComponent {
    // 1. Injected dependencies (private readonly for services)
    private readonly seriesService = inject(SeriesService);
    private readonly route = inject(ActivatedRoute);

    // 2. Inputs / Outputs
    readonly serie = input.required<Serie>();
    readonly priority = input(false);
    readonly closed = output<void>();

    // 3. Local state (signals)
    protected readonly loading = signal(false);

    // 4. Computed signals
    protected readonly displayName = computed(
        () => this.serie().name || this.serie().original_name,
    );

    // 5. Methods
    onSelect(): void {
        this.closed.emit();
    }
}
```

## Critical Rules

- **Zoneless default is OnPush** — express it by **omitting** `changeDetection`. Add `ChangeDetectionStrategy.OnPush` only when setting it explicitly; never use `.markForCheck()` with signals
- Must NOT set `standalone: true` — it is the default in Angular v22+
- Use `styleUrl` (singular), not `styleUrls`
- **ALWAYS separate files** for templates and styles — never inline `template:`/`styles:`
- Use `signal()` for mutable local state, `computed()` for derived state
- `readonly` on all injected dependencies and signals
- Use `inject()`, never constructor injection
- Use the `host` object in the decorator instead of `@HostBinding`/`@HostListener`

## Signal Inputs & Outputs

```typescript
readonly serieId = input.required<string>();
readonly count = input(0, { transform: numberAttribute });
readonly closed = output<void>();
readonly selected = output<Serie>();
```

Access injected signals with function-call syntax: `this.serie()`, `this.loading()`.

## Consuming rxResource

For search / reactive data, consume a resource factory from the service (see the `rxresource-patterns` skill):

```typescript
private readonly searchResource = this.seriesService.createSearchResource();
protected readonly results = computed(() => this.searchResource.results());
protected readonly loading = computed(() => this.searchResource.isLoading());
```

## SEO (Routed Components Only)

Routed components should set the page title and meta description via Transloco keys:

```typescript
private readonly title = inject(Title);
private readonly meta = inject(Meta);
private readonly transloco = inject(TranslocoService);

ngOnInit(): void {
  this.title.setTitle(this.transloco.translate('serie.detail.title', { name }));
  this.meta.updateTag({ name: 'description', content: this.transloco.translate('serie.detail.description') });
}
```

## Accessibility

- Lean on Material's built-in ARIA — do not add redundant `tabindex`, `role`, or `keydown` handlers on Material directives
- Provide alt text on images; use `NgOptimizedImage` for static images (not base64)
