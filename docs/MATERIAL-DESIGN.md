# Material Design Integration Guide

This document outlines how Material Design is integrated into the Suiviseries project and best practices for using Material components.

## Philosophy

**Always prefer Material Design components over custom implementations.**

Material Design provides:

- ✅ **Accessibility**: Built-in ARIA attributes and keyboard navigation
- ✅ **Consistency**: Unified design language across the application
- ✅ **Maintenance**: Official Angular support and updates
- ✅ **Performance**: Optimized animations and rendering
- ✅ **Testing**: Well-documented testing APIs

## Common Material Services

### MatSnackBar - Notifications

**ALWAYS use MatSnackBar** for notifications, toasts, and user feedback.

#### Why MatSnackBar?

- Built-in accessibility (ARIA live regions)
- Automatic positioning and stacking
- Configurable duration and actions
- Less code to maintain
- No custom component needed

#### Example: NotificationService

```typescript
import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly transloco = inject(TranslocoService);
  private readonly snackBar = inject(MatSnackBar);

  show(
    messageKey: string,
    type: 'error' | 'success' | 'warning' | 'info' = 'info',
    duration = 5000
  ): void {
    const message = this.transloco.translate(messageKey);
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`],
    };

    this.snackBar.open(message, undefined, config);
  }

  success(messageKey: string): void {
    this.show(messageKey, 'success', 3000);
  }

  error(messageKey: string): void {
    this.show(messageKey, 'error', 5000);
  }
}
```

#### Styling MatSnackBar

Use CSS custom properties in `styles.scss`:

```scss
// Custom snackbar styles for notification types
.snackbar-error {
  --mdc-snackbar-container-color: #d32f2f !important;
  --mdc-snackbar-supporting-text-color: white !important;
}

.snackbar-success {
  --mdc-snackbar-container-color: #388e3c !important;
  --mdc-snackbar-supporting-text-color: white !important;
}

.snackbar-warning {
  --mdc-snackbar-container-color: #f57c00 !important;
  --mdc-snackbar-supporting-text-color: white !important;
}

.snackbar-info {
  --mdc-snackbar-container-color: #1976d2 !important;
  --mdc-snackbar-supporting-text-color: white !important;
}
```

#### Testing MatSnackBar

```typescript
import { MatSnackBar } from '@angular/material/snack-bar';
import { vi } from 'vitest';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBar: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService, MatSnackBar],
    });
    service = TestBed.inject(NotificationService);
    snackBar = TestBed.inject(MatSnackBar);
    vi.spyOn(snackBar, 'open');
  });

  it('should open snackbar with correct config', () => {
    service.success('notifications.success.saved');

    expect(snackBar.open).toHaveBeenCalledWith(
      expect.any(String),
      undefined,
      expect.objectContaining({
        duration: 3000,
        panelClass: ['snackbar-success'],
      })
    );
  });
});
```

### MatDialog - Modal Dialogs

Use MatDialog for authentication, confirmations, and forms.

#### Example Usage

```typescript
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './login/login.component';

export class AppComponent {
  private readonly dialog = inject(MatDialog);

  openLogin(): void {
    this.dialog.open(LoginComponent, {
      width: '540px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
    });
  }
}
```

## Material Design 3 Theming

### Theme Configuration

Configure Material theming in `styles.scss`:

```scss
@use '@angular/material' as mat;

html {
  @include mat.theme(
    (
      color: (
        primary: mat.$rose-palette,
        tertiary: mat.$red-palette,
      ),
      typography: (
        brand-family: 'Roboto',
        plain-family: 'Roboto',
      ),
      density: (
        scale: 0,
      ),
    )
  );
}
```

### Custom Design Tokens

```scss
html {
  // Colors
  --primary-color: #e91e63;
  --accent-color: #ff5722;
  --warn-color: #f44336;

  // Border Radius
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 12px;
  --md-sys-shape-corner-large: 16px;

  // Elevation
  --md-sys-elevation-level1: 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
  --md-sys-elevation-level2: 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}
```

## Component Setup

### Required Providers

Add animations provider in `app.config.ts`:

```typescript
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    // ... other providers
  ],
};
```

### Import Material Modules

Components import only what they need:

```typescript
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule, MatIconModule, MatToolbarModule],
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button>
        <mat-icon>menu</mat-icon>
      </button>
      <span>App Title</span>
    </mat-toolbar>
  `,
})
export class HeaderComponent {}
```

## Common Material Components

### Buttons

```html
<!-- Filled button (primary actions) -->
<button mat-flat-button color="primary">Save</button>

<!-- Outlined button (secondary actions) -->
<button mat-stroked-button>Cancel</button>

<!-- Text button (tertiary actions) -->
<button mat-button>Learn More</button>

<!-- Icon button -->
<button mat-icon-button>
  <mat-icon>close</mat-icon>
</button>

<!-- FAB (Floating Action Button) -->
<button mat-fab color="accent">
  <mat-icon>add</mat-icon>
</button>
```

