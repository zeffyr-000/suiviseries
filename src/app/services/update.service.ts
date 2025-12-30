import { Injectable, inject, ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { TranslocoService } from '@jsverse/transloco';
import { filter, interval, concat } from 'rxjs';

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
        this.swUpdate.checkForUpdate().catch(() => { /* ignore errors */ });

        // Check for updates every 6 hours
        const appIsStable$ = this.appRef.isStable.pipe(
            filter(isStable => isStable)
        );
        const everySixHours$ = interval(6 * 60 * 60 * 1000);
        const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

        everySixHoursOnceAppIsStable$.subscribe(async () => {
            try {
                await this.swUpdate.checkForUpdate();
            } catch { /* empty */ }
        });

        // Notify when a new version is ready
        this.swUpdate.versionUpdates
            .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
            .subscribe(() => {
                if (confirm(this.transloco.translate('app.update.new_version_available'))) {
                    globalThis.location.reload();
                }
            });
    }
}
