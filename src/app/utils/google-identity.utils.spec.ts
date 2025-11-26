import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isGoogleLibraryLoaded, waitForGoogleLibrary } from './google-identity.utils';

describe('google-identity.utils', () => {
    let originalWindow: typeof globalThis.window;

    beforeEach(() => {
        originalWindow = globalThis.window;
    });

    afterEach(() => {
        if (originalWindow) {
            (globalThis as { window: typeof globalThis.window }).window = originalWindow;
        }
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
            (globalThis as { window: unknown }).window = {
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
            } as unknown as Window;
            expect(isGoogleLibraryLoaded()).toBe(true);
        });
    });

    describe('waitForGoogleLibrary', () => {
        it('should resolve immediately when library is already loaded', async () => {
            (globalThis as { window: unknown }).window = {
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
            } as unknown as Window;

            await expect(waitForGoogleLibrary(1000)).resolves.toBeUndefined();
        });

        it('should reject after timeout when library does not load', async () => {
            (globalThis as { window: unknown }).window = {} as unknown as Window;

            await expect(waitForGoogleLibrary(100)).rejects.toThrow('Google Identity Services library failed to load');
        });

        it('should resolve when library loads during wait', async () => {
            vi.useFakeTimers();
            (globalThis as { window: unknown }).window = {} as unknown as Window;

            const promise = waitForGoogleLibrary(500);

            // Set up library to load after 50ms
            await vi.advanceTimersByTimeAsync(50);
            (globalThis as { window: unknown }).window = {
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
            } as unknown as Window;

            // Advance timers to trigger the next setInterval check
            await vi.advanceTimersByTimeAsync(100);

            await expect(promise).resolves.toBeUndefined();
            vi.useRealTimers();
        });
    });
});
