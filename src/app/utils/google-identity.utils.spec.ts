import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isGoogleLibraryLoaded, waitForGoogleLibrary } from './google-identity.utils';

const createGoogleMock = () => ({
    google: {
        accounts: {
            id: {
                initialize: vi.fn(),
                prompt: vi.fn(),
                renderButton: vi.fn(),
                disableAutoSelect: vi.fn(),
                storeCredential: vi.fn(),
                cancel: vi.fn(),
                onGoogleLibraryLoad: vi.fn(),
                revoke: vi.fn()
            }
        }
    }
});

describe('google-identity.utils', () => {
    let originalWindow: typeof globalThis.window;

    beforeEach(() => {
        originalWindow = globalThis.window;
    });

    afterEach(() => {
        (globalThis as { window: typeof globalThis.window }).window = originalWindow;
        vi.clearAllTimers();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    describe('isGoogleLibraryLoaded', () => {
        it('should return false when window is undefined', () => {
            (globalThis as { window?: unknown }).window = undefined;
            expect(isGoogleLibraryLoaded()).toBe(false);
        });

        it('should return false when google is undefined', () => {
            (globalThis as { window: unknown }).window = {} as Window;
            expect(isGoogleLibraryLoaded()).toBe(false);
        });

        it('should return false when google.accounts is undefined', () => {
            (globalThis as { window: unknown }).window = {
                google: {}
            } as unknown as Window;
            expect(isGoogleLibraryLoaded()).toBe(false);
        });

        it('should return false when google.accounts.id is undefined', () => {
            (globalThis as { window: unknown }).window = {
                google: {
                    accounts: {}
                }
            } as unknown as Window;
            expect(isGoogleLibraryLoaded()).toBe(false);
        });

        it('should return true when google.accounts.id is defined', () => {
            (globalThis as { window: unknown }).window = createGoogleMock() as unknown as Window;
            expect(isGoogleLibraryLoaded()).toBe(true);
        });
    });

    describe('waitForGoogleLibrary', () => {
        it('should resolve immediately when library is already loaded', async () => {
            (globalThis as { window: unknown }).window = createGoogleMock() as unknown as Window;

            await expect(waitForGoogleLibrary(1000)).resolves.toBeUndefined();
        });

        it('should reject after timeout when library does not load', async () => {
            vi.useFakeTimers();
            (globalThis as { window: unknown }).window = {} as unknown as Window;

            const promise = waitForGoogleLibrary(100);

            // Wait for the rejection to be properly caught
            const result = promise.catch(error => error);

            await vi.advanceTimersByTimeAsync(150);

            const error = await result;
            expect(error.message).toBe('Google Identity Services library failed to load');
        });

        it('should resolve when library loads during wait', async () => {
            vi.useFakeTimers();
            (globalThis as { window: unknown }).window = {} as unknown as Window;

            const promise = waitForGoogleLibrary(500);

            await vi.advanceTimersByTimeAsync(50);
            (globalThis as { window: unknown }).window = createGoogleMock() as unknown as Window;

            await vi.advanceTimersByTimeAsync(100);

            await expect(promise).resolves.toBeUndefined();
        });
    });
});
