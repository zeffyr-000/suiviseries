# Material Design 3 Guidelines

> **Project Reference**: Material Design 3 implementation standards for SuiviSeries  
> This document serves as the design system reference to maintain consistency and code quality.

## 🎯 Project Context

**SuiviSeries** is a professional Angular 21 demo application showcasing:

- ✅ Material Design 3 and Angular Material mastery
- ✅ WCAG 2.1 AAA accessibility compliance
- ✅ Modern architecture (Standalone components, Signals)
- ✅ Maintainable code following best practices
- ✅ External API integration (TMDB)
- ✅ Professional user experience

---

## 📐 Design System

### M3 Typography

**ALWAYS use defined M3 typographic classes**, never inline `font-size`:

```scss
// Display (Large announcements, hero sections)
.display-large {
  font-size: 3.5rem;
  font-weight: 400;
  line-height: 1.12;
  letter-spacing: -0.02em;
}
.display-medium {
  font-size: 2.8rem;
  font-weight: 400;
  line-height: 1.16;
  letter-spacing: 0;
}
.display-small {
  font-size: 2.25rem;
  font-weight: 400;
  line-height: 1.22;
  letter-spacing: 0;
}

// Headlines (Section titles)
.headline-large {
  font-size: 2rem;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: 0;
}
.headline-medium {
  font-size: 1.75rem;
  font-weight: 400;
  line-height: 1.29;
  letter-spacing: 0;
}
.headline-small {
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.33;
  letter-spacing: 0;
}

// Body (Regular text)
.body-large {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.03em;
}
.body-medium {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.43;
  letter-spacing: 0.018em;
}
.body-small {
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.33;
  letter-spacing: 0.033em;
}

// Labels (Buttons, chips, badges)
.label-large {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.43;
  letter-spacing: 0.018em;
}
.label-medium {
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.33;
  letter-spacing: 0.033em;
}
.label-small {
  font-size: 0.688rem;
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: 0.036em;
}
```

**Usage example:**

```html
<h1 class="display-large">Main Title</h1>
<h2 class="headline-medium">Section</h2>
<p class="body-large">Important text</p>
<button class="label-large">Action</button>
```

---

### Shapes & Border-Radius M3

**ALWAYS use defined M3 tokens**, never arbitrary values:

```scss
--md-sys-shape-corner-none: 0px;
--md-sys-shape-corner-extra-small: 4px; // Tags, micro-éléments
--md-sys-shape-corner-small: 8px; // Cards secondaires, chips
--md-sys-shape-corner-medium: 12px; // Menus, dialogs, form fields
--md-sys-shape-corner-large: 16px; // Cards principales
--md-sys-shape-corner-extra-large: 28px; // Navigation drawer
--md-sys-shape-corner-full: 9999px; // Boutons (20px-28px selon taille)
```

**Application rules:**

- **Buttons**: `border-radius: 20px` (full rounding, adapted to 40px height)
- **Cards**: `border-radius: 16px` (large shape)
- **Dialogs/Menus**: `border-radius: 12px` (medium shape)
- **Form Fields**: `border-radius: 28px` for outlines (full rounding)
- **Chips**: `border-radius: 12px` (chips are distinct from buttons)
- **Navigation**: `border-radius: 28px` for active items

---

### Elevation System (Shadows)

**ALWAYS use M3 levels**, never custom `box-shadow`:

```scss
--md-sys-elevation-level0: none;
--md-sys-elevation-level1: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
--md-sys-elevation-level2: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15);
--md-sys-elevation-level3: 0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15);
--md-sys-elevation-level4: 0px 2px 3px 0px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15);
--md-sys-elevation-level5: 0px 4px 4px 0px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15);
```

**State mapping:**

- Level 0: Flat surfaces (active app bar)
- Level 1: Cards at rest, raised buttons
- Level 2: Cards hover, menus, dialogs
- Level 3: Cards dragged, FAB hover
- Level 4: Navigation drawer (mobile)
- Level 5: Modal backdrops

---

### Motion & Animations M3

**ALWAYS use defined M3 durations and easing**:

#### Durations

