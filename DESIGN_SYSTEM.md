# Design System - Angular Ma### Color Modification

To change theme colors, modify the variables in `src/theme.scss`:

```scss
$primary-color: #your-color; // New primary color
$accent-color: #your-color; // New accent color
$warn-color: #your-color; // New warning color
```

### Dark Theme

The dark theme is available by adding the `dark-theme` class:project uses Angular Material as a design system with a custom theme and configurable CSS variables.

## 🎨 Theme Configuration

### Customizable CSS Variables

The theme is configured in `src/theme.scss` and exposes the following CSS variables:

```css
:root {
  --primary-color: #e91e63; /* Primary color (rose) */
  --accent-color: #ff5722; /* Accent color (deep orange) */
  --warn-color: #f44336; /* Warning color (red) */
  --border-radius: 8px; /* Border radius */
  --elevation-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Elevation shadow */

  /* Spacing */
  --spacing-unit: 8px; /* Base unit */
  --spacing-xs: 4px; /* Extra small */
  --spacing-sm: 8px; /* Small */
  --spacing-md: 16px; /* Medium */
  --spacing-lg: 24px; /* Large */
  --spacing-xl: 32px; /* Extra large */
}
```

### Modification des Couleurs

Pour changer les couleurs du thème, modifiez les variables dans `src/theme.scss` :

```scss
$primary-color: #your-color; // Nouvelle couleur principale
$accent-color: #your-color; // Nouvelle couleur d'accent
$warn-color: #your-color; // Nouvelle couleur d'avertissement
```

### Thème Sombre

Le thème sombre est disponible en ajoutant la classe `dark-theme` :

```html
<body class="dark-theme">
  <app-root></app-root>
</body>
```

## 📦 Composants Disponibles

### Module Material Partagé

Le fichier `src/app/shared/material.module.ts` centralise tous les imports Angular Material :

- **Boutons** : MatButtonModule, MatButtonToggleModule, MatFabModule
- **Formulaires** : MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule
- **Navigation** : MatToolbarModule, MatSidenavModule, MatMenuModule, MatTabsModule
- **Affichage** : MatCardModule, MatListModule, MatTableModule, MatGridListModule
- **Feedback** : MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule
- **Et bien plus encore...**

### Import dans un Composant Standalone

```typescript
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'my-component',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button mat-raised-button color="primary">
      <mat-icon>star</mat-icon>
      Mon Bouton
    </button>
  `,
})
export class MyComponent {}
```

## 🎯 Classes Utilitaires

### Couleurs

```html
<div class="text-primary">Texte couleur principale</div>
<div class="text-accent">Texte couleur accent</div>
<div class="text-warn">Texte couleur avertissement</div>

<div class="bg-primary">Fond couleur principale</div>
<div class="bg-accent">Fond couleur accent</div>
```

### Espacements

```html
<!-- Padding -->
<div class="p-xs">Padding extra petit (4px)</div>
<div class="p-sm">Padding petit (8px)</div>
<div class="p-md">Padding moyen (16px)</div>
<div class="p-lg">Padding grand (24px)</div>
<div class="p-xl">Padding extra grand (32px)</div>

<!-- Margin -->
<div class="m-xs">Margin extra petit (4px)</div>
<div class="m-sm">Margin petit (8px)</div>
<div class="m-md">Margin moyen (16px)</div>
<div class="m-lg">Margin grand (24px)</div>
<div class="m-xl">Margin extra grand (32px)</div>
```

### Flexbox

```html
<div class="flex-center">Contenu centré</div>
<div class="flex-between">Contenu espacé</div>
<div class="flex-column">Colonne flexible</div>
```

### Animations

```html
<div class="fade-in">Élément avec animation fade-in</div>
```

## 🔧 Composants Pré-construits

### Barre de Navigation

```html
<mat-toolbar color="primary">
  <button mat-icon-button>
    <mat-icon>menu</mat-icon>
  </button>
  <span>Mon Application</span>
  <span class="spacer"></span>
  <button mat-icon-button>
    <mat-icon>account_circle</mat-icon>
  </button>
</mat-toolbar>
```

### Card avec Actions

```html
<mat-card class="m-md">
  <mat-card-header>
    <mat-card-title>Titre de la Card</mat-card-title>
    <mat-card-subtitle>Sous-titre</mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <p>Contenu de la card...</p>
  </mat-card-content>
  <mat-card-actions align="end">
    <button mat-button color="primary">Action</button>
    <button mat-raised-button color="accent">Action Principale</button>
  </mat-card-actions>
</mat-card>
```

### Menu Latéral

```html
<mat-sidenav-container>
  <mat-sidenav mode="over" #sidenav>
    <mat-nav-list>
      <mat-list-item>
        <mat-icon matListItemIcon>home</mat-icon>
        <span matListItemTitle>Accueil</span>
      </mat-list-item>
    </mat-nav-list>
  </mat-sidenav>
  <mat-sidenav-content>
    <!-- Contenu principal -->
  </mat-sidenav-content>
</mat-sidenav-container>
```

## 🚀 Bonnes Pratiques

### 1. Consistance Visuelle

- Utilisez toujours les variables CSS personnalisées pour les couleurs et espacements
- Respectez la hiérarchie typographique de Material Design
- Maintenez un système d'espacement cohérent (multiples de 8px)

### 2. Accessibilité

- Utilisez les attributs `aria-label` pour les boutons d'icônes
- Respectez les contrastes de couleurs (ratios WCAG AA/AAA)
- Testez la navigation au clavier

### 3. Performance

- Importez seulement les modules Material nécessaires
- Utilisez le lazy loading pour les gros composants
- Optimisez les animations pour 60fps

### 4. Responsive Design

- Utilisez les breakpoints Material Design
- Testez sur différentes tailles d'écran
- Adaptez les composants pour mobile

## 📱 Breakpoints

```scss
// Mobile
@media (max-width: 599px) {
}

// Tablet
@media (min-width: 600px) and (max-width: 1023px) {
}

// Desktop
@media (min-width: 1024px) {
}
```

## 🛠️ Commandes Utiles

```bash
# Installer Angular Material
ng add @angular/material

# Générer un composant avec Material
ng generate component my-component

# Build de production
ng build --prod

# Tests
ng test

# Lint
ng lint
```

---

Pour toute question ou suggestion d'amélioration du design system, n'hésitez pas à ouvrir une issue sur le repository du projet.
