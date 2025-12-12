import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { App } from '../app';
import { AuthService } from '../services/auth.service';
import { UserNotificationService } from '../services/user-notification.service';
import { PushNotificationService } from '../services/push-notification.service';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';
import { Notification } from '../models/notification.model';

describe('Notifications Integration', () => {
    let fixture: ComponentFixture<App>;
    let component: App;
    let httpMock: HttpTestingController;
    let router: Router;
    let authService: AuthService;
    let notificationService: UserNotificationService;

    const mockNotifications: Notification[] = [
        {
            user_notification_id: 1,
            notification_id: 1001,
            serie_id: 101,
            serie_name: 'Breaking Bad',
            serie_poster: '/poster1.jpg',
            type: 'new_season',
            translation_key: 'notification.new_season',
            status: 'unread',
            notified_at: '2025-11-28T10:00:00Z',
            read_at: null,
            created_at: '2025-11-28T10:00:00Z',
            variables: { season_number: 5 }
        },
        {
            user_notification_id: 2,
            notification_id: 1002,
            serie_id: 102,
            serie_name: 'The Wire',
            serie_poster: '/poster2.jpg',
            type: 'new_episodes',
            translation_key: 'notification.new_episodes',
            status: 'unread',
            notified_at: '2025-11-27T15:30:00Z',
            read_at: null,
            created_at: '2025-11-27T15:30:00Z',
            variables: { episode_count: 3 }
        }
    ];

    beforeEach(() => {
        const currentUserSignal = signal(null);
        const mockAuthService = {
            currentUser: currentUserSignal,
            logout: vi.fn().mockResolvedValue(undefined)
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
            imports: [App, getTranslocoTestingModule()],
            providers: [
                provideRouter([
                    { path: 'serie/:id/:slug', component: App }
                ]),
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: AuthService, useValue: mockAuthService },
                { provide: PushNotificationService, useValue: mockPushService },
                UserNotificationService
            ]
        });

        fixture = TestBed.createComponent(App);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
        authService = TestBed.inject(AuthService);
        notificationService = TestBed.inject(UserNotificationService);

        fixture.detectChanges();
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('User login with notifications', () => {
        it('should load and display notifications when user logs in', () => {
            const mockUser = {
                user_id: 1,
                email: 'test@example.com',
                display_name: 'Test User',
                photo_url: null,
                notifications: mockNotifications,
                notifications_count: 2
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (authService.currentUser as any).set(mockUser);
            fixture.detectChanges();

            expect(notificationService.notifications()).toEqual(mockNotifications);
            expect(notificationService.unreadCount()).toBe(2);
        });
    });

    describe('Notification interactions', () => {
        beforeEach(() => {
            notificationService.setNotifications(mockNotifications, 2);
            fixture.detectChanges();
        });

        it('should mark notification as read and navigate to serie', () => {
            const navigateSpy = vi.spyOn(router, 'navigate');
            const notification = mockNotifications[0];

            component.onNotificationClick(notification);

            const req = httpMock.expectOne(`/api/notifications/${notification.user_notification_id}`);
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual({ status: 'read' });
            req.flush({});

            expect(notificationService.unreadCount()).toBe(1);
            expect(component['notificationsOpen']()).toBe(false);
            expect(navigateSpy).toHaveBeenCalledWith(['/serie', 101, 'breaking-bad']);
        });

        it('should delete notification and update count', async () => {
            const event = new MouseEvent('click');
            const notification = mockNotifications[0];

            component.onNotificationDelete(event, notification);

            const req = httpMock.expectOne(`/api/notifications/${notification.user_notification_id}`);
            expect(req.request.method).toBe('DELETE');
            req.flush({});

            await Promise.resolve();

            expect(notificationService.notifications().length).toBe(1);
            expect(notificationService.unreadCount()).toBe(1);
        });

        it('should handle multiple notification actions in sequence', async () => {
            component.onNotificationClick(mockNotifications[0]);
            const readReq = httpMock.expectOne('/api/notifications/1');
            readReq.flush({});

            expect(notificationService.unreadCount()).toBe(1);

            const event = new MouseEvent('click');
            component.onNotificationDelete(event, mockNotifications[1]);
            const deleteReq = httpMock.expectOne('/api/notifications/2');
            expect(deleteReq.request.method).toBe('DELETE');
            deleteReq.flush({});

            await Promise.resolve();

            expect(notificationService.notifications().length).toBe(1);
            expect(notificationService.unreadCount()).toBe(0);
        });
    });

    describe('Drawer state management', () => {
        it('should open and close notifications drawer', () => {
            expect(component['notificationsOpen']()).toBe(false);

            component.toggleNotifications();
            fixture.detectChanges();

            expect(component['notificationsOpen']()).toBe(true);

            component.toggleNotifications();
            fixture.detectChanges();

            expect(component['notificationsOpen']()).toBe(false);
        });

        it('should close drawer after clicking notification', () => {
            notificationService.setNotifications(mockNotifications, 2);
            component.toggleNotifications();
            fixture.detectChanges();

            expect(component['notificationsOpen']()).toBe(true);

            component.onNotificationClick(mockNotifications[0]);

            const req = httpMock.expectOne('/api/notifications/1');
            req.flush({});

            expect(component['notificationsOpen']()).toBe(false);
        });
    });

    describe('Error handling', () => {
        beforeEach(() => {
            notificationService.setNotifications(mockNotifications, 2);
        });

        it('should handle mark as read API error', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            const originalCount = notificationService.unreadCount();

            component.onNotificationClick(mockNotifications[0]);

            const req = httpMock.expectOne('/api/notifications/1');
            req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });

            await Promise.resolve();

            expect(notificationService.unreadCount()).toBe(originalCount);
            expect(consoleSpy).toHaveBeenCalled();
        });

        it('should handle delete API error', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            const originalLength = notificationService.notifications().length;
            const event = new MouseEvent('click');

            component.onNotificationDelete(event, mockNotifications[0]);

            const req = httpMock.expectOne('/api/notifications/1');
            req.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });

            await Promise.resolve();

            expect(notificationService.notifications().length).toBe(originalLength);
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('Badge count', () => {
        it('should update badge count when marking notifications as read', () => {
            notificationService.setNotifications(mockNotifications, 2);
            fixture.detectChanges();

            expect(notificationService.unreadCount()).toBe(2);

            component.onNotificationClick(mockNotifications[0]);
            const req1 = httpMock.expectOne('/api/notifications/1');
            req1.flush({});

            expect(notificationService.unreadCount()).toBe(1);

            component.onNotificationClick(mockNotifications[1]);
            const req2 = httpMock.expectOne('/api/notifications/2');
            req2.flush({});

            expect(notificationService.unreadCount()).toBe(0);
        });

        it('should update badge count when deleting unread notifications', async () => {
            notificationService.setNotifications(mockNotifications, 2);
            fixture.detectChanges();

            const event = new MouseEvent('click');
            component.onNotificationDelete(event, mockNotifications[0]);

            const req = httpMock.expectOne('/api/notifications/1');
            req.flush({});

            await Promise.resolve();

            expect(notificationService.unreadCount()).toBe(1);
            expect(notificationService.notifications().length).toBe(1);
        });
    });
});
