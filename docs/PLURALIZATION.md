# Pluralization Guide with Transloco MessageFormat

This project uses `@jsverse/transloco-messageformat` to handle plurals according to ICU (International Components for Unicode) standards.

## 📖 Basic Rules

### ICU Format for Plurals

```typescript
{
  "myPluralRule": "{count, plural, =0 {no results} one {1 result} other {# results}}"
}
```

### Available Keywords

| Keyword             | Description                | Example                      |
| ------------------- | -------------------------- | ---------------------------- |
| `=0`, `=1`, `=2`... | Exact value                | `=0 {none}`, `=1 {one only}` |
| `zero`              | Zero form (some languages) | `zero {nothing}`             |
| `one`               | Singular form              | `one {# item}`               |
| `two`               | Dual form (some languages) | `two {both items}`           |
| `few`               | Few form (some languages)  | `few {# items}`              |
| `many`              | Many form (some languages) | `many {# items}`             |
| `other`             | Default form (mandatory)   | `other {# items}`            |

### Symbol `#`

- `#` is replaced by the value of the `count` parameter
- Example: `{count: 5}` → `# results` becomes `5 results`

## � Localization Rules

For most languages, we primarily use:

- `=0`: Special case for zero ("none", "no items")
- `one`: Singular (count = 1)
- `other`: Plural (count > 1)

### Examples

```typescript
{
  // ✅ Correct
  "series.episodes": "{count, plural, =0 {No episodes} one {# episode} other {# episodes}}",
  "search.results": "{count, plural, =0 {no results} one {# result} other {# results}}",

  // ❌ Incorrect - logic in template
  "episodes_count": "{{count}} episodes",
  "episodes_singular": "{{count}} episode"
}
```

## 🛠 Usage in Templates

### ✅ Good Practice

```html
<!-- Simple and clean -->
<span>{{ 'series.episodes' | transloco: {count: serie.episode_count} }}</span>
<span>{{ 'search.results' | transloco: {count: results.length} }}</span>
```

### ❌ Bad Practice

```html
<!-- Complex logic in template -->
<span>
  {{ serie.episode_count > 1 ? ('series.episodes_plural' | transloco: {count: serie.episode_count})
  : ('series.episodes_singular' | transloco: {count: serie.episode_count}) }}
</span>
```

## 🌍 Rules for Other Languages

### English

```typescript
{
  "items": "{count, plural, =0 {no items} one {# item} other {# items}}"
}
```

### Russian (more complex)

```typescript
{
  "files": "{count, plural, =0 {нет файлов} one {# файл} few {# файла} many {# файлов} other {# файлов}}"
}
```

### Arabic (very complex)

```typescript
{
  "books": "{count, plural, =0 {لا توجد كتب} =1 {كتاب واحد} =2 {كتابان} few {# كتب} many {# كتاباً} other {# كتاب}}"
}
```

## 📝 Practical Project Examples

### 1. Series Episodes

```typescript
// en.ts
"series": {
  "episodes": "{count, plural, =0 {No episodes} one {# episode} other {# episodes}}"
}

// template.html
<span>{{ 'series.episodes' | transloco: {count: serie.number_of_episodes} }}</span>
```

**Result:**

- `count = 0` → "No episodes"
- `count = 1` → "1 episode"
- `count = 5` → "5 episodes"

### 2. Search Results

```typescript
// en.ts
"search": {
  "results_count": "{count, plural, =0 {no results} one {# result} other {# results}}"
}

// template.html
<mat-chip>{{ 'search.results_count' | transloco: {count: searchResults.length} }}</mat-chip>
```

**Result:**

- `count = 0` → "no results"
- `count = 1` → "1 result"
- `count = 10` → "10 results"

### 3. Votes/Ratings

```typescript
// en.ts
"serie_detail": {
  "votes": "{count, plural, =0 {no votes} one {# vote} other {# votes}}"
}

// template.html
<span>({{ 'serie_detail.votes' | transloco: {count: serie.vote_count} }})</span>
```

## ✨ Benefits of This Approach

1. **🧹 Cleaner Code**: No conditional logic in templates
2. **🌍 Internationalization**: Automatic support for complex language rules
3. **🔧 Maintenance**: Translators can modify rules without touching code
4. **📏 Standards**: Using globally recognized ICU standards
5. **🎯 Precision**: Fine-grained handling of special cases (zero, one, many)

## 🚨 Common Errors

### 1. Forgetting the `other` case

```typescript
// ❌ Error - missing 'other'
"items": "{count, plural, one {# item}}"

// ✅ Correct
"items": "{count, plural, one {# item} other {# items}}"
```

### 2. Wrong syntax

```typescript
// ❌ Error - wrong syntax
"items": "{count plural one {# item} other {# items}}"

// ✅ Correct - comma required after 'plural'
"items": "{count, plural, one {# item} other {# items}}"
```

### 3. Missing parameter

```html
<!-- ❌ Error - no count parameter -->
<span>{{ 'series.episodes' | transloco }}</span>

<!-- ✅ Correct -->
<span>{{ 'series.episodes' | transloco: {count: serie.episode_count} }}</span>
```

## 🔗 Useful Resources

- [ICU MessageFormat Documentation](http://userguide.icu-project.org/formatparse/messages)
- [Transloco MessageFormat](https://jsverse.github.io/transloco/docs/plugins/message-format/)
- [Plural Rules by Language](https://unicode-org.github.io/cldr-staging/charts/37/supplemental/language_plural_rules.html)

## 📋 Developer Checklist

Before adding a new translation with counting:

- [ ] Use ICU format `{count, plural, ...}`
- [ ] Include at minimum `one` and `other`
- [ ] Add `=0` for special zero cases
- [ ] Use `#` to display the number
- [ ] Pass `{count: value}` parameter in template
- [ ] Test with 0, 1 and multiple values

---

_Last updated: September 2025_
