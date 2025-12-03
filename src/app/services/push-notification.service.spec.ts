import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { PushNotificationService, PushSubscriptionData } from './push-notification.service';
import { environment } from '../../environments/environment';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Helper functions to reduce nesting
function expectSubscribeError(service: PushNotificationService, expectedStatus: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        service.subscribeToPush().subscribe({
            next: () => reject(new Error('Should not succeed')),
            error: (error) => {
                expect(error.status).toBe(expectedStatus);
                resolve();
            }
        });
    });
}

function expectSubscribeNotSupported(service: PushNotificationService): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        service.subscribeToPush().subscribe({
            next: () => reject(new Error('Should not succeed')),
            error: (error) => {
                expect(error.message).toContain('not supported');
                resolve();
            }
        });
    });
}

function expectUnsubscribeSuccess(service: PushNotificationService, mockSwPush: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        service.unsubscribeFromPush().subscribe({
            next: () => {
                expect(mockSwPush.unsubscribe).toHaveBeenCalled();
                expect(service.isSubscribed()).toBe(false);
                resolve();
            },
            error: reject
        });
    });
}

function expectUnsubscribeNotSupported(service: PushNotificationService): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        service.unsubscribeFromPush().subscribe({
            next: () => reject(new Error('Should not succeed')),
            error: (error) => {
                expect(error.message).toContain('not supported');
                resolve();
            }
        });
    });
}

