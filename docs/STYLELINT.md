# Stylelint Configuration

## 📋 Overview

Stylelint is configured to enforce CSS/SCSS best practices and consistency across the codebase.

## 🚀 Usage

### CLI Commands

```bash
# Check all SCSS files
npm run lint:css

# Auto-fix fixable issues
npm run lint:css:fix

# Run all linters (ESLint + Stylelint)
npm run lint:all
```

### VS Code Integration

The project includes VS Code settings for automatic Stylelint integration:

1. **Install Extension**: `stylelint.vscode-stylelint` (recommended in `.vscode/extensions.json`)
2. **Auto-fix on Save**: Enabled by default in `.vscode/settings.json`
3. **Real-time Linting**: Errors appear in the Problems panel

## 📐 Rules Overview

### ✅ Enabled Rules

- **Selector patterns**: Enforce kebab-case class names with BEM notation support
- **SCSS syntax**: Validate SCSS-specific features (@use, @mixin, etc.)
- **Length units**: No units for zero values (`0` instead of `0px`)
- **Shorthand properties**: Enforce shorthand notation where possible
- **Redundant longhand**: Prevent redundant longhand properties
- **Nesting depth**: Maximum 5 levels (with exceptions for pseudo-classes)
- **No ID selectors**: Use classes instead

### ⚠️ Disabled/Relaxed Rules

The following rules are disabled to accommodate existing Material Design patterns:

- `custom-property-pattern`: Custom properties don't need MD tokens prefix
- `declaration-no-important`: `!important` allowed (Material overrides)
- `color-named`: Named colors allowed (e.g., `white`, `black`)
- `keyframes-name-pattern`: Flexible keyframe naming (camelCase allowed)
- `alpha-value-notation`: Both decimal (0.5) and percentage (50%) allowed
- `color-function-notation`: Both `rgba()` and `rgb()` allowed
- `selector-max-compound-selectors`: No limit (Material requires deep selectors)
- `declaration-block-single-line-max-declarations`: No limit for single-line blocks

## 🎨 Best Practices

### Class Naming

```scss
// ✅ Good: kebab-case
.my-component {
}
.hero-section {
}

// ✅ Good: BEM notation
.card {
}
.card__header {
}
.card__header--active {
}

// ❌ Bad: camelCase or PascalCase
.myComponent {
}
.HeroSection {
}
```

### Zero Units

```scss
// ✅ Good
margin: 0;
padding: 0 16px;

// ❌ Bad
margin: 0px;
padding: 0px 16px;
```

### Shorthand Properties

```scss
// ✅ Good
inset: 0;
overflow: hidden;
margin: 0 16px;

// ❌ Bad
top: 0;
right: 0;
bottom: 0;
left: 0;
overflow-x: hidden;
overflow-y: hidden;
margin: 0 16px 0 16px;
```

### SCSS Variables

```scss
// ✅ Good: kebab-case or camelCase
$primary-color: #ff4081;
$backgroundColor: #ffffff;

// ❌ Bad: snake_case or PascalCase
$primary_color: #ff4081;
$BackgroundColor: #ffffff;
```

## 🔧 Configuration Files

- **`.stylelintrc.json`**: Main configuration
- **`.stylelintignore`**: Ignored files/directories (node_modules, dist, etc.)
- **`.vscode/settings.json`**: VS Code integration settings
- **`.vscode/extensions.json`**: Recommended extensions

## 🐛 Troubleshooting

### VS Code not showing errors

1. Install the extension: `stylelint.vscode-stylelint`
2. Reload VS Code: `Cmd+Shift+P` → "Reload Window"
3. Check Output panel: `Stylelint` channel for errors

### False positives with Material Design

Some Material Design overrides require deep selectors (`::ng-deep`, `::v-deep`). These are allowed by the `selector-pseudo-element-no-unknown` rule.

### Conflicts with Prettier

Prettier handles formatting, Stylelint handles code quality. They are complementary:

- **Prettier**: Formatting (spacing, line breaks)
- **Stylelint**: Code quality (selector patterns, best practices)

Run both:

```bash
npm run format  # Prettier
npm run lint:css  # Stylelint
```

## 📚 Resources

- [Stylelint Official Docs](https://stylelint.io/)
- [SCSS Standard Config](https://github.com/stylelint-scss/stylelint-config-standard-scss)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
