import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { App } from './app';
import { AuthService } from './services/auth.service';
import { UserNotificationService } from './services/user-notification.service';
import { PushNotificationService } from './services/push-notification.service';
import { NotificationService } from './services/notification.service';
import { getTranslocoTestingModule } from './testing/transloco-testing.module';
import { Notification } from './models/notification.model';
import { createMockNotificationService } from './testing/mocks';

describe('App', () => {
    let mockAuthService: {
        currentUser: ReturnType<typeof signal>;
        logout: ReturnType<typeof vi.fn>;
    };
    let mockUserNotificationService: {
        notifications: ReturnType<typeof signal>;
        unreadCount: ReturnType<typeof signal>;
        setNotifications: ReturnType<typeof vi.fn>;
        markAsRead: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        getTmdbPosterUrl: ReturnType<typeof vi.fn>;
    };
    let mockPushService: {
        permission: ReturnType<typeof signal<NotificationPermission>>;
        isSubscribed: ReturnType<typeof vi.fn>;
        isSupported: ReturnType<typeof signal<boolean>>;
        subscribeToPush: ReturnType<typeof vi.fn>;
        unsubscribeFromPush: ReturnType<typeof vi.fn>;
        showNotification: ReturnType<typeof vi.fn>;
    };
    let mockNotificationService: ReturnType<typeof createMockNotificationService>;

    const mockNotification: Notification = {
        user_notification_id: 1,
        notification_id: 1001,
        serie_id: 101,
        serie_name: 'Breaking Bad',
        serie_poster: '/poster.jpg',
        type: 'new_season',
        translation_key: 'notification.new_season',
        status: 'unread',
        notified_at: '2025-11-28T10:00:00Z',
        read_at: null,
        created_at: '2025-11-28T10:00:00Z',
        variables: { season_number: 5 },
    };

    beforeEach(() => {
        mockAuthService = {
            currentUser: signal(null),
            logout: vi.fn().mockResolvedValue(undefined),
        };

        mockUserNotificationService = {
            notifications: signal([mockNotification]),
            unreadCount: signal(1),
            setNotifications: vi.fn(),
            markAsRead: vi.fn(),
            delete: vi.fn(),
            getTmdbPosterUrl: vi.fn((path: string) => `https://image.tmdb.org/t/p/w200${path}`),
        };

        mockPushService = {
            permission: signal<NotificationPermission>('default'),
            isSubscribed: vi.fn().mockReturnValue(false),
            isSupported: signal(false),
            subscribeToPush: vi.fn().mockReturnValue(of(undefined)),
            unsubscribeFromPush: vi.fn().mockReturnValue(of(undefined)),
            showNotification: vi.fn().mockResolvedValue(undefined),
        };
        mockNotificationService = createMockNotificationService();

        TestBed.configureTestingModule({
            imports: [App, getTranslocoTestingModule(), MatDialogModule],
            providers: [
                // Catch-all so the template's routerLinks (/, /search, /mes-series, /legal)
                // resolve during change detection instead of throwing NG04002.
                provideRouter([{ path: '**', children: [] }]),
                provideHttpClient(),
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                provideNoopAnimations(),
                { provide: AuthService, useValue: mockAuthService },
                { provide: UserNotificationService, useValue: mockUserNotificationService },
                { provide: PushNotificationService, useValue: mockPushService },
                { provide: NotificationService, useValue: mockNotificationService },
            ],
        });
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
        expect(app.toggleMenu).toBeDefined();
        expect(app.toggleNotifications).toBeDefined();
    });

    it('should toggle menu state', () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        const initialState = app['menuOpen']();

        app.toggleMenu();

        expect(app['menuOpen']()).toBe(!initialState);

        app.toggleMenu();

        expect(app['menuOpen']()).toBe(initialState);
    });

    it('should toggle notifications drawer', () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;

        // Test that toggleNotifications method exists and can be called without error
        expect(() => app.toggleNotifications()).not.toThrow();
    });

    it('should load notifications when user logs in', () => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        const mockUser = {
            user_id: 1,
            email: 'test@example.com',
            display_name: 'Test User',
            photo_url: null,
            notifications: [mockNotification],
            notifications_count: 1,
        };

        mockAuthService.currentUser.set(mockUser);
        fixture.detectChanges();

        expect(mockUserNotificationService.setNotifications).toHaveBeenCalledWith(
            [mockNotification],
            1,
        );
    });

    it('should get formatted notification message', () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;

        const message = app.getNotificationMessage(mockNotification);

        // Should return a string (Transloco returns the key in tests)
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
    });

    it('should handle notification click', async () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        const router = TestBed.inject(Router);
        const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

        await app.onNotificationClick(mockNotification);

        expect(mockUserNotificationService.markAsRead).toHaveBeenCalledWith(1);
        expect(navigateSpy).toHaveBeenCalledWith(['/serie', 101, 'breaking-bad']);
    });

    it('should call markAsRead even for read notifications (service handles idempotence)', async () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        const readNotification = { ...mockNotification, status: 'read' as const };

        await app.onNotificationClick(readNotification);

        expect(mockUserNotificationService.markAsRead).toHaveBeenCalledWith(1);
    });

    it('should delete a notification', async () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;

        await app.onNotificationDelete(mockNotification);

        expect(mockUserNotificationService.delete).toHaveBeenCalledWith(1);
    });

    it('should open login dialog', () => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const app = fixture.componentInstance;

        expect(() => app.login()).not.toThrow();
    });

    it('should logout and navigate to home', async () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        const router = TestBed.inject(Router);
        const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

        await app.logout();

        expect(mockAuthService.logout).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    describe('Side navigation', () => {
        it('should close the menu explicitly', () => {
            const fixture = TestBed.createComponent(App);
            const app = fixture.componentInstance;

            app.toggleMenu();
            app['closeMenu']();

            expect(app['menuOpen']()).toBe(false);
        });

        it('should render each destination as a real link', () => {
            const fixture = TestBed.createComponent(App);
            fixture.detectChanges();

            const hrefs = Array.from(
                fixture.nativeElement.querySelectorAll('mat-nav-list a[mat-list-item]'),
                (link: Element) => link.getAttribute('href'),
            );

            expect(hrefs).toEqual(['/', '/search', '/legal']);
        });

        it('should add the collection link once signed in', () => {
            mockAuthService.currentUser.set({ user_id: 1, display_name: 'Test' });
            const fixture = TestBed.createComponent(App);
            fixture.detectChanges();

            const hrefs = Array.from(
                fixture.nativeElement.querySelectorAll('mat-nav-list a[mat-list-item]'),
                (link: Element) => link.getAttribute('href'),
            );

            expect(hrefs).toContain('/mes-series');
        });

        it('should label the menu button for assistive technology', () => {
            const fixture = TestBed.createComponent(App);
            fixture.detectChanges();

            const button = fixture.nativeElement.querySelector('.app-toolbar button');

            expect(button.getAttribute('aria-label')).toBe('Ouvrir le menu');
            expect(button.getAttribute('aria-expanded')).toBe('false');
        });
    });

    describe('Notification list', () => {
        it('should not nest the delete button inside the open button', () => {
            const fixture = TestBed.createComponent(App);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('button button')).toBeNull();
        });

        it('should give the delete button an accessible name', () => {
            const fixture = TestBed.createComponent(App);
            fixture.detectChanges();

            const deleteButton = fixture.nativeElement.querySelector('.delete-button');

            expect(deleteButton.getAttribute('aria-label')).toBe(
                'Supprimer la notification de Breaking Bad',
            );
        });

        it('should open the serie when the row is activated', () => {
            const fixture = TestBed.createComponent(App);
            fixture.detectChanges();
            const app = fixture.componentInstance;
            const openSpy = vi.spyOn(app, 'onNotificationClick').mockResolvedValue();

            fixture.nativeElement.querySelector('.notification-main').click();

            expect(openSpy).toHaveBeenCalledWith(mockNotification);
        });

        it('should delete without opening the serie', () => {
            const fixture = TestBed.createComponent(App);
            fixture.detectChanges();
            const app = fixture.componentInstance;
            const openSpy = vi.spyOn(app, 'onNotificationClick').mockResolvedValue();

            fixture.nativeElement.querySelector('.delete-button').click();

            expect(mockUserNotificationService.delete).toHaveBeenCalledWith(1);
            expect(openSpy).not.toHaveBeenCalled();
        });

        it('should show the empty state when there is nothing to show', () => {
            mockUserNotificationService.notifications.set([]);
            const fixture = TestBed.createComponent(App);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.no-notifications')).toBeTruthy();
            expect(fixture.nativeElement.querySelector('.notification-item')).toBeNull();
        });
    });

    describe('togglePushNotifications', () => {
        beforeEach(() => {
            vi.spyOn(console, 'error').mockImplementation(() => undefined);
        });

        it('should subscribe and confirm when push is off', async () => {
            const app = TestBed.createComponent(App).componentInstance;

            await app.togglePushNotifications();

            expect(mockPushService.subscribeToPush).toHaveBeenCalled();
            expect(mockNotificationService.success).toHaveBeenCalledWith(
                'push_notifications.enabled_success',
            );
            expect(mockPushService.showNotification).toHaveBeenCalled();
            expect(app['pushLoading']()).toBe(false);
        });

        it('should report a denied permission with its own message', async () => {
            mockPushService.subscribeToPush.mockReturnValue(
                throwError(() => new Error('Permission denied')),
            );
            const app = TestBed.createComponent(App).componentInstance;

            await app.togglePushNotifications();

            expect(mockNotificationService.error).toHaveBeenCalledWith(
                'push_notifications.error_denied',
            );
            expect(app['pushLoading']()).toBe(false);
        });

        it('should unsubscribe and confirm when push is on', async () => {
            mockPushService.permission.set('granted');
            mockPushService.isSubscribed.mockReturnValue(true);
            const app = TestBed.createComponent(App).componentInstance;

            await app.togglePushNotifications();

            expect(mockPushService.unsubscribeFromPush).toHaveBeenCalled();
            expect(mockNotificationService.success).toHaveBeenCalledWith(
                'push_notifications.disabled_success',
            );
        });

        it('should report a failed unsubscribe', async () => {
            mockPushService.permission.set('granted');
            mockPushService.isSubscribed.mockReturnValue(true);
            mockPushService.unsubscribeFromPush.mockReturnValue(
                throwError(() => new Error('No subscription found')),
            );
            const app = TestBed.createComponent(App).componentInstance;

            await app.togglePushNotifications();

            expect(mockNotificationService.error).toHaveBeenCalledWith(
                'push_notifications.error_generic',
            );
            expect(app['pushLoading']()).toBe(false);
        });
    });
});
