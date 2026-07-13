---
description: Scaffold a Playwright E2E test following Suiviseries conventions
---

# Create E2E Test

Write a Playwright spec in `e2e/`. Consult the `e2e-playwright` skill.

## Requirements

- Navigate with relative paths (`baseURL` = `http://localhost:4200`)
- Resilient locators (roles, `matInput`, stable classes, test ids)
- Language-tolerant text matching (FR UI): regex like `/recherche|search/i`
- Web-first assertions (`await expect(locator).toBeVisible()`) — no `waitForTimeout`
- Group with `test.describe` + shared `beforeEach`

## Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/feature');
    });

    test('should display the feature page', async ({ page }) => {
        await expect(page.locator('h1')).toBeVisible();
    });

    test('should react to user input', async ({ page }) => {
        await page.locator('input[matInput]').fill('breaking bad');
        await expect(page.locator('app-serie-card').first()).toBeVisible();
    });
});
```

## Run

```bash
npm run e2e         # headless (webServer auto-starts npm start)
npm run e2e:ui      # interactive
npm run e2e:report  # open last report
```

Keep specs independent; on CI failure, inspect the retained trace/screenshot/video.
