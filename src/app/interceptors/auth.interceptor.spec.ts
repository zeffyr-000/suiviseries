import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
    let httpMock: HttpTestingController;
    let httpClient: HttpClient;
    let mockAuthService: { getStoredToken: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        mockAuthService = {
            getStoredToken: vi.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([authInterceptor])),
                provideHttpClientTesting(),
                { provide: AuthService, useValue: mockAuthService }
            ]
        });

        httpMock = TestBed.inject(HttpTestingController);
        httpClient = TestBed.inject(HttpClient);
    });

    it('should add Authorization header when token exists', () => {
        mockAuthService.getStoredToken.mockReturnValue('test-token-123');

        httpClient.get('/api/series').subscribe();

        const req = httpMock.expectOne('/api/series');
        expect(req.request.headers.has('Authorization')).toBe(true);
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');

        req.flush({});
    });

    it('should not add Authorization header when token is null', () => {
        mockAuthService.getStoredToken.mockReturnValue(null);

        httpClient.get('/api/series').subscribe();

        const req = httpMock.expectOne('/api/series');
        expect(req.request.headers.has('Authorization')).toBe(false);

        req.flush({});
    });

    it('should not add Authorization header when token is undefined', () => {
        mockAuthService.getStoredToken.mockReturnValue(undefined);

        httpClient.get('/api/series').subscribe();

        const req = httpMock.expectOne('/api/series');
        expect(req.request.headers.has('Authorization')).toBe(false);

        req.flush({});
    });

    it('should not override existing Authorization header', () => {
        mockAuthService.getStoredToken.mockReturnValue('test-token-123');

        httpClient.get('/api/series', {
            headers: { Authorization: 'Bearer custom-token' }
        }).subscribe();

        const req = httpMock.expectOne('/api/series');
        expect(req.request.headers.get('Authorization')).toBe('Bearer custom-token');

        req.flush({});
    });

    it('should add token to POST requests', () => {
        mockAuthService.getStoredToken.mockReturnValue('test-token-456');

        httpClient.post('/api/series', { name: 'Test' }).subscribe();

        const req = httpMock.expectOne('/api/series');
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-456');
        expect(req.request.method).toBe('POST');

        req.flush({});
    });

    it('should add token to PUT requests', () => {
        mockAuthService.getStoredToken.mockReturnValue('test-token-789');

        httpClient.put('/api/series/1', { watched: true }).subscribe();

        const req = httpMock.expectOne('/api/series/1');
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-789');
        expect(req.request.method).toBe('PUT');

        req.flush({});
    });

    it('should add token to DELETE requests', () => {
        mockAuthService.getStoredToken.mockReturnValue('test-token-delete');

        httpClient.delete('/api/series/1').subscribe();

        const req = httpMock.expectOne('/api/series/1');
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-delete');
        expect(req.request.method).toBe('DELETE');

        req.flush({});
    });

    it('should preserve other headers when adding Authorization', () => {
        mockAuthService.getStoredToken.mockReturnValue('test-token-123');

        httpClient.get('/api/series', {
            headers: {
                'Content-Type': 'application/json',
                'X-Custom-Header': 'custom-value'
            }
        }).subscribe();

        const req = httpMock.expectOne('/api/series');
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
        expect(req.request.headers.get('Content-Type')).toBe('application/json');
        expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');

        req.flush({});
    });

    it('should handle empty string token as falsy', () => {
        mockAuthService.getStoredToken.mockReturnValue('');

        httpClient.get('/api/series').subscribe();

        const req = httpMock.expectOne('/api/series');
        expect(req.request.headers.has('Authorization')).toBe(false);

        req.flush({});
    });

    it('should work with multiple concurrent requests', () => {
        mockAuthService.getStoredToken.mockReturnValue('test-token-concurrent');

        httpClient.get('/api/series/1').subscribe();
        httpClient.get('/api/series/2').subscribe();
        httpClient.post('/api/series/3/follow', {}).subscribe();

        const req1 = httpMock.expectOne('/api/series/1');
        const req2 = httpMock.expectOne('/api/series/2');
        const req3 = httpMock.expectOne('/api/series/3/follow');

        expect(req1.request.headers.get('Authorization')).toBe('Bearer test-token-concurrent');
        expect(req2.request.headers.get('Authorization')).toBe('Bearer test-token-concurrent');
        expect(req3.request.headers.get('Authorization')).toBe('Bearer test-token-concurrent');

        req1.flush({});
        req2.flush({});
        req3.flush({});
    });
});
