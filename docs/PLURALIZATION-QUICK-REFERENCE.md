# � Quick Reference: ICU Pluralization

## Standard Format

```typescript
"my_key": "{count, plural, =0 {no items} one {# item} other {# items}}"
```

## Common Examples

### Masculine Elements (French)

```typescript
"episodes": "{count, plural, =0 {No episodes} one {# episode} other {# episodes}}"
"results": "{count, plural, =0 {no results} one {# result} other {# results}}"
"votes": "{count, plural, =0 {no votes} one {# vote} other {# votes}}"
"users": "{count, plural, =0 {no users} one {# user} other {# users}}"
```

### Feminine Elements (French)

```typescript
"series": "{count, plural, =0 {No series} one {# series} other {# series}}"
"seasons": "{count, plural, =0 {No seasons} one {# season} other {# seasons}}"
"minutes": "{count, plural, =0 {no minutes} one {# minute} other {# minutes}}"
```

### Usage in Templates

```html
<span>{{ 'my_key' | transloco: {count: myVariable} }}</span>
```

## ⚡ Quick Copy-Paste

```typescript
// Standard with capitalization
'{count, plural, =0 {No XXX} one {# XXX} other {# XXXs}}';

// Standard without capitalization
'{count, plural, =0 {no XXX} one {# XXX} other {# XXXs}}';

// Special cases (e.g., series)
'{count, plural, =0 {No XXX} one {# XXX} other {# XXX}}';
```

Replace `XXX` with your word and `XXXs` with the plural form.
