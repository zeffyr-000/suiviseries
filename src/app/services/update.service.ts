import { Injectable, inject, ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent, VersionInstallationFailedEvent } from '@angular/service-worker';
import { TranslocoService } from '@jsverse/transloco';
import { filter, interval, concat, first } from 'rxjs';

/**
 * Service responsible for detecting and handling Service Worker updates.
 *
 * This service:
 * - Checks for updates on first load and every 6 hours
 * - Notifies users when a new version is ready (VERSION_READY)
 * - Logs installation failures (VERSION_INSTALLATION_FAILED)
 * - Handles unrecoverable states by prompting a reload
 *
 * IMPORTANT: All SwUpdate events must be handled to prevent the app from
 * getting stuck in a broken state. See docs/SERVICE_WORKER.md for details.
 */
@Injectable({
    providedIn: 'root'
})
export class UpdateService {
    private readonly swUpdate = inject(SwUpdate);
    private readonly appRef = inject(ApplicationRef);
    private readonly transloco = inject(TranslocoService);

    checkForUpdates(): void {
        if (!this.swUpdate.isEnabled) {
            return;
        }

        // Force Service Worker update on first load
        this.swUpdate.checkForUpdate().catch((err) => {
            console.error('[UpdateService] Initial update check failed:', err);
        });

        // Check for updates every 6 hours once app is stable
        const appIsStable$ = this.appRef.isStable.pipe(
            filter(isStable => isStable),
            first()
        );
        const everySixHours$ = interval(6 * 60 * 60 * 1000);
        const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

        everySixHoursOnceAppIsStable$.subscribe(async () => {
            try {
                const updateFound = await this.swUpdate.checkForUpdate();
                if (updateFound) {
                    console.info('[UpdateService] Update available');
                }
            } catch (err) {
                console.error('[UpdateService] Update check failed:', err);
            }
        });

        // Notify when a new version is ready
        this.swUpdate.versionUpdates
            .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
            .subscribe(() => {
                if (confirm(this.transloco.translate('app.update.new_version_available'))) {
                    globalThis.location.reload();
                }
            });

        // Handle installation failures
        this.swUpdate.versionUpdates
            .pipe(filter((evt): evt is VersionInstallationFailedEvent => evt.type === 'VERSION_INSTALLATION_FAILED'))
            .subscribe((evt) => {
                console.error('[UpdateService] Version installation failed:', evt.error);
            });

        // Handle unrecoverable state - force reload to get fresh version
        this.swUpdate.unrecoverable.subscribe((evt) => {
            console.error('[UpdateService] Unrecoverable state:', evt.reason);
            if (confirm(this.transloco.translate('app.update.unrecoverable_state'))) {
                globalThis.location.reload();
            }
        });
    }
}