```scss
// Micro (50-200ms) - Simple state changes
--md-sys-motion-duration-short1: 50ms;
--md-sys-motion-duration-short2: 100ms;
--md-sys-motion-duration-short3: 150ms; // ⭐ Standard for hover/active
--md-sys-motion-duration-short4: 200ms;

// Medium (250-400ms) - Content transitions
--md-sys-motion-duration-medium1: 250ms;
--md-sys-motion-duration-medium2: 300ms; // ⭐ Standard for enter/exit
--md-sys-motion-duration-medium3: 350ms;
--md-sys-motion-duration-medium4: 400ms; // ⭐ Cards, panels

// Long (450-600ms) - Complex transitions
--md-sys-motion-duration-long1: 450ms;
--md-sys-motion-duration-long2: 500ms;
--md-sys-motion-duration-long3: 550ms;
--md-sys-motion-duration-long4: 600ms;

// Extra-Long (700-1000ms) - Narrative animations
--md-sys-motion-duration-extra-long1: 700ms;
--md-sys-motion-duration-extra-long2: 800ms;
--md-sys-motion-duration-extra-long3: 900ms;
--md-sys-motion-duration-extra-long4: 1000ms;
```

#### Easing Functions

```scss
// Standard - Most common, balanced feel
--md-sys-motion-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);

// Emphasized - ⭐ PREFERRED for important transitions
--md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);

// Emphasized Decelerate - Entrances (elements appearing)
--md-sys-motion-easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);

// Emphasized Accelerate - Exits (elements disappearing)
--md-sys-motion-easing-emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
```

**Application rules:**

```scss
// Hover/Active states
transition: all 150ms cubic-bezier(0.2, 0, 0, 1);

// Fade in/out, slide transitions
transition: opacity 300ms cubic-bezier(0.2, 0, 0, 1), transform 300ms cubic-bezier(0.2, 0, 0, 1);

// Card entrance
animation: cardFadeIn 400ms cubic-bezier(0.2, 0, 0, 1) both;

// Press/Release
&:active {
  transform: scale(0.96);
  transition-duration: 100ms;
}
```

---

## 🎨 Standard Components

### Buttons (CRITICAL)

**M3 Standard Heights:**

```scss
// Standard buttons
.mat-mdc-button,
.mat-mdc-raised-button,
.mat-mdc-outlined-button {
  min-height: 40px !important;
  border-radius: 20px !important;
  font-size: 0.875rem !important; // label-large
  font-weight: 500 !important;
  letter-spacing: 0.1px !important;
}

// Icon buttons
.mat-mdc-icon-button {
  width: 40px !important;
  height: 40px !important;

  mat-icon {
    font-size: 24px;
    width: 24px;
    height: 24px;
  }
}

// FAB (Floating Action Button)
.mat-mdc-fab {
  width: 56px !important;
  height: 56px !important;

  mat-icon {
    font-size: 24px;
  }
}

// Mini FAB
.mat-mdc-mini-fab {
  width: 40px !important;
  height: 40px !important;

  mat-icon {
    font-size: 20px;
  }
}
```

**Button States:**

```scss
button {
  transition: all 150ms cubic-bezier(0.2, 0, 0, 1);

  // Hover
  &:hover {
    box-shadow: var(--md-sys-elevation-level2);
    transform: translateY(-1px);
  }

  // Active/Press
  &:active {
    transform: scale(0.96);
    transition-duration: 100ms;
  }

  // Focus visible (keyboard)
  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  // Disabled
  &:disabled {
    opacity: 0.38;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  // Loading state
  &.loading {
    pointer-events: none;

    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  }
}
```

---

### Cards

**Standard Structure:**

```scss
.mat-mdc-card {
  border-radius: 16px !important; // Large shape
  box-shadow: var(--md-sys-elevation-level1);
  transition: all 300ms cubic-bezier(0.2, 0, 0, 1);

  &:hover {
    box-shadow: var(--md-sys-elevation-level3);
    transform: translateY(-8px);
  }

  &:active {
    transform: translateY(-4px);
    box-shadow: var(--md-sys-elevation-level2);
    transition-duration: 150ms;
  }
}
```

**Card Content Spacing:**

```html
<mat-card>
  <div class="poster-container">...</div>

  <mat-card-content class="p-lg">
    <h3 class="title-medium">Title</h3>
    <p class="body-medium">Description</p>
  </mat-card-content>

  <mat-card-actions class="p-lg">
    <button mat-raised-button>Action</button>
  </mat-card-actions>
</mat-card>
```

---

### Form Fields

**Configuration M3 :**

```scss
.mat-mdc-form-field {
  width: 100%;

  // Outline variant avec rounded corners
  &.mat-form-field-appearance-outline {
    .mdc-text-field--outlined .mdc-notched-outline {
      .mdc-notched-outline__leading {
        border-radius: 28px 0 0 28px !important;
        width: 28px !important;
      }

      .mdc-notched-outline__trailing {
        border-radius: 0 28px 28px 0 !important;
      }
    }
  }

  // Filled variant
  &.mat-form-field-appearance-fill {
    .mdc-text-field {
      border-radius: 4px 4px 0 0 !important;
    }
  }
}
```

