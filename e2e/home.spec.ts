import { test, expect } from '@playwright/test';

test.describe('Home', () => {
    test('should display hero section', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('h1')).toBeVisible();
        await expect(page.getByRole('link', { name: /Parcourir|Browse/ })).toBeVisible();
    });

    test('should navigate to search', async ({ page }) => {
        await page.goto('/');

        await page.getByRole('link', { name: /Parcourir|Browse/ }).click();

        await expect(page).toHaveURL('/search');
    });
});
