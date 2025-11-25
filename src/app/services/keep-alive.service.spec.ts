import { TestBed } from '@angular/core/testing';
import { KeepAliveService } from './keep-alive.service';
import { AuthService } from './auth.service';
import { signal } from '@angular/core';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';

describe('KeepAliveService', () => {
    let service: KeepAliveService;
    let authServiceMock: Partial<AuthService>;

    beforeEach(() => {
        authServiceMock = {
            isAuthenticated: signal(false),
            refreshSession: () => Promise.resolve()
        };

        TestBed.configureTestingModule({
            imports: [getTranslocoTestingModule()],
            providers: [
                KeepAliveService,
                { provide: AuthService, useValue: authServiceMock }
            ]
        });

        service = TestBed.inject(KeepAliveService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have startKeepAlive method', () => {
        expect(typeof service.startKeepAlive).toBe('function');
    });

    it('should call startKeepAlive without error', () => {
        expect(() => service.startKeepAlive()).not.toThrow();
    });
});
