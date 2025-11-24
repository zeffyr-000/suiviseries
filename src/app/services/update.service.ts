import { Injectable, inject, ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, interval, concat } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UpdateService {
    private readonly swUpdate = inject(SwUpdate);
    private readonly appRef = inject(ApplicationRef);

    checkForUpdates(): void {
        if (!this.swUpdate.isEnabled) {
            return;
        }

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
                if (confirm('New version available. Reload now?')) {
                    globalThis.location.reload();
                }
            });
    }
}