describe('PushNotificationService', () => {
    let service: PushNotificationService;
    let httpMock: HttpTestingController;
    let mockSwPush: any;
    let mockRouter: any;

    const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
        toJSON: vi.fn(() => ({
            endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
            keys: {
                'p256dh': 'test-p256dh-key',
                'auth': 'test-auth-key'
            }
        })),
        unsubscribe: vi.fn()
    } as any;

    beforeEach(() => {
        // Mock Notification API
        (globalThis as any).Notification = {
            permission: 'default',
            requestPermission: vi.fn(() => Promise.resolve('granted'))
        };

        // Mock ServiceWorker API
        Object.defineProperty(navigator, 'serviceWorker', {
            writable: true,
            configurable: true,
            value: {
                ready: Promise.resolve({
                    pushManager: {
                        subscribe: vi.fn(),
                        getSubscription: vi.fn()
                    },
                    showNotification: vi.fn()
                })
            }
        });

        // Mock SwPush
        mockSwPush = {
            isEnabled: true,
            subscription: of(null),
            notificationClicks: of(),
            messages: of(),
            requestSubscription: vi.fn().mockResolvedValue(mockSubscription),
            unsubscribe: vi.fn().mockResolvedValue(undefined)
        };

        // Mock Router
        mockRouter = {
            navigateByUrl: vi.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                PushNotificationService,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: SwPush, useValue: mockSwPush },
                { provide: Router, useValue: mockRouter }
            ]
        });

        service = TestBed.inject(PushNotificationService);
        httpMock = TestBed.inject(HttpTestingController);

        // Reset mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        httpMock.verify();
        TestBed.resetTestingModule();
    });

    describe('initialization', () => {
        it('should check if push notifications are supported', () => {
            expect(service.isSupported()).toBe(true);
        });

        it('should return false when SwPush is not enabled', () => {
            const disabledSwPush = { ...mockSwPush, isEnabled: false, subscription: of(null), notificationClicks: of(), messages: of() };
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                providers: [
                    PushNotificationService,
                    provideHttpClient(),
                    provideHttpClientTesting(),
                    { provide: SwPush, useValue: disabledSwPush },
                    { provide: Router, useValue: mockRouter }
                ]
            });
            const newService = TestBed.inject(PushNotificationService);
            expect(newService.isSupported()).toBe(false);
            TestBed.inject(HttpTestingController).verify();
        });

        it('should initialize with default permission state', () => {
            expect(service.permission()).toBe('default');
        });
    });

    describe('subscribeToPush', () => {
        it('should subscribe to push notifications successfully', async () => {
            const promise = new Promise<PushSubscriptionData>((resolve, reject) => {
                service.subscribeToPush().subscribe({
                    next: resolve,
                    error: reject
                });
            });

            // Wait for async requestSubscription to complete
            await Promise.resolve();

            const req = httpMock.expectOne(`${environment.apiUrl}/push/subscribe`);
            expect(req.request.method).toBe('POST');
            req.flush({
                endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
                keys: {
                    p256dh: 'test-p256dh-key',
                    auth: 'test-auth-key'
                }
            });

            const data = await promise;
            expect(data.endpoint).toBe('https://fcm.googleapis.com/fcm/send/test-endpoint');
            expect(data.keys.p256dh).toBe('test-p256dh-key');
            expect(data.keys.auth).toBe('test-auth-key');
            expect(service.isSubscribed()).toBe(true);
        });

        it('should handle HTTP error from server', async () => {
            const promise = expectSubscribeError(service, 500);

            await Promise.resolve();
            const req = httpMock.expectOne(`${environment.apiUrl}/push/subscribe`);
            req.flush({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });

            await promise;
        });

        it('should throw error when SwPush is not enabled', async () => {
            const disabledSwPush = { ...mockSwPush, isEnabled: false, subscription: of(null), notificationClicks: of(), messages: of() };
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                providers: [
                    PushNotificationService,
                    provideHttpClient(),
                    provideHttpClientTesting(),
                    { provide: SwPush, useValue: disabledSwPush },
                    { provide: Router, useValue: mockRouter }
                ]
            });
            const newService = TestBed.inject(PushNotificationService);
            const newHttpMock = TestBed.inject(HttpTestingController);

            const promise = expectSubscribeNotSupported(newService);

            await promise;
            newHttpMock.verify();
        });
    });

    describe('unsubscribeFromPush', () => {
        it('should unsubscribe from push notifications successfully', async () => {
            const promise = expectUnsubscribeSuccess(service, mockSwPush);

            await Promise.resolve();
            const req = httpMock.expectOne(`${environment.apiUrl}/push/unsubscribe`);
            expect(req.request.method).toBe('GET');
            req.flush({});

            await promise;
        });

        it('should throw error when SwPush is not enabled', async () => {
            const disabledSwPush = { ...mockSwPush, isEnabled: false, subscription: of(null), notificationClicks: of(), messages: of() };
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                providers: [
                    PushNotificationService,
                    provideHttpClient(),
                    provideHttpClientTesting(),
                    { provide: SwPush, useValue: disabledSwPush },
                    { provide: Router, useValue: mockRouter }
                ]
            });
            const newService = TestBed.inject(PushNotificationService);
            const newHttpMock = TestBed.inject(HttpTestingController);

            const promise = expectUnsubscribeNotSupported(newService);

            await promise;
            newHttpMock.verify();
        });
    });

    describe('showNotification', () => {
        let mockRegistration: any;

        beforeEach(async () => {
            service.permission.set('granted');
            mockRegistration = await navigator.serviceWorker.ready;
            mockRegistration.showNotification.mockResolvedValue(undefined);
        });

        it('should show notification successfully', async () => {
            await service.showNotification('Test Title', {
                body: 'Test body',
                tag: 'test-tag'
            });

            expect(mockRegistration.showNotification).toHaveBeenCalledWith('Test Title', {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                body: 'Test body',
                tag: 'test-tag'
            });
        });

        it('should throw error when not supported', async () => {
            const disabledSwPush = { ...mockSwPush, isEnabled: false, subscription: of(null), notificationClicks: of(), messages: of() };
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                providers: [
                    PushNotificationService,
                    provideHttpClient(),
                    provideHttpClientTesting(),
                    { provide: SwPush, useValue: disabledSwPush },
                    { provide: Router, useValue: mockRouter }
                ]
            });
            const newService = TestBed.inject(PushNotificationService);

            await expect(
                newService.showNotification('Test')
            ).rejects.toThrow('Notifications are not supported');

            TestBed.inject(HttpTestingController).verify();
        });

        it('should throw error when permission not granted', async () => {
            service.permission.set('denied');

            await expect(
                service.showNotification('Test')
            ).rejects.toThrow('Notification permission not granted');
        });
    });
});
