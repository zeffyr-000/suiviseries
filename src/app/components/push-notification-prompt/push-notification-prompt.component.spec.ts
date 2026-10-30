import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NEVER, throwError } from 'rxjs';

import {
    PushNotificationPromptComponent,
    PUSH_PROMPT_COOLDOWN_MS,
    PUSH_PROMPT_DISMISSED_KEY,
} from './push-notification-prompt.component';
import { PushNotificationService } from '../../services/push-notification.service';
import { NotificationService } from '../../services/notification.service';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';
import {
    createMockPushNotificationService,
    createMockNotificationService,
} from '../../testing/mocks';

describe('PushNotificationPromptComponent', () => {
    let component: PushNotificationPromptComponent;
    let mockPushService: ReturnType<typeof createMockPushNotificationService>;
    let mockNotificationService: ReturnType<typeof createMockNotificationService>;

    const createComponent = () =>
        TestBed.createComponent(PushNotificationPromptComponent).componentInstance;

    beforeEach(() => {
        mockPushService = createMockPushNotificationService();
        mockNotificationService = createMockNotificationService();

        TestBed.configureTestingModule({
            imports: [PushNotificationPromptComponent, getTranslocoTestingModule()],
            providers: [
                { provide: PushNotificationService, useValue: mockPushService },
                { provide: NotificationService, useValue: mockNotificationService },
            ],
        });

        component = createComponent();
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

    describe('dismiss', () => {
        it('should hide the prompt', () => {
            expect(component.shouldShowPrompt()).toBe(true);

            component.dismiss();

            expect(component.shouldShowPrompt()).toBe(false);
        });

        it('should save dismissal to localStorage', () => {
            component.dismiss();

            const stored = localStorage.getItem(PUSH_PROMPT_DISMISSED_KEY);
            expect(stored).toBeTruthy();
            expect(Number.parseInt(stored!, 10)).toBeGreaterThan(0);
        });
    });

    describe('persisted dismissal', () => {
        it('should stay hidden on a later visit after a recent dismissal', () => {
            localStorage.setItem(PUSH_PROMPT_DISMISSED_KEY, Date.now().toString());

            expect(createComponent().shouldShowPrompt()).toBe(false);
        });

        it('should ask again once the cooldown has elapsed', () => {
            const expired = Date.now() - PUSH_PROMPT_COOLDOWN_MS - 1000;
            localStorage.setItem(PUSH_PROMPT_DISMISSED_KEY, expired.toString());

            expect(createComponent().shouldShowPrompt()).toBe(true);
        });

        it('should ignore an unreadable stored value', () => {
            localStorage.setItem(PUSH_PROMPT_DISMISSED_KEY, 'not-a-timestamp');

            expect(createComponent().shouldShowPrompt()).toBe(true);
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

        it('should confirm success through the notification service', async () => {
            await component.enableNotifications();

            expect(mockNotificationService.success).toHaveBeenCalledWith(
                'push_notifications.enabled_success',
            );
        });

        it('should dismiss prompt after successful subscription', async () => {
            expect(component.shouldShowPrompt()).toBe(true);

            await component.enableNotifications();

            expect(component.shouldShowPrompt()).toBe(false);
        });

        it.each([
            { error: 'Unknown error', expectedKey: 'push_notifications.error_generic' },
            { error: 'Permission denied', expectedKey: 'push_notifications.error_denied' },
            {
                error: 'Push messaging is not supported',
                expectedKey: 'push_notifications.error_not_supported',
            },
            {
                error: 'Permission dialog closed',
                expectedKey: 'push_notifications.error_dialog_closed',
            },
            {
                error: 'Service Worker not registered',
                expectedKey: 'push_notifications.error_service_worker',
            },
        ])('should report "$error" as $expectedKey', async ({ error, expectedKey }) => {
            vi.spyOn(console, 'error').mockImplementation(() => undefined);
            mockPushService.subscribeToPush.mockReturnValue(throwError(() => new Error(error)));

            await component.enableNotifications();

            expect(mockNotificationService.error).toHaveBeenCalledWith(expectedKey);
        });

        it('should reset loading state even after error', async () => {
            mockPushService.subscribeToPush.mockReturnValue(
                throwError(() => new Error('Test error')),
            );

            await component.enableNotifications();

            expect(component.isLoading()).toBe(false);
        });

        it('should log error to console', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            const testError = new Error('Test error');

            mockPushService.subscribeToPush.mockReturnValue(throwError(() => testError));

            await component.enableNotifications();

            expect(consoleSpy).toHaveBeenCalledWith(
                'Error enabling push notifications:',
                testError,
            );
        });

        it('should handle non-Error objects', async () => {
            vi.spyOn(console, 'error').mockImplementation(() => undefined);
            mockPushService.subscribeToPush.mockReturnValue(throwError(() => 'String error'));

            await component.enableNotifications();

            expect(mockNotificationService.error).toHaveBeenCalledWith(
                'push_notifications.error_generic',
            );
        });
    });

    describe('Template', () => {
        const render = () => {
            const fixture = TestBed.createComponent(PushNotificationPromptComponent);
            fixture.detectChanges();
            return fixture;
        };

        it('should render the prompt as a labelled complementary region', () => {
            const prompt = render().nativeElement.querySelector('aside.push-prompt');

            expect(prompt).toBeTruthy();
            expect(prompt.getAttribute('aria-label')).toBeTruthy();
        });

        it('should render nothing when the browser cannot receive push', () => {
            mockPushService.isSupported.set(false);

            expect(render().nativeElement.querySelector('.push-prompt')).toBeNull();
        });

        it('should disappear when "not now" is clicked', () => {
            const fixture = render();

            fixture.nativeElement.querySelector('.push-prompt-actions button').click();
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.push-prompt')).toBeNull();
        });

        it('should lock the enable button while subscribing', () => {
            mockPushService.subscribeToPush.mockReturnValue(NEVER);
            const fixture = render();
            const buttons = fixture.nativeElement.querySelectorAll('.push-prompt-actions button');

            buttons[1].click();
            fixture.detectChanges();

            expect(buttons[1].disabled).toBe(true);
            expect(fixture.nativeElement.querySelector('.spinner')).toBeTruthy();
        });
    });
});
