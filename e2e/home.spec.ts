import { test, expect } from '@playwright/test';

test.describe('Home', () => {
    test('should display hero section', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('button:has-text("Parcourir"), button:has-text("Browse")')).toBeVisible();
    });

    test('should navigate to search', async ({ page }) => {
        await page.goto('/');

        await page.click('button:has-text("Parcourir"), button:has-text("Browse")');

        await expect(page).toHaveURL('/search');
    });
});