---

### Dialogs

**Structure Standard :**

```scss
.mat-mdc-dialog-container {
  border-radius: 28px !important; // Extra-large shape pour dialogs
  box-shadow: var(--md-sys-elevation-level3);
  padding: 0;

  .mat-mdc-dialog-title {
    padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-md);
    font-size: 1.5rem; // headline-small
    font-weight: 400;
  }

  .mat-mdc-dialog-content {
    padding: 0 var(--spacing-xl) var(--spacing-lg);
  }

  .mat-mdc-dialog-actions {
    padding: var(--spacing-md) var(--spacing-xl) var(--spacing-xl);
    justify-content: flex-end;
    gap: var(--spacing-sm);
  }
}
```

---

### Navigation

**Sidenav :**

```scss
mat-sidenav {
  width: 280px;
  border-radius: 0 16px 16px 0; // Large shape sur trailing edge

  mat-list-item {
    border-radius: 28px; // Full rounding
    min-height: 56px;
    margin: 0 8px 4px;
    transition: background-color 150ms cubic-bezier(0.2, 0, 0, 1);

    &:hover {
      background-color: color-mix(in srgb, var(--primary-color) 10%, transparent);
    }

    &.mat-mdc-list-item-active {
      background-color: color-mix(in srgb, var(--primary-color) 15%, transparent);

      mat-icon {
        color: var(--primary-color);
      }

      span {
        font-weight: 600;
        color: var(--primary-color);
      }
    }
  }
}
```

---

## ♿ Accessibility (WCAG 2.1 AAA)

### Touch Targets

**ABSOLUTE RULE**: Minimum 48x48px for interactive elements on mobile.

```scss
// Mobile touch targets
@media (max-width: 768px) {
  button,
  a,
  .clickable {
    min-height: 48px;
    min-width: 48px;
    padding: 12px;
  }

  // Exception : text links in paragraphs
  p a {
    min-height: auto;
    min-width: auto;
  }
}
```

### Focus States

**ALWAYS visible for keyboard navigation:**

```scss
*:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
  border-radius: inherit;
}

// Custom focus for specific components
button:focus-visible {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 30%, transparent);
}
```

### ARIA Labels

**ALWAYS add descriptive labels:**

```html
<!-- Icon buttons MUST have aria-label -->
<button mat-icon-button (click)="toggleMenu()" aria-label="Open menu">
  <mat-icon>menu</mat-icon>
</button>

<!-- Links with images need alt text -->
<a routerLink="/" [attr.aria-label]="'app.title' | transloco">
  <mat-icon aria-hidden="true">live_tv</mat-icon>
  <span>{{ 'app.title' | transloco }}</span>
</a>

<!-- Form fields need labels -->
<mat-form-field>
  <mat-label>Search series</mat-label>
  <input matInput aria-label="Search series" />
</mat-form-field>
```

### Color Contrast

**WCAG AAA Requirements :**

- Text normal (< 18px) : Ratio 7:1
- Text large (≥ 18px ou bold ≥ 14px) : Ratio 4.5:1
- UI Components : Ratio 3:1

```scss
// Check contrasts with color-mix
.surface-variant {
  background: var(--mat-sys-surface-variant);
  color: var(--mat-sys-on-surface-variant); // ✅ Ensures contrast
}

// ❌ FORBIDDEN
.bad-contrast {
  background: #f0f0f0;
  color: #d0d0d0; // Insufficient contrast
}
```

---

## 📱 Responsive Design

### Breakpoints M3

```scss
$breakpoints: (
  'xs': 0,
  // Extra small (phones portrait)
  'sm': 600px,
  // Small (phones landscape)
  'md': 905px,
  // Medium (tablets)
  'lg': 1240px,
  // Large (laptops)
  'xl': 1440px // Extra large (desktops),
);
```

### Mobile-First Approach

**ALWAYS develop mobile-first:**

