import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { throwError } from 'rxjs';

import { PushNotificationPromptComponent } from './push-notification-prompt.component';
import { PushNotificationService } from '../../services/push-notification.service';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';
import { createMockPushNotificationService, createMockMatSnackBar } from '../../testing/mocks';

describe('PushNotificationPromptComponent', () => {
    let component: PushNotificationPromptComponent;
    let mockPushService: ReturnType<typeof createMockPushNotificationService>;
    let mockSnackBar: ReturnType<typeof createMockMatSnackBar>;
    let translocoService: TranslocoService;
    let translateSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        mockPushService = createMockPushNotificationService();
        mockSnackBar = createMockMatSnackBar();

        TestBed.configureTestingModule({
            imports: [
                PushNotificationPromptComponent,
                getTranslocoTestingModule()
            ],
            providers: [
                { provide: PushNotificationService, useValue: mockPushService },
                { provide: MatSnackBar, useValue: mockSnackBar }
            ]
        });

        translocoService = TestBed.inject(TranslocoService);
        translateSpy = vi.spyOn(translocoService, 'translate');

        component = TestBed.createComponent(PushNotificationPromptComponent).componentInstance;
    });

    afterEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should have initial signal values', () => {
            expect(component.isLoading()).toBe(false);
        });
    });

    describe('shouldShowPrompt computed', () => {
        it('should show prompt when supported, permission is default, and not subscribed', () => {
            expect(component.shouldShowPrompt()).toBe(true);
        });

        it('should not show prompt when not supported', () => {
            mockPushService.isSupported.set(false);
            expect(component.shouldShowPrompt()).toBe(false);
        });

        it('should not show prompt when already subscribed', () => {
            mockPushService.isSubscribed.set(true);
            expect(component.shouldShowPrompt()).toBe(false);
        });

        it('should not show prompt when permission is granted', () => {
            mockPushService.permission.set('granted');
            expect(component.shouldShowPrompt()).toBe(false);
        });

        it('should not show prompt when permission is denied', () => {
            mockPushService.permission.set('denied');
            expect(component.shouldShowPrompt()).toBe(false);
        });

        it('should not show prompt after dismiss', () => {
            component.dismiss();
            expect(component.shouldShowPrompt()).toBe(false);
        });
    });

    describe('isBlocked computed', () => {
        it('should return false when permission is default', () => {
            expect(component.isBlocked()).toBe(false);
        });

        it('should return true when permission is denied', () => {
            mockPushService.permission.set('denied');
            expect(component.isBlocked()).toBe(true);
        });

        it('should return false when permission is granted', () => {
            mockPushService.permission.set('granted');
            expect(component.isBlocked()).toBe(false);
        });
    });

    describe('dismiss', () => {
        it('should hide the prompt', () => {
            expect(component.shouldShowPrompt()).toBe(true);

            component.dismiss();

            expect(component.shouldShowPrompt()).toBe(false);
        });

        it('should save dismissal to localStorage', () => {
            component.dismiss();

            const stored = localStorage.getItem('push-notification-dismissed');
            expect(stored).toBeTruthy();
            expect(Number.parseInt(stored!, 10)).toBeGreaterThan(0);
        });
    });

    describe('enableNotifications', () => {
        it('should set loading state while subscribing', async () => {
            expect(component.isLoading()).toBe(false);

            const promise = component.enableNotifications();
            expect(component.isLoading()).toBe(true);

            await promise;
            expect(component.isLoading()).toBe(false);
        });

        it('should call subscribeToPush on the service', async () => {
            await component.enableNotifications();

            expect(mockPushService.subscribeToPush).toHaveBeenCalled();
        });

        it('should show success snackbar on successful subscription', async () => {
            await component.enableNotifications();

            expect(translateSpy).toHaveBeenCalledWith('push_notifications.enabled_success');
            expect(translateSpy).toHaveBeenCalledWith('notifications.close');
            expect(mockSnackBar.open).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                { duration: 3000 }
            );
        });

        it('should dismiss prompt after successful subscription', async () => {
            expect(component.shouldShowPrompt()).toBe(true);

            await component.enableNotifications();

            expect(component.shouldShowPrompt()).toBe(false);
        });

        it('should handle generic error', async () => {
            mockPushService.subscribeToPush.mockReturnValue(
                throwError(() => new Error('Unknown error'))
            );

            await component.enableNotifications();

            expect(translateSpy).toHaveBeenCalledWith('push_notifications.error_generic');
            expect(mockSnackBar.open).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                { duration: 5000 }
            );
        });

        it('should handle denied permission error', async () => {
            mockPushService.subscribeToPush.mockReturnValue(
                throwError(() => new Error('Permission denied'))
            );

            await component.enableNotifications();

            expect(translateSpy).toHaveBeenCalledWith('push_notifications.error_denied');
            expect(mockSnackBar.open).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                { duration: 5000 }
            );
        });

        it('should handle not supported error', async () => {
            mockPushService.subscribeToPush.mockReturnValue(
                throwError(() => new Error('Push messaging is not supported'))
            );

            await component.enableNotifications();

            expect(translateSpy).toHaveBeenCalledWith('push_notifications.error_not_supported');
            expect(mockSnackBar.open).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                { duration: 5000 }
            );
        });

        it('should handle dialog closed error', async () => {
            mockPushService.subscribeToPush.mockReturnValue(
                throwError(() => new Error('Permission dialog closed'))
            );

            await component.enableNotifications();

            expect(translateSpy).toHaveBeenCalledWith('push_notifications.error_dialog_closed');
            expect(mockSnackBar.open).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                { duration: 5000 }
            );
        });

        it('should handle permission not granted error', async () => {
            mockPushService.subscribeToPush.mockReturnValue(
                throwError(() => new Error('Permission not granted'))
            );

            await component.enableNotifications();

            expect(translateSpy).toHaveBeenCalledWith('push_notifications.error_dialog_closed');
            expect(mockSnackBar.open).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                { duration: 5000 }
            );
        });

        it('should handle service worker error', async () => {
            mockPushService.subscribeToPush.mockReturnValue(
                throwError(() => new Error('Service Worker not registered'))
            );

            await component.enableNotifications();

            expect(translateSpy).toHaveBeenCalledWith('push_notifications.error_service_worker');
            expect(mockSnackBar.open).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                { duration: 5000 }
            );
        });

        it('should reset loading state even after error', async () => {
            mockPushService.subscribeToPush.mockReturnValue(
                throwError(() => new Error('Test error'))
            );

            await component.enableNotifications();

            expect(component.isLoading()).toBe(false);
        });

        it('should log error to console', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            const testError = new Error('Test error');

            mockPushService.subscribeToPush.mockReturnValue(
                throwError(() => testError)
            );

            await component.enableNotifications();

            expect(consoleSpy).toHaveBeenCalledWith(
                'Error enabling push notifications:',
                testError
            );
        });

        it('should handle non-Error objects', async () => {
            mockPushService.subscribeToPush.mockReturnValue(
                throwError(() => 'String error')
            );

            await component.enableNotifications();

            expect(translateSpy).toHaveBeenCalledWith('push_notifications.error_generic');
            expect(mockSnackBar.open).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                { duration: 5000 }
            );
        });
    });
});