### Cards

```html
<mat-card>
  <mat-card-header>
    <mat-card-title>Series Title</mat-card-title>
    <mat-card-subtitle>2024 • Drama</mat-card-subtitle>
  </mat-card-header>
  <img mat-card-image src="poster.jpg" alt="Series poster" />
  <mat-card-content>
    <p>Series description...</p>
  </mat-card-content>
  <mat-card-actions>
    <button mat-button>WATCH</button>
    <button mat-button>DETAILS</button>
  </mat-card-actions>
</mat-card>
```

### Form Fields

```html
<mat-form-field appearance="outline">
  <mat-label>Search series</mat-label>
  <input matInput [formField]="searchForm.query" />
  <mat-icon matPrefix>search</mat-icon>
  <button mat-icon-button matSuffix (click)="clearSearch()">
    <mat-icon>close</mat-icon>
  </button>
</mat-form-field>
```

### Navigation

```html
<mat-sidenav-container>
  <mat-sidenav #sidenav mode="over" [opened]="menuOpen()">
    <mat-nav-list>
      <mat-list-item routerLink="/" routerLinkActive="active">
        <mat-icon matListItemIcon>home</mat-icon>
        <span matListItemTitle>Home</span>
      </mat-list-item>
      <mat-list-item routerLink="/my-series" routerLinkActive="active">
        <mat-icon matListItemIcon>tv</mat-icon>
        <span matListItemTitle>My Series</span>
      </mat-list-item>
    </mat-nav-list>
  </mat-sidenav>

  <mat-sidenav-content>
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="sidenav.toggle()">
        <mat-icon>menu</mat-icon>
      </button>
      <span>Suiviseries</span>
    </mat-toolbar>
    <router-outlet></router-outlet>
  </mat-sidenav-content>
</mat-sidenav-container>
```

## Accessibility Features

Material components include built-in accessibility:

### Automatic ARIA Attributes

- `role="button"` on clickable elements
- `aria-label` for icon-only buttons
- `aria-live="polite"` for snackbar notifications
- `aria-expanded` for expandable panels

### Keyboard Navigation

- Tab navigation through interactive elements
- Enter/Space to activate buttons
- Escape to close dialogs and menus
- Arrow keys for list navigation

### Focus Management

- Auto-focus on dialog open
- Focus trap within modals
- Visible focus indicators

## Performance Optimization

### Local Fonts

Install Roboto locally instead of CDN:

```bash
npm install @fontsource/roboto
```

```typescript
// main.ts
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
```

**Benefits**: -400KB vs Google CDN, better performance

### Material Icons

Keep Material Icons on CDN (recommended by Angular Material):

```html
<!-- index.html -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
```

**Benefits**: Global cache, reduced bundle size

## Common Pitfalls

### ❌ Don't Create Custom Equivalents

```typescript
// ❌ BAD: Custom notification component
@Component({
  selector: 'app-notification',
  template: `<div class="custom-toast">{{ message }}</div>`,
})
export class NotificationComponent {}
```

```typescript
// ✅ GOOD: Use MatSnackBar
this.snackBar.open(message, undefined, { duration: 3000 });
```

### ❌ Don't Override Material Internals

```scss
// ❌ BAD: Overriding internal classes
.mdc-button__label {
  display: flex !important;
}
```

```scss
// ✅ GOOD: Use Material theming system
html {
  --mat-button-toggle-text-color: #333;
}
```

### ❌ Don't Duplicate Material Features

```typescript
// ❌ BAD: Custom dialog service
export class CustomDialogService {
  showDialog() {
    /* custom implementation */
  }
}
```

```typescript
// ✅ GOOD: Use MatDialog directly
export class MyService {
  private readonly dialog = inject(MatDialog);

  showDialog() {
    this.dialog.open(MyDialogComponent);
  }
}
```

## Resources

- [Angular Material Documentation](https://material.angular.io/)
- [Material Design 3 Guidelines](https://m3.material.io/)
- [Angular Material GitHub](https://github.com/angular/components)
- [Material Design Color Tool](https://material.io/resources/color/)

## Summary

1. ✅ **Always prefer Material components** over custom implementations
2. ✅ **Use MatSnackBar** for all notifications and toasts
3. ✅ **Use MatDialog** for modals and confirmations
4. ✅ **Leverage built-in accessibility** features
5. ✅ **Follow Material Design 3** theming guidelines
6. ✅ **Import `provideAnimationsAsync()`** in app config
7. ✅ **Use local Roboto fonts** for performance
8. ✅ **Keep Material Icons on CDN** for caching
9. ✅ **Test Material services** with `vi.spyOn()`
10. ✅ **Avoid reinventing** what Material already provides
