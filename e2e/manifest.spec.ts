import { test, expect } from '@playwright/test';

test.describe('PWA', () => {
    test('should have valid manifest', async ({ page }) => {
        const response = await page.goto('/manifest.webmanifest');

        expect(response?.status()).toBe(200);
        expect(response?.headers()['content-type']).toContain('application/manifest+json');

        const manifest = await response?.json();

        expect(manifest.name).toBeTruthy();
        expect(manifest.short_name).toBeTruthy();
        expect(manifest.icons).toHaveLength(8);
    });

    test('should have theme color', async ({ page }) => {
        await page.goto('/');

        const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');

        expect(themeColor).toBe('#e91e63');
    });

    test('should have apple touch icon', async ({ page }) => {
        await page.goto('/');

        const icon = page.locator('link[rel="apple-touch-icon"]').first();
        await expect(icon).toHaveAttribute('href', /apple-touch-icon\.png/);
    });
});
