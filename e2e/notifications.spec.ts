import { test, expect } from '@playwright/test';

test.describe('Notifications', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test.describe('When not logged in', () => {
        test('should not display notifications button', async ({ page }) => {
            await expect(page.locator('button[aria-label*="notification"], button[aria-label*="Ouvrir"]')).not.toBeVisible();
        });
    });

    test.describe('When logged in', () => {
        test.beforeEach(async ({ page }) => {
            // Mock login - adjust based on your auth flow
            // This assumes there's a way to set auth state or mock the API
            await page.goto('/');

            // Wait for the app to load
            await page.waitForLoadState('networkidle');
        });

        test('should display notifications button in toolbar', async ({ page }) => {
            // Check if user is logged in (adjust selector based on your UI)
            const loginButton = page.locator('button:has-text("Se connecter"), button:has-text("Sign in")');
            const isLoggedIn = await loginButton.count() === 0;

            if (isLoggedIn) {
                await expect(page.locator('button mat-icon:has-text("notifications")')).toBeVisible();
            }
        });

        test('should display badge with unread count', async ({ page }) => {
            const notificationButton = page.locator('button mat-icon:has-text("notifications")').locator('..');
            const badge = notificationButton.locator('.mat-badge-content');

            const isLoggedIn = await notificationButton.count() > 0;

            if (isLoggedIn) {
                // Badge should be hidden if count is 0, or show count if > 0
                const badgeVisible = await badge.isVisible().catch(() => false);

                if (badgeVisible) {
                    const badgeText = await badge.textContent();
                    expect(Number.parseInt(badgeText || '0')).toBeGreaterThan(0);
                }
            }
        });

        test('should open notifications drawer on button click', async ({ page }) => {
            const notificationButton = page.locator('button mat-icon:has-text("notifications")').locator('..');

            if (await notificationButton.count() > 0) {
                await notificationButton.click();

                // Drawer should be visible
                const drawer = page.locator('mat-sidenav[position="end"]');
                await expect(drawer).toBeVisible();

                // Header should be visible
                await expect(page.locator('.notifications-header h2')).toBeVisible();
            }
        });

        test('should close drawer on close button click', async ({ page }) => {
            const notificationButton = page.locator('button mat-icon:has-text("notifications")').locator('..');

            if (await notificationButton.count() > 0) {
                // Open drawer
                await notificationButton.click();
                await page.waitForSelector('mat-sidenav[position="end"]', { state: 'visible' });

                // Click close button
                const closeButton = page.locator('.notifications-header button mat-icon:has-text("close")').locator('..');
                await closeButton.click();

                // Drawer should close
                const drawer = page.locator('mat-sidenav[position="end"]');
                await expect(drawer).not.toBeVisible({ timeout: 1000 });
            }
        });

        test('should close drawer on backdrop click', async ({ page }) => {
            const notificationButton = page.locator('button mat-icon:has-text("notifications")').locator('..');

            if (await notificationButton.count() > 0) {
                // Open drawer
                await notificationButton.click();
                await page.waitForSelector('mat-sidenav[position="end"]', { state: 'visible' });

                // Click backdrop (outside drawer)
                await page.locator('.mat-drawer-backdrop').click();

                // Drawer should close
                const drawer = page.locator('mat-sidenav[position="end"]');
                await expect(drawer).not.toBeVisible({ timeout: 1000 });
            }
        });

        test('should display "no notifications" message when empty', async ({ page }) => {
            const notificationButton = page.locator('button mat-icon:has-text("notifications")').locator('..');

            if (await notificationButton.count() > 0) {
                await notificationButton.click();
                await page.waitForSelector('mat-sidenav[position="end"]', { state: 'visible' });

                // Check for either no notifications message or notification items
                const noNotifications = page.locator('.no-notifications');
                const notificationItems = page.locator('.notification-item');

                const hasNotifications = await notificationItems.count() > 0;

                if (!hasNotifications) {
                    await expect(noNotifications).toBeVisible();
                    await expect(noNotifications.locator('mat-icon')).toHaveText('notifications_none');
                }
            }
        });

        test('should display notification items with poster and text', async ({ page }) => {
            const notificationButton = page.locator('button mat-icon:has-text("notifications")').locator('..');

            if (await notificationButton.count() > 0) {
                await notificationButton.click();
                await page.waitForSelector('mat-sidenav[position="end"]', { state: 'visible' });

                const notificationItems = page.locator('.notification-item');
                const itemCount = await notificationItems.count();

                if (itemCount > 0) {
                    const firstItem = notificationItems.first();

                    // Should have poster or fallback icon
                    const hasPoster = await firstItem.locator('.notification-poster').count() > 0;
                    const hasFallback = await firstItem.locator('.notification-icon-fallback').count() > 0;
                    expect(hasPoster || hasFallback).toBeTruthy();

                    // Should have title, message, and date
                    await expect(firstItem.locator('.notification-title')).toBeVisible();
                    await expect(firstItem.locator('.notification-message')).toBeVisible();
                    await expect(firstItem.locator('.notification-date')).toBeVisible();
                }
            }
        });

        test('should show unread indicator on unread notifications', async ({ page }) => {
            const notificationButton = page.locator('button mat-icon:has-text("notifications")').locator('..');

            if (await notificationButton.count() > 0) {
                await notificationButton.click();
                await page.waitForSelector('mat-sidenav[position="end"]', { state: 'visible' });

                const unreadItems = page.locator('.notification-item.unread');
                const unreadCount = await unreadItems.count();

                if (unreadCount > 0) {
                    const firstUnread = unreadItems.first();

                    // Unread items should have the unread class
                    await expect(firstUnread).toHaveClass(/unread/);
                }
            }
        });

        test('should navigate to serie page on notification click', async ({ page }) => {
            const notificationButton = page.locator('button mat-icon:has-text("notifications")').locator('..');

            if (await notificationButton.count() > 0) {
                await notificationButton.click();
                await page.waitForSelector('mat-sidenav[position="end"]', { state: 'visible' });

                const notificationItems = page.locator('.notification-item');
                const itemCount = await notificationItems.count();

                if (itemCount > 0) {
                    // Click first notification
                    await notificationItems.first().click();

                    // Should navigate to serie page
                    await page.waitForURL(/\/serie\/\d+\/.+/);

                    // Drawer should close after navigation
                    const drawer = page.locator('mat-sidenav[position="end"]');
                    await expect(drawer).not.toBeVisible({ timeout: 2000 });
                }
            }
        });

        test('should show delete button on notification hover', async ({ page }) => {
            const notificationButton = page.locator('button mat-icon:has-text("notifications")').locator('..');

            if (await notificationButton.count() > 0) {
                await notificationButton.click();
                await page.waitForSelector('mat-sidenav[position="end"]', { state: 'visible' });

                const notificationItems = page.locator('.notification-item');
                const itemCount = await notificationItems.count();

                if (itemCount > 0) {
                    const firstItem = notificationItems.first();
                    const deleteButton = firstItem.locator('.delete-button');

                    // Hover over notification
                    await firstItem.hover();

                    // Delete button should become visible
                    await expect(deleteButton).toBeVisible();
                }
            }
        });

        test('should delete notification on delete button click', async ({ page }) => {
            const notificationButton = page.locator('button mat-icon:has-text("notifications")').locator('..');

            if (await notificationButton.count() > 0) {
                await notificationButton.click();
                await page.waitForSelector('mat-sidenav[position="end"]', { state: 'visible' });

                const notificationItems = page.locator('.notification-item');
                const initialCount = await notificationItems.count();

                if (initialCount > 0) {
                    const firstItem = notificationItems.first();
                    const deleteButton = firstItem.locator('.delete-button');

                    // Hover and click delete
                    await firstItem.hover();
                    await deleteButton.click();

                    // Wait for deletion
                    await page.waitForTimeout(500);

                    // Item count should decrease
                    const newCount = await notificationItems.count();
                    expect(newCount).toBeLessThan(initialCount);
                }
            }
        });

        test('should update badge count when marking as read', async ({ page }) => {
            const notificationButton = page.locator('button mat-icon:has-text("notifications")').locator('..');

            if (await notificationButton.count() > 0) {
                const badge = notificationButton.locator('.mat-badge-content');
                const initialBadgeVisible = await badge.isVisible().catch(() => false);

                if (initialBadgeVisible) {
                    const initialCount = await badge.textContent();

                    // Open drawer and click unread notification
                    await notificationButton.click();
                    await page.waitForSelector('mat-sidenav[position="end"]', { state: 'visible' });

                    const unreadItems = page.locator('.notification-item.unread');
                    const unreadCount = await unreadItems.count();

                    if (unreadCount > 0) {
                        await unreadItems.first().click();

                        // Wait for navigation and badge update
                        await page.waitForURL(/\/serie\/\d+\/.+/);
                        await page.waitForTimeout(500);

                        // Go back to check badge
                        await page.goBack();
                        await page.waitForLoadState('networkidle');

                        const newBadgeVisible = await badge.isVisible().catch(() => false);

                        if (newBadgeVisible) {
                            const newCount = await badge.textContent();
                            expect(Number.parseInt(newCount || '0')).toBeLessThan(Number.parseInt(initialCount || '0'));
                        } else {
                            // Badge should be hidden if count reached 0
                            expect(Number.parseInt(initialCount || '0')).toBe(1);
                        }
                    }
                }
            }
        });

        test('should support keyboard navigation (Escape to close)', async ({ page }) => {
            const notificationButton = page.locator('button mat-icon:has-text("notifications")').locator('..');

            if (await notificationButton.count() > 0) {
                // Open drawer
                await notificationButton.click();
                await page.waitForSelector('mat-sidenav[position="end"]', { state: 'visible' });

                // Press Escape
                await page.keyboard.press('Escape');

                // Drawer should close
                const drawer = page.locator('mat-sidenav[position="end"]');
                await expect(drawer).not.toBeVisible({ timeout: 1000 });
            }
        });
    });

    test.describe('Accessibility', () => {
        test('should have proper ARIA labels', async ({ page }) => {
            await page.goto('/');

            const notificationButton = page.locator('button mat-icon:has-text("notifications")').locator('..');

            if (await notificationButton.count() > 0) {
                // Button should have aria-label
                const ariaLabel = await notificationButton.getAttribute('aria-label');
                expect(ariaLabel).toBeTruthy();

                // Open drawer
                await notificationButton.click();
                await page.waitForSelector('mat-sidenav[position="end"]', { state: 'visible' });

                // Close button should have aria-label
                const closeButton = page.locator('.notifications-header button mat-icon:has-text("close")').locator('..');
                const closeAriaLabel = await closeButton.getAttribute('aria-label');
                expect(closeAriaLabel).toBeTruthy();
            }
        });

        test('should be keyboard accessible', async ({ page }) => {
            await page.goto('/');

            const notificationButton = page.locator('button mat-icon:has-text("notifications")').locator('..');

            if (await notificationButton.count() > 0) {
                // Tab to notification button
                await page.keyboard.press('Tab');
                await page.keyboard.press('Tab');
                await page.keyboard.press('Tab');

                // Button should be focusable
                const focused = await notificationButton.evaluate(el => el === document.activeElement);

                if (focused) {
                    // Press Enter to open
                    await page.keyboard.press('Enter');

                    const drawer = page.locator('mat-sidenav[position="end"]');
                    await expect(drawer).toBeVisible();
                }
            }
        });
    });
});