```scss
// Base styles (mobile)
.container {
  padding: var(--spacing-md);
  font-size: 0.875rem;
}

// Tablet
@media (min-width: 905px) {
  .container {
    padding: var(--spacing-lg);
    font-size: 1rem;
  }
}

// Desktop
@media (min-width: 1240px) {
  .container {
    padding: var(--spacing-xl);
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

### Mobile-Specific Adjustments

**Touch Targets (CRITICAL):**

```scss
// Increase button heights to 48px on mobile (WCAG requirement)
@media (max-width: 768px) {
  .mat-mdc-button,
  .mat-mdc-raised-button,
  .mat-mdc-outlined-button {
    min-height: 48px !important;
    height: 48px !important;
  }

  .mat-mdc-icon-button {
    width: 48px !important;
    height: 48px !important;
  }

  // All interactive elements
  button,
  a:not(p a),
  [role='button'],
  .clickable {
    min-height: 48px;
    min-width: 48px;
  }
}
```

**Layout Adaptations:**

```scss
// Grid columns responsive
.grid {
  display: grid;
  gap: var(--spacing-md);

  // Mobile: 1 column
  grid-template-columns: 1fr;

  // Tablet: 2 columns
  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }

  // Desktop: 3+ columns
  @media (min-width: 905px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1240px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

**Viewport Meta Tag (REQUIRED):**

```html
<!-- Must be in index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#e91e63" />

<!-- PWA enhancements -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

---

## 🎬 Loading States

### Skeleton Screens

**Prefer skeletons over spinners for content:**

```scss
.skeleton {
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--mat-sys-surface-variant) 50%, transparent) 25%,
    color-mix(in srgb, var(--mat-sys-surface-variant) 80%, transparent) 50%,
    color-mix(in srgb, var(--mat-sys-surface-variant) 50%, transparent) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  border-radius: 8px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### Progress Indicators

```html
<!-- Inline loading (buttons) -->
<button [disabled]="loading()">
  @if (loading()) {
  <mat-spinner diameter="16"></mat-spinner>
  } @else {
  <mat-icon>save</mat-icon>
  } Sauvegarder
</button>

<!-- Page loading -->
<div class="loading-container">
  <mat-spinner diameter="50"></mat-spinner>
  <p class="body-medium">Chargement...</p>
</div>
```

---

## 🚀 Performance

### Animation Optimization

```scss
// Use transform and opacity only (GPU-accelerated)
.optimized {
  transition: transform 300ms, opacity 300ms;
  will-change: transform, opacity;
}

// ❌ ÉVITER
.slow {
  transition: left 300ms, top 300ms, width 300ms; // Triggers layout recalc
}
```

### External Images (TMDB API)

**Context**: Images provided by TMDB API (external service)

```html
<!-- Native lazy loading for external images -->
<img [src]="posterUrl" [alt]="serie.name" loading="lazy" class="poster-image" />
```

**Best practices:**

- Use `loading="lazy"` to defer loading
- Always provide a descriptive `alt`
- Define fixed CSS dimensions to avoid layout shift
- Add placeholder/skeleton during loading

---

## 📚 Official Resources

- **Material Design 3** : https://m3.material.io/
- **Angular Material** : https://material.angular.io/
- **Color System** : https://m3.material.io/styles/color/system/overview
- **Typography** : https://m3.material.io/styles/typography/overview
- **Motion** : https://m3.material.io/styles/motion/overview
- **WCAG Guidelines** : https://www.w3.org/WAI/WCAG21/quickref/

---

## ✅ Pre-Commit Checklist

### Design System

- [ ] All button heights are 40px desktop / 48px mobile
- [ ] Border-radius uses M3 tokens (20px buttons, 16px cards)
- [ ] Animations use M3 durations/easing
- [ ] Typography uses M3 classes (.display-large, .body-large, etc.)
- [ ] Elevation uses M3 levels (var(--md-sys-elevation-level\*))

### Accessibility (WCAG 2.1 AAA)

- [ ] All icon buttons have aria-label
- [ ] Touch targets ≥ 48x48px on mobile (@media max-width: 768px)
- [ ] Focus states visible for keyboard navigation (:focus-visible)
- [ ] Color contrast ≥ 7:1 (text) or 3:1 (UI)
- [ ] ARIA labels on interactive elements

### Performance

- [ ] Transitions use transform/opacity only (GPU-accelerated)
- [ ] External images use loading="lazy" and descriptive alt
- [ ] Skeleton screens for content loading

### Mobile Compatibility

- [ ] Viewport meta tag present in index.html
- [ ] Responsive grid with mobile-first approach
- [ ] Touch targets increase to 48px on mobile
- [ ] Button heights adjusted to 48px on mobile
- [ ] Test on real devices (iOS Safari, Android Chrome)

---

**Last updated**: November 25, 2025  
**Material Design version**: 3.0  
**Angular Material version**: 21.0.0
