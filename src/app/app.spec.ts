import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { App } from './app';
import { AuthService } from './services/auth.service';
import { UserNotificationService } from './services/user-notification.service';
import { PushNotificationService } from './services/push-notification.service';
import { getTranslocoTestingModule } from './testing/transloco-testing.module';
import { Notification } from './models/notification.model';

describe('App', () => {
    let mockAuthService: { currentUser: ReturnType<typeof signal>; logout: ReturnType<typeof vi.fn> };
    let mockUserNotificationService: {
        notifications: ReturnType<typeof signal>;
        unreadCount: ReturnType<typeof signal>;
        setNotifications: ReturnType<typeof vi.fn>;
        markAsRead: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        getTmdbPosterUrl: ReturnType<typeof vi.fn>;
    };

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
        variables: { season_number: 5 }
    };

    beforeEach(() => {
        mockAuthService = {
            currentUser: signal(null),
            logout: vi.fn().mockResolvedValue(undefined)
        };

        mockUserNotificationService = {
            notifications: signal([mockNotification]),
            unreadCount: signal(1),
            setNotifications: vi.fn(),
            markAsRead: vi.fn(),
            delete: vi.fn(),
            getTmdbPosterUrl: vi.fn((path: string) => `https://image.tmdb.org/t/p/w200${path}`)
        };

        const mockPushService = {
            permission: signal('default'),
            isSubscribed: vi.fn().mockReturnValue(false),
            isSupported: signal(false),
            subscribeToPush: vi.fn(),
            unsubscribeFromPush: vi.fn(),
            showNotification: vi.fn().mockResolvedValue(undefined)
        };

        TestBed.configureTestingModule({
            imports: [App, getTranslocoTestingModule(), MatDialogModule, NoopAnimationsModule],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                { provide: AuthService, useValue: mockAuthService },
                { provide: UserNotificationService, useValue: mockUserNotificationService },
                { provide: PushNotificationService, useValue: mockPushService }
            ]
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
            notifications_count: 1
        };

        mockAuthService.currentUser.set(mockUser);
        fixture.detectChanges();

        expect(mockUserNotificationService.setNotifications).toHaveBeenCalledWith([mockNotification], 1);
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

    it('should not mark read notification as read again', async () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        const readNotification = { ...mockNotification, status: 'read' as const };

        await app.onNotificationClick(readNotification);

        expect(mockUserNotificationService.markAsRead).not.toHaveBeenCalled();
    });

    it('should delete notification and stop propagation', async () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        const event = {
            stopPropagation: vi.fn()
        } as unknown as Event;

        await app.onNotificationDelete(event, mockNotification);

        expect(event.stopPropagation).toHaveBeenCalled();
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
});
