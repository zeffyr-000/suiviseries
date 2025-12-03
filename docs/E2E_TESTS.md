# Tests E2E - Playwright

## Installation

Playwright est déjà configuré dans le projet.

## Lancer les tests

**Note:** Utiliser les scripts npm, pas `ng e2e` (non configuré).

```bash
# Tous les tests
npm run e2e

# Mode interactif
npm run e2e:ui

# Avec navigateur visible
npm run e2e:headed

# Rapport HTML
npm run e2e:report
```

## Tests disponibles

### Home (`home.spec.ts`)

- Affichage de la page d'accueil
- Navigation vers la recherche

### Search (`search.spec.ts`)

- Affichage de la page de recherche
- Instructions de recherche

### Navigation (`navigation.spec.ts`)

- Navigation entre les pages
- Présence du menu de navigation

### PWA (`manifest.spec.ts`)

- Validation du manifest
- Theme color
- Apple touch icon

### Notifications (`notifications.spec.ts`)

- **Non connecté**: Bouton notifications non affiché
- **Connecté**:
  - Affichage du bouton avec badge (nombre de non-lus)
  - Ouverture/fermeture du drawer (clic bouton, backdrop, bouton fermer, Escape)
  - Affichage de la liste avec posters, titres, messages, dates
  - Indicateur visuel notifications non-lues
  - Navigation vers la série au clic
  - Suppression de notification (bouton delete)
  - Mise à jour du badge après lecture/suppression
  - Message "aucune notification" quand vide
- **Accessibilité**:
  - Labels ARIA (button, close button)
  - Navigation clavier (Tab, Enter, Escape)

## Ajouter des tests

Créer un fichier `e2e/mon-test.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('mon test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

## Documentation

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
