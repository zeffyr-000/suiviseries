import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { AuthService } from './auth.service';
import { KeepAliveService } from './keep-alive.service';
import { User, UserStatus } from '../models/user.model';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';

describe('Session Persistence Integration', () => {
    let authService: AuthService;
    let keepAliveService: KeepAliveService;
    let httpMock: HttpTestingController;

    const mockUser: User = {
        id: 1,
        google_id: 'google-123',
        email: 'test@test.com',
        display_name: 'Test User',
        photo_url: 'https://example.com/photo.jpg',
        status: UserStatus.ACTIVE,
        created_at: '2023-01-01',
        last_login: '2023-01-01'
    };

    // Helper function to mock Google Sign-In initialization
    function mockGoogleSignIn(service: AuthService) {
        vi.spyOn(
            service as unknown as { waitAndConfigureGoogleSignIn: () => Promise<void> },
            'waitAndConfigureGoogleSignIn'
        ).mockResolvedValue(undefined);
    }

    // Helper function to recreate services for browser restart simulation
    function recreateAuthServiceForBrowserRestart() {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [getTranslocoTestingModule()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                AuthService,
                KeepAliveService
            ]
        });

        authService = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
        mockGoogleSignIn(authService);
    }

    beforeEach(() => {
        localStorage.clear();

        TestBed.configureTestingModule({
            imports: [getTranslocoTestingModule()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                AuthService,
                KeepAliveService
            ]
        });

        authService = TestBed.inject(AuthService);
        keepAliveService = TestBed.inject(KeepAliveService);
        httpMock = TestBed.inject(HttpTestingController);

        mockGoogleSignIn(authService);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe('Initial Load with Valid Session', () => {
        it('should restore user from localStorage and verify with backend', async () => {
            // Simulate previous session stored in localStorage
            const token = createMockJwt();
            localStorage.setItem('suiviseries_auth_token', token);
            localStorage.setItem('suiviseries_user_data', JSON.stringify(mockUser));

            // Initialize auth (simulates app startup)
            const promise = authService.initializeAuth();

            // User should be loaded from localStorage immediately
            expect(authService.currentUser()).toEqual(mockUser);
            expect(authService.isAuthenticated()).toBe(true);

            // Backend verification should be called
            const req = httpMock.expectOne('/api/init');
            expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
            req.flush({ authenticated: true, user: mockUser });

            await promise;

            // User should remain authenticated after backend verification
            expect(authService.currentUser()).toEqual(mockUser);
            expect(authService.isAuthenticated()).toBe(true);
            expect(authService.initialized()).toBe(true);
        });

        it('should maintain user session even with expired JWT if backend session valid', async () => {
            // Create an expired JWT token
            const expiredToken = createExpiredJwt();
            localStorage.setItem('suiviseries_auth_token', expiredToken);
            localStorage.setItem('suiviseries_user_data', JSON.stringify(mockUser));

            // Initialize auth
            const promise = authService.initializeAuth();

            // User should be loaded from localStorage despite expired JWT
            expect(authService.currentUser()).toEqual(mockUser);

            // Backend should verify the session
            const req = httpMock.expectOne('/api/init');
            req.flush({ authenticated: true, user: mockUser });

            await promise;

            // User should remain authenticated
            expect(authService.currentUser()).toEqual(mockUser);
            expect(authService.isAuthenticated()).toBe(true);
        });
    });

    describe('Session Recovery After Browser Close', () => {
        it('should restore full session after simulated browser restart', async () => {
            // Step 1: User logs in via normal initialization flow
            const loginToken = createMockJwt();
            localStorage.setItem('suiviseries_auth_token', loginToken);
            localStorage.setItem('suiviseries_user_data', JSON.stringify(mockUser));

            const initialInitPromise = authService.initializeAuth();
            const initialReq = httpMock.expectOne('/api/init');
            initialReq.flush({ authenticated: true, user: mockUser });
            await initialInitPromise;

            expect(authService.isAuthenticated()).toBe(true);
            expect(localStorage.getItem('suiviseries_auth_token')).toBe(loginToken);

            // Step 2: Simulate browser close by recreating the service (localStorage is preserved)
            const storedToken = localStorage.getItem('suiviseries_auth_token');

            recreateAuthServiceForBrowserRestart();

            // Step 3: Simulate app restart - initialize auth
            const promise = authService.initializeAuth();

            // User should be restored from localStorage
            expect(authService.currentUser()).not.toBeNull();

            // Backend should verify session
            const req = httpMock.expectOne('/api/init');
            expect(req.request.headers.get('Authorization')).toBe(`Bearer ${storedToken}`);
            req.flush({ authenticated: true, user: mockUser });

            await promise;

            // Session should be fully restored
            expect(authService.currentUser()).toEqual(mockUser);
            expect(authService.isAuthenticated()).toBe(true);
        });
    });

    describe('Invalid Session Handling', () => {
        it('should clear session when backend returns not authenticated', async () => {
            const token = createMockJwt();
            localStorage.setItem('suiviseries_auth_token', token);
            localStorage.setItem('suiviseries_user_data', JSON.stringify(mockUser));

            const promise = authService.initializeAuth();

            // Backend rejects the session
            const req = httpMock.expectOne('/api/init');
            req.flush({ authenticated: false, user: null });

            await promise;

            // All auth data should be cleared
            expect(authService.currentUser()).toBeNull();
            expect(authService.isAuthenticated()).toBe(false);
            expect(localStorage.getItem('suiviseries_auth_token')).toBeNull();
            expect(localStorage.getItem('suiviseries_user_data')).toBeNull();
        });

        it('should handle backend error gracefully', async () => {
            const token = createMockJwt();
            localStorage.setItem('suiviseries_auth_token', token);
            localStorage.setItem('suiviseries_user_data', JSON.stringify(mockUser));

            const promise = authService.initializeAuth();

            // User loaded from storage before backend call
            expect(authService.currentUser()).toEqual(mockUser);

            // Backend fails
            const req = httpMock.expectOne('/api/init');
            req.error(new ProgressEvent('error'));

            await promise;

            // User remains in memory from localStorage
            // This allows offline operation
            expect(authService.currentUser()).toEqual(mockUser);
        });
    });

    describe('Keep-Alive Service', () => {
        it('should have startKeepAlive method', () => {
            expect(typeof keepAliveService.startKeepAlive).toBe('function');
        });

        it('should be configured to run every hour', () => {
            // Access via reflection since KEEP_ALIVE_INTERVAL is private
            const interval = (keepAliveService as unknown as { KEEP_ALIVE_INTERVAL: number })['KEEP_ALIVE_INTERVAL'];
            expect(interval).toBe(60 * 60 * 1000);
        });
    });

    describe('Multi-Day Session', () => {
        it('should handle session that spans multiple days', async () => {
            // Day 1: User logs in
            const token = createMockJwt();
            localStorage.setItem('suiviseries_auth_token', token);
            localStorage.setItem('suiviseries_user_data', JSON.stringify(mockUser));

            // Day 3: User returns (simulate 2 days later)
            const promise = authService.initializeAuth();

            // User should be loaded from storage
            expect(authService.currentUser()).toEqual(mockUser);

            // Backend verifies session is still valid
            const req = httpMock.expectOne('/api/init');
            req.flush({
                authenticated: true,
                user: {
                    ...mockUser,
                    last_login: '2023-01-03' // Updated last login
                }
            });

            await promise;

            // Session continues with updated data
            expect(authService.currentUser()).toBeTruthy();
            expect(authService.currentUser()?.last_login).toBe('2023-01-03');
            expect(authService.isAuthenticated()).toBe(true);
        });
    });
});

function createMockJwt(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        sub: '1',
        exp: Math.floor(Date.now() / 1000) + 3600 // Valid for 1 hour
    }));
    const signature = 'mock-signature';
    return `${header}.${payload}.${signature}`;
}

function createExpiredJwt(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        sub: '1',
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
    }));
    const signature = 'mock-signature';
    return `${header}.${payload}.${signature}`;
}
