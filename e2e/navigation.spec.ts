import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
    test('should navigate between pages', async ({ page }) => {
        await page.goto('/');

        // Go to search
        await page.goto('/search');
        await expect(page).toHaveURL('/search');

        // Go back home
        await page.goto('/');
        await expect(page).toHaveURL('/');
    });
});