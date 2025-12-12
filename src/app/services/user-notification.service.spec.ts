import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UserNotificationService } from './user-notification.service';
import { Notification } from '../models/notification.model';

describe('UserNotificationService', () => {
    let service: UserNotificationService;
    let httpMock: HttpTestingController;

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
            status: 'read',
            notified_at: '2025-11-27T15:30:00Z',
            read_at: '2025-11-27T16:00:00Z',
            created_at: '2025-11-27T15:30:00Z',
            variables: { episode_count: 3 }
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                UserNotificationService,
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });

        service = TestBed.inject(UserNotificationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        vi.restoreAllMocks();
    });

    describe('initialization', () => {
        it('should be created', () => {
            expect(service).toBeTruthy();
        });

        it('should initialize with empty notifications', () => {
            expect(service.notifications()).toEqual([]);
            expect(service.unreadCount()).toBe(0);
        });
    });

    describe('setNotifications', () => {
        it('should set notifications and unread count', () => {
            service.setNotifications(mockNotifications, 1);

            expect(service.notifications()).toEqual(mockNotifications);
            expect(service.unreadCount()).toBe(1);
        });

        it('should auto-calculate unread count when not provided', () => {
            service.setNotifications(mockNotifications);

            expect(service.notifications()).toEqual(mockNotifications);
            expect(service.unreadCount()).toBe(1); // Only first notification is unread
        });

        it('should handle empty notifications array', () => {
            service.setNotifications([], 0);

            expect(service.notifications()).toEqual([]);
            expect(service.unreadCount()).toBe(0);
        });
    });

    describe('markAsRead', () => {
        beforeEach(() => {
            service.setNotifications(mockNotifications, 1);
        });

        it('should mark notification as read and update count', () => {
            const notificationId = 1;

            service.markAsRead(notificationId);

            const req = httpMock.expectOne(`/api/notifications/${notificationId}`);
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual({ status: 'read' });
            req.flush({});

            const updatedNotification = service.notifications().find(n => n.user_notification_id === notificationId);
            expect(updatedNotification?.status).toBe('read');
            expect(service.unreadCount()).toBe(0);
        });

        it('should handle API error gracefully and rollback', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            const notificationId = 1;
            const originalUnreadCount = service.unreadCount();

            const promise = service.markAsRead(notificationId);

            const req = httpMock.expectOne(`/api/notifications/${notificationId}`);
            req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });

            await promise;

            const notification = service.notifications().find(n => n.user_notification_id === notificationId);
            expect(notification?.status).toBe('unread');
            expect(service.unreadCount()).toBe(originalUnreadCount);
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        beforeEach(() => {
            service.setNotifications(mockNotifications, 1);
        });

        it('should delete notification and update count', async () => {
            const notificationId = 1;

            const promise = service.delete(notificationId);

            const req = httpMock.expectOne(`/api/notifications/${notificationId}`);
            expect(req.request.method).toBe('DELETE');
            req.flush({});

            await promise;

            expect(service.notifications().length).toBe(1);
            expect(service.notifications().find(n => n.user_notification_id === notificationId)).toBeUndefined();
            expect(service.unreadCount()).toBe(0);
        });

        it('should handle API error gracefully', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            const notificationId = 1;
            const originalCount = service.notifications().length;

            const promise = service.delete(notificationId);

            const req = httpMock.expectOne(`/api/notifications/${notificationId}`);
            req.error(new ProgressEvent('error'), { status: 404, statusText: 'Not Found' });

            await promise;

            expect(service.notifications().length).toBe(originalCount);
            expect(consoleSpy).toHaveBeenCalled();
        });

        it('should not decrement unread count when deleting read notification', async () => {
            const initialUnreadCount = service.unreadCount();

            const promise = service.delete(2);

            const req = httpMock.expectOne('/api/notifications/2');
            req.flush({});

            await promise;

            expect(service.notifications().length).toBe(1);
            expect(service.unreadCount()).toBe(initialUnreadCount);
        });
    });

    describe('getTmdbPosterUrl', () => {
        it('should return full TMDB poster URL', () => {
            const posterPath = '/abc123.jpg';
            const size = 'w200';

            const url = service.getTmdbPosterUrl(posterPath, size);

            expect(url).toBe('https://image.tmdb.org/t/p/w200/abc123.jpg');
        });

        it('should handle different sizes', () => {
            const posterPath = '/test.jpg';

            expect(service.getTmdbPosterUrl(posterPath, 'w500')).toBe('https://image.tmdb.org/t/p/w500/test.jpg');
            expect(service.getTmdbPosterUrl(posterPath)).toBe('https://image.tmdb.org/t/p/w200/test.jpg');
        });
    });

    describe('optimistic updates', () => {
        it('should immediately update UI before API response for markAsRead', () => {
            service.setNotifications(mockNotifications, 1);
            const notificationId = 1;

            service.markAsRead(notificationId);

            const notification = service.notifications().find(n => n.user_notification_id === notificationId);
            expect(notification?.status).toBe('read');
            expect(service.unreadCount()).toBe(0);

            const req = httpMock.expectOne(`/api/notifications/${notificationId}`);
            req.flush({});
        });

        it('should update UI after API response for delete', async () => {
            service.setNotifications(mockNotifications, 1);
            const notificationId = 1;
            const originalLength = service.notifications().length;

            const promise = service.delete(notificationId);

            expect(service.notifications().length).toBe(originalLength);

            const req = httpMock.expectOne(`/api/notifications/${notificationId}`);
            req.flush({});

            await promise;

            expect(service.notifications().length).toBe(originalLength - 1);
            expect(service.notifications().find(n => n.user_notification_id === notificationId)).toBeUndefined();
        });
    });
});
