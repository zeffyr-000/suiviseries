import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { createMockAuthService, createMockRouter } from '../testing/mocks';

describe('authGuard', () => {
    let mockAuthService: ReturnType<typeof createMockAuthService>;
    let mockRouter: ReturnType<typeof createMockRouter>;

    beforeEach(() => {
        mockAuthService = createMockAuthService();
        mockRouter = createMockRouter();

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: Router, useValue: mockRouter }
            ]
        });
    });

    it('should allow access when user is authenticated', () => {
        mockAuthService.isAuthenticated.mockReturnValue(true);

        const canActivate = TestBed.runInInjectionContext(() =>
            authGuard(
                {} as never,
                { url: '/my-series' } as never
            )
        );

        expect(canActivate).toBe(true);
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should deny access and redirect when user is not authenticated', () => {
        mockAuthService.isAuthenticated.mockReturnValue(false);

        const canActivate = TestBed.runInInjectionContext(() =>
            authGuard(
                {} as never,
                { url: '/my-series' } as never
            )
        );

        expect(canActivate).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(
            ['/'],
            { queryParams: { returnUrl: '/my-series', login: 'true' } }
        );
    });

    it('should include returnUrl in query params when redirecting', () => {
        mockAuthService.isAuthenticated.mockReturnValue(false);

        TestBed.runInInjectionContext(() =>
            authGuard(
                {} as never,
                { url: '/serie/123/breaking-bad' } as never
            )
        );

        expect(mockRouter.navigate).toHaveBeenCalledWith(
            ['/'],
            { queryParams: { returnUrl: '/serie/123/breaking-bad', login: 'true' } }
        );
    });

    it('should set login query param to true when redirecting', () => {
        mockAuthService.isAuthenticated.mockReturnValue(false);

        TestBed.runInInjectionContext(() =>
            authGuard(
                {} as never,
                { url: '/my-series' } as never
            )
        );

        const callArgs = mockRouter.navigate.mock.calls[0];
        expect(callArgs[1].queryParams.login).toBe('true');
    });

    it('should handle different protected URLs correctly', () => {
        mockAuthService.isAuthenticated.mockReturnValue(false);

        const urls = [
            '/my-series',
            '/profile',
            '/settings',
            '/serie/456/elite'
        ];

        urls.forEach(url => {
            mockRouter.navigate.mockClear();

            TestBed.runInInjectionContext(() =>
                authGuard(
                    {} as never,
                    { url } as never
                )
            );

            expect(mockRouter.navigate).toHaveBeenCalledWith(
                ['/'],
                { queryParams: { returnUrl: url, login: 'true' } }
            );
        });
    });
});
