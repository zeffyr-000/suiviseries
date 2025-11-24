import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from './auth.service';
import { interval, from } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class KeepAliveService {
    private readonly authService = inject(AuthService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly KEEP_ALIVE_INTERVAL = 60 * 60 * 1000;

    startKeepAlive(): void {
        interval(this.KEEP_ALIVE_INTERVAL)
            .pipe(
                filter(() => this.authService.isAuthenticated()),
                switchMap(() => from(this.authService.refreshSession())),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }
}
