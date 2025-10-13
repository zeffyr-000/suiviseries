import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, firstValueFrom, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, AuthResponse, AuthRequest, TokenPayload, InitResponse } from '../models/user.model';
import {
    GoogleIdConfiguration,
    CredentialResponse,
    GsiButtonConfiguration,
    waitForGoogleLibrary,
    isGoogleLibraryLoaded
} from '../types/google-identity.types';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;
    private readonly storageKey = 'suiviseries_auth_token';
    private readonly userStorageKey = 'suiviseries_user_data';

    private readonly _currentUser = signal<User | null>(null);
    private readonly _loading = signal<boolean>(false);
    private readonly _initialized = signal<boolean>(false);

    public readonly currentUser = this._currentUser.asReadonly();
    public readonly loading = this._loading.asReadonly();
    public readonly initialized = this._initialized.asReadonly();

    public readonly isAuthenticated = computed(() => {
        const user = this._currentUser();
        return user !== null;
    });

    public readonly userDisplayName = computed(() => {
        const user = this._currentUser();
        return user?.display_name || 'Utilisateur';
    });

    public readonly userPhotoUrl = computed(() => {
        const user = this._currentUser();
        return user?.photo_url || '';
    });

    private setStorageItem(key: string, value: string): void {
        localStorage.setItem(key, value);
    }

    private getStorageItem(key: string): string | null {
        return localStorage.getItem(key);
    }

    private removeStorageItem(key: string): void {
        localStorage.removeItem(key);
    }

    constructor() {
        this.initializeAuth();
    }

    private async initializeAuth(): Promise<void> {
        this._loading.set(true);

        try {
            await this.initializeApp();
            await this.waitAndConfigureGoogleSignIn();
        } finally {
            this._loading.set(false);
            this._initialized.set(true);
        }
    }

    private async initializeApp(): Promise<void> {
        const token = this.getStorageItem(this.storageKey);
        const headers: Record<string, string> = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await firstValueFrom(
                this.http.get<InitResponse>(`${this.apiUrl}/init`, { headers }).pipe(
                    catchError(error => {
                        throw error;
                    })
                )
            );

            if (response.authenticated && response.user) {
                this._currentUser.set(response.user);
                this.updateStoredUserData(response.user);
            } else {
                this.clearAuthData();
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            this.loadUserFromStorage();
        }
    }

    private updateStoredUserData(user: User): void {
        this.setStorageItem(this.userStorageKey, JSON.stringify(user));
    }

    private clearAuthData(): void {
        this._currentUser.set(null);
        this.removeStorageItem(this.storageKey);
        this.removeStorageItem(this.userStorageKey);
    }

    private clearAuthCookies(): void {
        const cookiesToClear = [
            'PHPSESSID',
            'session_id',
            'auth_token',
            'suiviseries_session',
            'connect.sid'
        ];

        cookiesToClear.forEach(cookieName => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            if (window.location.hostname.includes('.')) {
                const parentDomain = window.location.hostname.substring(window.location.hostname.indexOf('.'));
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${parentDomain};`;
            }
        });
    }

    private async waitAndConfigureGoogleSignIn(): Promise<void> {
        try {
            await waitForGoogleLibrary();
            this.configureGoogleSignIn();
        } catch { /* empty */ }
    }

    async initGoogleSignIn(): Promise<void> {
        return this.waitAndConfigureGoogleSignIn();
    }

    private configureGoogleSignIn(): void {
        if (!window.google?.accounts?.id) {
            return;
        }

        const config: GoogleIdConfiguration = {
            client_id: environment.googleClientId,
            callback: (response: CredentialResponse) => this.handleGoogleResponse(response),
            auto_select: false,
            cancel_on_tap_outside: true
        };

        try {
            window.google.accounts.id.initialize(config);
        } catch { /* empty */ }
    }

    renderGoogleButton(element: HTMLElement): void {
        if (!isGoogleLibraryLoaded()) {
            return;
        }

        const buttonConfig: GsiButtonConfiguration = {
            theme: 'outline',
            size: 'large',
            width: 250,
            text: 'signin_with',
            locale: 'fr'
        };

        try {
            window.google!.accounts.id.renderButton(element, buttonConfig);
        } catch { /* empty */ }
    }

    signInWithGooglePopup(): void {
        if (!isGoogleLibraryLoaded()) {
            return;
        }

        window.google!.accounts.id.prompt();
    }

    private handleGoogleResponse(response: CredentialResponse): void {
        if (!response.credential) {
            return;
        }

        this.processGoogleCredential(response.credential);
    }

    private processGoogleCredential(credential: string): void {
        this._loading.set(true);
        const authRequest: AuthRequest = {
            credential: credential
        };

        this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, authRequest).pipe(
            tap(response => {
                this.setAuthenticatedUser(response.user, response.token);
            }),
            catchError(error => {
                this._loading.set(false);
                return throwError(() => error);
            })
        ).subscribe();
    }

    private setAuthenticatedUser(user: User, token?: string): void {
        this._currentUser.set(user);
        if (token) {
            this.setStorageItem(this.storageKey, token);
        }
        this.setStorageItem(this.userStorageKey, JSON.stringify(user));
        this._loading.set(false);
    }

    private loadUserFromStorage(): void {
        const token = this.getStorageItem(this.storageKey);
        const userData = this.getStorageItem(this.userStorageKey);

        if (!token || !userData) {
            return;
        }

        try {
            const user: User = JSON.parse(userData);
            this._currentUser.set(user);

            const payload = this.parseJwt(token);
            if (!this.isTokenValid(payload)) {
                this.clearAuthData();
            }
        } catch {
            this.clearAuthData();
        }
    }

    private parseJwt(token: string): TokenPayload {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }

    private isTokenValid(payload: TokenPayload): boolean {
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
    }

    async logout(): Promise<void> {
        const token = this.getStorageItem(this.storageKey);
        this._currentUser.set(null);
        this.removeStorageItem(this.storageKey);
        this.removeStorageItem(this.userStorageKey);

        this.clearAuthCookies();

        if (token) {
            try {
                await firstValueFrom(
                    this.http.post(`${this.apiUrl}/logout`, {}, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }).pipe(
                        catchError(() => {
                            return of(null);
                        })
                    )
                );
            } catch { /* empty */ }
        }

        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
    }

    isUserAuthenticated(): boolean {
        return this.isAuthenticated();
    }

    getStoredToken(): string | null {
        return this.getStorageItem(this.storageKey);
    }
}