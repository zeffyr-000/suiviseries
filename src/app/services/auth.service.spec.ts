import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { User, UserStatus } from '../models/user.model';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';

describe('AuthService', () => {
    let service: AuthService;
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

    beforeEach(() => {
        localStorage.clear();

        TestBed.configureTestingModule({
            imports: [getTranslocoTestingModule()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                AuthService
            ]
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);

        // Mock waitAndConfigureGoogleSignIn to avoid timeout
        vi.spyOn(service as unknown as { waitAndConfigureGoogleSignIn: () => Promise<void> }, 'waitAndConfigureGoogleSignIn').mockResolvedValue(undefined);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initial state', () => {
        it('should have null currentUser initially', () => {
            expect(service.currentUser()).toBeNull();
        });

        it('should have loading false initially', () => {
            expect(service.loading()).toBe(false);
        });

        it('should have initialized false initially', () => {
            expect(service.initialized()).toBe(false);
        });

        it('should not be authenticated initially', () => {
            expect(service.isAuthenticated()).toBe(false);
        });
    });

    describe('computed signals', () => {
        it('should return default display name when no user', () => {
            expect(service.userDisplayName()).toBe('Utilisateur');
        });

        it('should return empty photo url when no user', () => {
            expect(service.userPhotoUrl()).toBe('');
        });
    });

    describe('isUserAuthenticated', () => {
        it('should return false when not authenticated', () => {
            expect(service.isUserAuthenticated()).toBe(false);
        });
    });

    describe('getStoredToken', () => {
        it('should return null when no token stored', () => {
            expect(service.getStoredToken()).toBeNull();
        });

        it('should return token when stored', () => {
            localStorage.setItem('suiviseries_auth_token', 'test-token');
            expect(service.getStoredToken()).toBe('test-token');
        });
    });

    describe('refreshSession', () => {
        it('should set user when authenticated', async () => {
            const promise = service.refreshSession();

            const req = httpMock.expectOne('/api/init');
            expect(req.request.method).toBe('GET');
            req.flush({ authenticated: true, user: mockUser });

            await promise;

            expect(service.currentUser()).toEqual(mockUser);
            expect(service.isAuthenticated()).toBe(true);
        });

        it('should clear auth data when not authenticated', async () => {
            localStorage.setItem('suiviseries_auth_token', 'old-token');

            const promise = service.refreshSession();

            const req = httpMock.expectOne('/api/init');
            req.flush({ authenticated: false, user: null });

            await promise;

            expect(service.currentUser()).toBeNull();
            expect(localStorage.getItem('suiviseries_auth_token')).toBeNull();
        });

        it('should send Authorization header when token exists', async () => {
            localStorage.setItem('suiviseries_auth_token', 'my-token');

            const promise = service.refreshSession();

            const req = httpMock.expectOne('/api/init');
            expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
            req.flush({ authenticated: false, user: null });

            await promise;
        });
    });

    describe('initializeAuth', () => {
        it('should set initialized to true after completion', async () => {
            const promise = service.initializeAuth();

            const req = httpMock.expectOne('/api/init');
            req.flush({ authenticated: false, user: null });

            await promise;

            expect(service.initialized()).toBe(true);
            expect(service.loading()).toBe(false);
        }, 10000);

        it('should load from storage on API error', async () => {
            const token = createMockJwt();
            localStorage.setItem('suiviseries_auth_token', token);
            localStorage.setItem('suiviseries_user_data', JSON.stringify(mockUser));

            const promise = service.initializeAuth();

            const req = httpMock.expectOne('/api/init');
            req.error(new ProgressEvent('error'));

            await promise;

            expect(service.currentUser()).toEqual(mockUser);
        }, 10000);
    });

    describe('logout', () => {
        it('should clear user and storage', async () => {
            localStorage.setItem('suiviseries_auth_token', 'test-token');
            localStorage.setItem('suiviseries_user_data', '{}');

            const promise = service.logout();

            const req = httpMock.expectOne('/api/logout');
            req.flush({});

            await promise;

            expect(service.currentUser()).toBeNull();
            expect(localStorage.getItem('suiviseries_auth_token')).toBeNull();
            expect(localStorage.getItem('suiviseries_user_data')).toBeNull();
        });

        it('should handle logout without token', async () => {
            await service.logout();

            httpMock.expectNone('/api/logout');
            expect(service.currentUser()).toBeNull();
        });
    });
});

function createMockJwt(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        sub: '1',
        exp: Math.floor(Date.now() / 1000) + 3600
    }));
    const signature = 'mock-signature';
    return `${header}.${payload}.${signature}`;
}
