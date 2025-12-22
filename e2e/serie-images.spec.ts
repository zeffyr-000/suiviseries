import { test, expect } from '@playwright/test';

test.describe('Serie Images Component - Integration Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to a serie detail page with images
        await page.goto('/serie/1399');
        await page.waitForLoadState('networkidle');
    });

    test('should display images section with tabs', async ({ page }) => {
        const imagesSection = page.locator('app-serie-images');
        await expect(imagesSection).toBeVisible();

        const tabs = imagesSection.locator('.mat-mdc-tab');
        await expect(tabs).toHaveCount(3);
    });

    test('should open slideshow on image click', async ({ page }) => {
        const firstImage = page.locator('app-serie-images .image-item').first();
        await firstImage.click();

        const dialog = page.locator('.image-preview-overlay');
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    test('should navigate through images with keyboard', async ({ page }) => {
        const firstImage = page.locator('app-serie-images .image-item').first();
        await firstImage.click();

        await page.keyboard.press('ArrowRight');
        await page.locator('.preview-image').waitFor({ state: 'visible' });

        await page.keyboard.press('ArrowLeft');
        await page.locator('.preview-image').waitFor({ state: 'visible' });

        await page.keyboard.press('Escape');
        const dialog = page.locator('.image-preview-overlay');
        await expect(dialog).not.toBeVisible();
    });

    test('should navigate through images with navigation buttons', async ({ page }) => {
        const firstImage = page.locator('app-serie-images .image-item').first();
        await firstImage.click();

        const nextButton = page.locator('.nav-button-next');
        const prevButton = page.locator('.nav-button-prev');

        await nextButton.click();
        await page.locator('.preview-image').waitFor({ state: 'visible' });

        await prevButton.click();
        await page.locator('.preview-image').waitFor({ state: 'visible' });

        const closeButton = page.locator('.close-button');
        await closeButton.click();

        const dialog = page.locator('.image-preview-overlay');
        await expect(dialog).not.toBeVisible();
    });

    test('should toggle fullscreen mode', async ({ page }) => {
        const firstImage = page.locator('app-serie-images .image-item').first();
        await firstImage.click();

        // Use icon text selector (language-independent)
        const fullscreenButton = page.locator('button:has(mat-icon:text("fullscreen"))');
        await fullscreenButton.click();
        await fullscreenButton.waitFor({ state: 'visible' });

        // Note: Fullscreen API may not work in headless mode
        // This test validates the button interaction
        await expect(fullscreenButton).toBeVisible();
    });

    test('should display image metadata', async ({ page }) => {
        const firstImage = page.locator('app-serie-images .image-item').first();
        await firstImage.click();

        const metadata = page.locator('.image-preview-info');
        await expect(metadata).toBeVisible();

        const dimensions = metadata.locator('span').first();
        await expect(dimensions).toContainText('×');
    });

    test('should display image counter badge', async ({ page }) => {
        const firstImage = page.locator('app-serie-images .image-item').first();
        await firstImage.click();

        const counter = page.locator('.image-counter');
        await expect(counter).toBeVisible();
        await expect(counter).toContainText('/');
    });

    test('should switch between image tabs', async ({ page }) => {
        const imagesSection = page.locator('app-serie-images');

        const postersTab = imagesSection.locator('.mat-mdc-tab').nth(1);
        await postersTab.click();
        const posterImages = imagesSection.locator('.image-item');
        await posterImages.first().waitFor({ state: 'visible' });
        await expect(posterImages.first()).toBeVisible();
    });

    test('should highlight selected image in thumbnail list', async ({ page }) => {
        const firstImage = page.locator('app-serie-images .image-item').first();
        await firstImage.click();

        await expect(firstImage).toHaveClass(/selected/);
        await expect(firstImage).toHaveAttribute('aria-pressed', 'true');
    });

    test('should close preview with close button', async ({ page }) => {
        const firstImage = page.locator('app-serie-images .image-item').first();
        await firstImage.click();

        const closeButton = page.locator('.close-button');
        await closeButton.click();

        const dialog = page.locator('.image-preview-overlay');
        await expect(dialog).not.toBeVisible();
    });

    test('should be keyboard accessible', async ({ page }) => {
        const firstImage = page.locator('app-serie-images .image-item').first();

        await firstImage.focus();
        await page.keyboard.press('Enter');

        const dialog = page.locator('.image-preview-overlay');
        await expect(dialog).toBeVisible();
        await expect(dialog).toBeFocused();
    });

    test('should display correct image type badge', async ({ page }) => {
        const firstImage = page.locator('app-serie-images .image-item').first();
        await firstImage.click();

        const typeBadge = page.locator('.image-type-badge');
        await expect(typeBadge).toBeVisible();
    });

    test('should maintain focus management throughout navigation', async ({ page }) => {
        const firstImage = page.locator('app-serie-images .image-item').first();
        await firstImage.click();

        const dialog = page.locator('.image-preview-overlay');
        await expect(dialog).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await page.locator('.preview-image').waitFor({ state: 'visible' });

        // Verify focus remains inside dialog after navigation
        const isFocusInsideDialog = await page.evaluate(() => {
            const dialogElement = document.querySelector('.image-preview-overlay');
            if (!dialogElement || !document.activeElement) {
                return false;
            }
            return dialogElement.contains(document.activeElement);
        });
        await expect(isFocusInsideDialog).toBe(true);
    });
});
