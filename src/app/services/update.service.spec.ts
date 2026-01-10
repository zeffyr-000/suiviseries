import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent, VersionInstallationFailedEvent, UnrecoverableStateEvent } from '@angular/service-worker';
import { TranslocoService } from '@jsverse/transloco';
import { Subject } from 'rxjs';
import { UpdateService } from './update.service';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';

describe('UpdateService', () => {
    let service: UpdateService;
    let translocoService: TranslocoService;
    let translateSpy: ReturnType<typeof vi.spyOn>;
    let mockSwUpdate: {
        isEnabled: boolean;
        checkForUpdate: ReturnType<typeof vi.fn>;
        versionUpdates: Subject<VersionReadyEvent | VersionInstallationFailedEvent>;
        unrecoverable: Subject<UnrecoverableStateEvent>;
    };
    let mockAppRef: {
        isStable: Subject<boolean>;
    };
    let originalConfirm: typeof globalThis.confirm;
    let originalLocation: typeof globalThis.location;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
    let consoleInfoSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        mockSwUpdate = {
            isEnabled: true,
            checkForUpdate: vi.fn().mockResolvedValue(false),
            versionUpdates: new Subject<VersionReadyEvent | VersionInstallationFailedEvent>(),
            unrecoverable: new Subject<UnrecoverableStateEvent>()
        };

        mockAppRef = {
            isStable: new Subject<boolean>()
        };

        originalConfirm = globalThis.confirm;
        originalLocation = globalThis.location;
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

        TestBed.configureTestingModule({
            imports: [getTranslocoTestingModule()],
            providers: [
                UpdateService,
                { provide: SwUpdate, useValue: mockSwUpdate },
                { provide: ApplicationRef, useValue: mockAppRef }
            ]
        });

        translocoService = TestBed.inject(TranslocoService);
        translateSpy = vi.spyOn(translocoService, 'translate');

        service = TestBed.inject(UpdateService);
    });

    afterEach(() => {
        globalThis.confirm = originalConfirm;
        (globalThis as { location: typeof originalLocation }).location = originalLocation;
        vi.restoreAllMocks();
    });

    describe('checkForUpdates', () => {
        it('should not check for updates when service worker is disabled', () => {
            mockSwUpdate.isEnabled = false;

            service.checkForUpdates();

            expect(mockSwUpdate.checkForUpdate).not.toHaveBeenCalled();
        });

        it('should check for updates when app becomes stable', async () => {
            service.checkForUpdates();

            mockAppRef.isStable.next(true);

            await vi.waitFor(() => {
                expect(mockSwUpdate.checkForUpdate).toHaveBeenCalled();
            });
        });

        it('should not trigger periodic check when app is not stable', () => {
            service.checkForUpdates();
            // Initial call happens immediately
            mockSwUpdate.checkForUpdate.mockClear();

            mockAppRef.isStable.next(false);

            // Periodic check should not be triggered while app is not stable
            expect(mockSwUpdate.checkForUpdate).not.toHaveBeenCalled();
        });

        it('should handle checkForUpdate errors silently', async () => {
            mockSwUpdate.checkForUpdate.mockRejectedValue(new Error('Update check failed'));

            service.checkForUpdates();
            mockAppRef.isStable.next(true);

            // Should not throw
            await vi.waitFor(() => {
                expect(mockSwUpdate.checkForUpdate).toHaveBeenCalled();
            });
        });

        it('should prompt user when new version is ready', () => {
            const mockConfirm = vi.fn().mockReturnValue(false);
            globalThis.confirm = mockConfirm;

            service.checkForUpdates();

            mockSwUpdate.versionUpdates.next({
                type: 'VERSION_READY',
                currentVersion: { hash: 'v1' },
                latestVersion: { hash: 'v2' }
            } as VersionReadyEvent);

            expect(translateSpy).toHaveBeenCalledWith('app.update.new_version_available');
            expect(mockConfirm).toHaveBeenCalled();
        });

        it('should reload page when user confirms update', () => {
            const mockConfirm = vi.fn().mockReturnValue(true);
            const mockReload = vi.fn();

            globalThis.confirm = mockConfirm;
            (globalThis as { location: { reload: () => void } }).location = {
                reload: mockReload
            };

            service.checkForUpdates();

            mockSwUpdate.versionUpdates.next({
                type: 'VERSION_READY',
                currentVersion: { hash: 'v1' },
                latestVersion: { hash: 'v2' }
            } as VersionReadyEvent);

            expect(mockReload).toHaveBeenCalled();
        });

        it('should not reload page when user cancels update', () => {
            const mockConfirm = vi.fn().mockReturnValue(false);
            const mockReload = vi.fn();

            globalThis.confirm = mockConfirm;
            (globalThis as { location: { reload: () => void } }).location = {
                reload: mockReload
            };

            service.checkForUpdates();

            mockSwUpdate.versionUpdates.next({
                type: 'VERSION_READY',
                currentVersion: { hash: 'v1' },
                latestVersion: { hash: 'v2' }
            } as VersionReadyEvent);

            expect(mockReload).not.toHaveBeenCalled();
        });

        it('should only react to VERSION_READY events', () => {
            const mockConfirm = vi.fn();
            globalThis.confirm = mockConfirm;

            service.checkForUpdates();

            // Emit non-VERSION_READY event
            mockSwUpdate.versionUpdates.next({
                type: 'VERSION_DETECTED'
            } as never);

            expect(mockConfirm).not.toHaveBeenCalled();
        });

        it('should handle multiple version ready events', () => {
            const mockConfirm = vi.fn().mockReturnValue(false);
            globalThis.confirm = mockConfirm;

            service.checkForUpdates();

            mockSwUpdate.versionUpdates.next({
                type: 'VERSION_READY',
                currentVersion: { hash: 'v1' },
                latestVersion: { hash: 'v2' }
            } as VersionReadyEvent);

            mockSwUpdate.versionUpdates.next({
                type: 'VERSION_READY',
                currentVersion: { hash: 'v2' },
                latestVersion: { hash: 'v3' }
            } as VersionReadyEvent);

            expect(mockConfirm).toHaveBeenCalledTimes(2);
        });

        it('should log update available when checkForUpdate returns true', async () => {
            mockSwUpdate.checkForUpdate.mockResolvedValue(true);

            service.checkForUpdates();
            mockAppRef.isStable.next(true);

            await vi.waitFor(() => {
                expect(consoleInfoSpy).toHaveBeenCalledWith('[UpdateService] Update available');
            });
        });

        it('should log error when version installation fails', () => {
            service.checkForUpdates();

            mockSwUpdate.versionUpdates.next({
                type: 'VERSION_INSTALLATION_FAILED',
                version: { hash: 'v2' },
                error: 'Installation failed'
            } as VersionInstallationFailedEvent);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[UpdateService] Version installation failed:',
                'Installation failed'
            );
        });

        it('should prompt user when unrecoverable state is detected', () => {
            const mockConfirm = vi.fn().mockReturnValue(false);
            globalThis.confirm = mockConfirm;

            service.checkForUpdates();

            mockSwUpdate.unrecoverable.next({
                type: 'UNRECOVERABLE_STATE',
                reason: 'Hash mismatch'
            } as UnrecoverableStateEvent);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[UpdateService] Unrecoverable state:',
                'Hash mismatch'
            );
            expect(translateSpy).toHaveBeenCalledWith('app.update.unrecoverable_state');
            expect(mockConfirm).toHaveBeenCalled();
        });

        it('should reload page when user confirms unrecoverable state', () => {
            const mockConfirm = vi.fn().mockReturnValue(true);
            const mockReload = vi.fn();

            globalThis.confirm = mockConfirm;
            (globalThis as { location: { reload: () => void } }).location = {
                reload: mockReload
            };

            service.checkForUpdates();

            mockSwUpdate.unrecoverable.next({
                type: 'UNRECOVERABLE_STATE',
                reason: 'Hash mismatch'
            } as UnrecoverableStateEvent);

            expect(mockReload).toHaveBeenCalled();
        });

        it('should log error when initial update check fails', async () => {
            mockSwUpdate.checkForUpdate.mockRejectedValue(new Error('Network error'));

            service.checkForUpdates();

            await vi.waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    '[UpdateService] Initial update check failed:',
                    expect.any(Error)
                );
            });
        });
    });
});
