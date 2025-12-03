import { test, expect } from '@playwright/test';

test.describe('Search', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/search');
    });

    test('should display search page', async ({ page }) => {
        await expect(page.locator('h1')).toContainText(/recherche|search/i);
        await expect(page.locator('input[matInput]')).toBeVisible();
    });

    test('should display search instructions', async ({ page }) => {
        await expect(page.locator('.search-instructions')).toBeVisible();
    });
});
