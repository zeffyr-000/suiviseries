import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { UpdateService } from './update.service';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';

describe('UpdateService', () => {
    let service: UpdateService;
    let mockSwUpdate: {
        isEnabled: boolean;
        checkForUpdate: ReturnType<typeof vi.fn>;
        versionUpdates: Subject<VersionReadyEvent>;
    };
    let mockAppRef: {
        isStable: Subject<boolean>;
    };
    let originalConfirm: typeof globalThis.confirm;
    let originalLocation: typeof globalThis.location;

    beforeEach(() => {
        mockSwUpdate = {
            isEnabled: true,
            checkForUpdate: vi.fn().mockResolvedValue(undefined),
            versionUpdates: new Subject<VersionReadyEvent>()
        };

        mockAppRef = {
            isStable: new Subject<boolean>()
        };

        originalConfirm = globalThis.confirm;
        originalLocation = globalThis.location;

        TestBed.configureTestingModule({
            imports: [getTranslocoTestingModule()],
            providers: [
                UpdateService,
                { provide: SwUpdate, useValue: mockSwUpdate },
                { provide: ApplicationRef, useValue: mockAppRef }
            ]
        });

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

        it('should not check for updates when app is not stable', () => {
            service.checkForUpdates();

            mockAppRef.isStable.next(false);

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

            expect(mockConfirm).toHaveBeenCalledWith('Une nouvelle version est disponible. Recharger maintenant ?');
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
    });
});
