# 🔍 Pluralization Validation Guide

## Code Review Checklist

### ✅ Check in Translations (fr.ts)

- [ ] Correct ICU format: `{count, plural, ...}`
- [ ] Mandatory `other` case present
- [ ] Special case `=0` for "none"
- [ ] Use of `#` to display count
- [ ] Consistent capitalization

### ✅ Check in Templates

- [ ] No conditional logic for plurals
- [ ] Parameter `{count: value}` always passed
- [ ] No separate `_plural` or `_singular` variables

### ❌ Anti-patterns to Avoid

```html
<!-- ❌ DON'T DO: Logic in template -->
{{ count > 1 ? ('key_plural' | transloco) : ('key_singular' | transloco) }}

<!-- ❌ DON'T DO: Separate variables -->
{{ count === 1 ? 'episode' : 'episodes' }}
```

```typescript
// ❌ DON'T DO: Separate keys
"episodes_singular": "{{count}} épisode",
"episodes_plural": "{{count}} épisodes"
```

### ✅ Correct Examples

```html
<!-- ✅ DO: Simple and clean -->
{{ 'series.episodes' | transloco: {count: serie.episode_count} }}
```

```typescript
// ✅ DO: Unified ICU rule
"series.episodes": "{count, plural, =0 {No episodes} one {# episode} other {# episodes}}"
```

## Verification Commands

```bash
# Search for anti-patterns in templates
grep -r "transloco.*plural\|transloco.*singular" src/app --include="*.html"

# Search for ternary conditions with transloco
grep -r "? .*transloco.*: .*transloco" src/app --include="*.html"

# Check translations with count but without ICU format
grep -r "{{count}}" src/app/i18n --include="*.ts"
```

## Validation Tests

Here's how to test plurals:

```typescript
// Test with different values
const testCases = [
  { count: 0, expected: 'No episodes' },
  { count: 1, expected: '1 episode' },
  { count: 2, expected: '2 episodes' },
  { count: 10, expected: '10 episodes' },
];

testCases.forEach(({ count, expected }) => {
  const result = transloco.translate('series.episodes', { count });
  expect(result).toBe(expected);
});
```
