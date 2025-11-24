import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly transloco = inject(TranslocoService);
    private readonly snackBar = inject(MatSnackBar);

    show(messageKey: string, type: 'error' | 'success' | 'warning' | 'info' = 'info', duration = 5000, params?: Record<string, unknown>): void {
        const message = this.transloco.translate(messageKey, params);
        const config: MatSnackBarConfig = {
            duration,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: [`snackbar-${type}`]
        };

        this.snackBar.open(message, undefined, config);
    }

    error(messageKey: string, duration = 5000, params?: Record<string, unknown>): void {
        this.show(messageKey, 'error', duration, params);
    }

    success(messageKey: string, duration = 3000, params?: Record<string, unknown>): void {
        this.show(messageKey, 'success', duration, params);
    }

    warning(messageKey: string, duration = 4000, params?: Record<string, unknown>): void {
        this.show(messageKey, 'warning', duration, params);
    }

    info(messageKey: string, duration = 5000, params?: Record<string, unknown>): void {
        this.show(messageKey, 'info', duration, params);
    }

    dismiss(): void {
        this.snackBar.dismiss();
    }

    clear(): void {
        this.snackBar.dismiss();
    }
}
