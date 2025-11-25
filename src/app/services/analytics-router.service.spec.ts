import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';
import { AnalyticsRouterService } from './analytics-router.service';
import { MetadataService } from './metadata.service';

describe('AnalyticsRouterService', () => {
    let service: AnalyticsRouterService;
    let mockRouter: {
        events: Subject<unknown>;
    };
    let mockMetadataService: {
        trackCurrentPage: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        mockRouter = {
            events: new Subject()
        };

        mockMetadataService = {
            trackCurrentPage: vi.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                AnalyticsRouterService,
                { provide: Router, useValue: mockRouter },
                { provide: MetadataService, useValue: mockMetadataService }
            ]
        });

        service = TestBed.inject(AnalyticsRouterService);
    });

    describe('initialize', () => {
        it('should track page on NavigationEnd events', () => {
            service.initialize();

            mockRouter.events.next(new NavigationEnd(1, '/home', '/home'));

            expect(mockMetadataService.trackCurrentPage).toHaveBeenCalledTimes(1);
        });

        it('should not track page on NavigationStart events', () => {
            service.initialize();

            mockRouter.events.next(new NavigationStart(1, '/home'));

            expect(mockMetadataService.trackCurrentPage).not.toHaveBeenCalled();
        });

        it('should track page on multiple NavigationEnd events', () => {
            service.initialize();

            mockRouter.events.next(new NavigationEnd(1, '/home', '/home'));
            mockRouter.events.next(new NavigationEnd(2, '/search', '/search'));
            mockRouter.events.next(new NavigationEnd(3, '/my-series', '/my-series'));

            expect(mockMetadataService.trackCurrentPage).toHaveBeenCalledTimes(3);
        });

        it('should handle mixed navigation events correctly', () => {
            service.initialize();

            mockRouter.events.next(new NavigationStart(1, '/home'));
            mockRouter.events.next(new NavigationEnd(1, '/home', '/home'));
            mockRouter.events.next(new NavigationStart(2, '/search'));
            mockRouter.events.next(new NavigationEnd(2, '/search', '/search'));

            // Should only track NavigationEnd events
            expect(mockMetadataService.trackCurrentPage).toHaveBeenCalledTimes(2);
        });

        it('should not break if trackCurrentPage throws error', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
                // Mock console.error to avoid noise in test output
            });

            mockMetadataService.trackCurrentPage.mockImplementation(() => {
                throw new Error('Tracking error');
            });

            service.initialize();

            // Should catch error internally
            mockRouter.events.next(new NavigationEnd(1, '/home', '/home'));

            // Verify the function was called
            expect(mockMetadataService.trackCurrentPage).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });

        it('should continue tracking after error in trackCurrentPage', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
                // Mock console.error to avoid noise in test output
            });

            let callCount = 0;
            mockMetadataService.trackCurrentPage.mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                    throw new Error('First call error');
                }
            });

            service.initialize();

            // First call throws but is caught internally
            mockRouter.events.next(new NavigationEnd(1, '/home', '/home'));
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error tracking page navigation:', expect.any(Error));

            // Second call should work
            mockRouter.events.next(new NavigationEnd(2, '/search', '/search'));

            expect(mockMetadataService.trackCurrentPage).toHaveBeenCalledTimes(2);

            consoleErrorSpy.mockRestore();
        });

        it('should track different route URLs', () => {
            service.initialize();

            const routes = [
                '/home',
                '/search',
                '/my-series',
                '/serie/123/breaking-bad',
                '/login'
            ];

            routes.forEach((url, index) => {
                mockRouter.events.next(new NavigationEnd(index + 1, url, url));
            });

            expect(mockMetadataService.trackCurrentPage).toHaveBeenCalledTimes(routes.length);
        });

        it('should not call trackCurrentPage before initialize is called', () => {
            // Don't call initialize()
            mockRouter.events.next(new NavigationEnd(1, '/home', '/home'));

            expect(mockMetadataService.trackCurrentPage).not.toHaveBeenCalled();
        });

        it('should only subscribe once when initialize is called multiple times', () => {
            service.initialize();
            service.initialize();
            service.initialize();

            mockRouter.events.next(new NavigationEnd(1, '/home', '/home'));

            // Should only be called once (subscription guard prevents multiple subscriptions)
            expect(mockMetadataService.trackCurrentPage).toHaveBeenCalledTimes(1);
        });
    });
});
