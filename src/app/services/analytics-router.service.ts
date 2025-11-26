import { Injectable, inject, DestroyRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MetadataService } from './metadata.service';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsRouterService {
    private readonly router = inject(Router);
    private readonly metadataService = inject(MetadataService);
    private readonly destroyRef = inject(DestroyRef);
    private isInitialized = false;

    initialize(): void {
        if (this.isInitialized) {
            return;
        }
        this.isInitialized = true;

        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => {
            try {
                this.metadataService.trackCurrentPage();
            } catch (error) {
                // Log navigation tracking errors for debugging and monitoring
                console.error('Error tracking page navigation:', error);
            }
        });
    }
}