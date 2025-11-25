import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { vi, expect } from 'vitest';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authService: {
        loading: ReturnType<typeof signal<boolean>>;
        currentUser: ReturnType<typeof signal<unknown>>;
        initGoogleSignIn: ReturnType<typeof vi.fn>;
        renderGoogleButton: ReturnType<typeof vi.fn>;
        signInWithGooglePopup: ReturnType<typeof vi.fn>;
    };
    let dialogRef: { close: ReturnType<typeof vi.fn> };
    let router: { navigate: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        authService = {
            loading: signal(false),
            currentUser: signal(null),
            initGoogleSignIn: vi.fn().mockResolvedValue(undefined),
            renderGoogleButton: vi.fn(),
            signInWithGooglePopup: vi.fn()
        };

        dialogRef = {
            close: vi.fn()
        };

        router = {
            navigate: vi.fn()
        };

        TestBed.configureTestingModule({
            imports: [LoginComponent, getTranslocoTestingModule()],
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: MatDialogRef, useValue: dialogRef },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: Router, useValue: router }
            ]
        });

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Template Rendering', () => {
        it('should display title with TV icon', () => {
            fixture.detectChanges();

            const title = fixture.nativeElement.querySelector('h2');
            const icon = title.querySelector('mat-icon');

            expect(title).toBeTruthy();
            expect(icon?.textContent?.trim()).toBe('tv');
        });

        it('should show loading spinner when loading', () => {
            authService.loading.set(true);
            fixture.detectChanges();

            const spinner = fixture.nativeElement.querySelector('mat-spinner');
            const loadingText = fixture.nativeElement.querySelector('.loading-state p');

            expect(spinner).toBeTruthy();
            expect(loadingText).toBeTruthy();
        });

        it('should hide loading spinner when not loading', () => {
            authService.loading.set(false);
            fixture.detectChanges();

            const spinner = fixture.nativeElement.querySelector('mat-spinner');

            expect(spinner).toBeFalsy();
        });

        it('should show Google button container when not loading', () => {
            authService.loading.set(false);
            fixture.detectChanges();

            const buttonContainer = fixture.nativeElement.querySelector('.google-button-container');

            expect(buttonContainer).toBeTruthy();
        });

        it('should hide Google button container when loading', () => {
            authService.loading.set(true);
            fixture.detectChanges();

            const buttonContainer = fixture.nativeElement.querySelector('.google-button-container');

            expect(buttonContainer).toBeFalsy();
        });

        it('should display back button', () => {
            fixture.detectChanges();

            const backButton = fixture.nativeElement.querySelector('mat-dialog-actions button');
            const icon = backButton.querySelector('mat-icon');

            expect(backButton).toBeTruthy();
            expect(icon?.textContent?.trim()).toBe('arrow_back');
        });

        it('should display secure connection hint', () => {
            authService.loading.set(false);
            fixture.detectChanges();

            const hint = fixture.nativeElement.querySelector('.signin-hint');
            const infoIcon = hint.querySelector('mat-icon');

            expect(hint).toBeTruthy();
            expect(infoIcon?.textContent?.trim()).toBe('info');
        });
    });

    describe('Component Lifecycle', () => {
        it('should initialize Google Sign-In on init', () => {
            component.ngOnInit();

            expect(authService.initGoogleSignIn).toHaveBeenCalled();
        });

        it('should render Google button after view init', () => {
            vi.useFakeTimers();
            fixture.detectChanges();

            component.ngAfterViewInit();
            vi.advanceTimersByTime(100);

            expect(authService.renderGoogleButton).toHaveBeenCalled();
        });

        it('should handle Google Sign-In init error gracefully', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
            authService.initGoogleSignIn.mockRejectedValue(new Error('Init failed'));

            component.ngOnInit();
            await vi.waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Failed to initialize Google Sign-In:',
                    expect.any(Error)
                );
            });
        });
    });

    describe('Authentication Flow', () => {
        it('should close dialog when user is authenticated', () => {
            const mockUser = { id: 1, email: 'test@test.com', display_name: 'Test User' };

            fixture.detectChanges();
            authService.currentUser.set(mockUser);
            fixture.detectChanges();

            expect(dialogRef.close).toHaveBeenCalledWith(mockUser);
        });

        it('should navigate to returnUrl when provided and user authenticated', () => {
            const mockUser = { id: 1, email: 'test@test.com', display_name: 'Test User' };
            TestBed.resetTestingModule();

            TestBed.configureTestingModule({
                imports: [LoginComponent, getTranslocoTestingModule()],
                providers: [
                    { provide: AuthService, useValue: authService },
                    { provide: MatDialogRef, useValue: dialogRef },
                    { provide: MAT_DIALOG_DATA, useValue: { returnUrl: '/my-series' } },
                    { provide: Router, useValue: router }
                ]
            });

            fixture = TestBed.createComponent(LoginComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            authService.currentUser.set(mockUser);
            fixture.detectChanges();

            expect(router.navigate).toHaveBeenCalledWith(['/my-series']);
            expect(dialogRef.close).toHaveBeenCalledWith(mockUser);
        });

        it('should not navigate when no returnUrl provided', () => {
            const mockUser = { id: 1, email: 'test@test.com', display_name: 'Test User' };

            fixture.detectChanges();
            authService.currentUser.set(mockUser);
            fixture.detectChanges();

            expect(router.navigate).not.toHaveBeenCalled();
        });
    });

    describe('User Interactions', () => {
        it('should close dialog when back button clicked', () => {
            fixture.detectChanges();

            const backButton = fixture.nativeElement.querySelector('mat-dialog-actions button');
            backButton.click();

            expect(dialogRef.close).toHaveBeenCalled();
        });

        it('should call signInWithGooglePopup when method invoked', () => {
            component.signInWithGoogle();

            expect(authService.signInWithGooglePopup).toHaveBeenCalled();
        });

        it('should close dialog when goHome is called', () => {
            component.goHome();

            expect(dialogRef.close).toHaveBeenCalled();
        });
    });

    describe('Loading State Transitions', () => {
        it('should update UI when loading state changes', () => {
            authService.loading.set(false);
            fixture.detectChanges();

            let spinner = fixture.nativeElement.querySelector('mat-spinner');
            let buttonContainer = fixture.nativeElement.querySelector('.google-button-container');

            expect(spinner).toBeFalsy();
            expect(buttonContainer).toBeTruthy();

            authService.loading.set(true);
            fixture.detectChanges();

            spinner = fixture.nativeElement.querySelector('mat-spinner');
            buttonContainer = fixture.nativeElement.querySelector('.google-button-container');

            expect(spinner).toBeTruthy();
            expect(buttonContainer).toBeFalsy();
        });
    });
});
