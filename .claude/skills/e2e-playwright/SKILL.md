---
name: e2e-playwright
description: End-to-end testing with Playwright for Suiviseries — specs in e2e/, the chromium project against http://localhost:4200 (webServer auto-starts npm start), resilient locators, and language-agnostic text matching. Use when writing or fixing e2e/**.
---

# E2E Playwright

Specs live in `e2e/`. Config (`playwright.config.ts`): `chromium` project, `baseURL: http://localhost:4200`, and a `webServer` that runs `npm run start` automatically (reused locally, fresh in CI).

## Commands

```bash
npm run e2e         # headless run
npm run e2e:ui      # interactive UI mode
npm run e2e:headed  # headed browser
npm run e2e:report  # open the last HTML report
```

## Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Search', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/search'); // relative to baseURL
    });

    test('should display search page', async ({ page }) => {
        await expect(page.locator('h1')).toContainText(/recherche|search/i);
        await expect(page.locator('input[matInput]')).toBeVisible();
    });
});
```

## Conventions

- Navigate with **relative paths** (`page.goto('/search')`) — `baseURL` is configured
- Prefer resilient locators: roles, `matInput`, stable classes (`.search-instructions`), test ids — avoid brittle deep CSS chains
- The UI is French (Transloco) — match text **case-insensitively and language-tolerantly** with regex (`/recherche|search/i`) so tests survive copy changes
- Use web-first assertions (`await expect(locator).toBeVisible()`) — they auto-wait; avoid manual `waitForTimeout`
- Group related tests in `test.describe` with a shared `beforeEach` for navigation/setup
- Keep specs independent — no shared mutable state between tests

## CI Notes

- In CI: `retries: 2`, `workers: 1`, `reporter: 'github'`, `forbidOnly` enforced
- Artifacts on failure: trace (`on-first-retry`), screenshot, video — check them when a spec fails in CI
