import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MetadataService } from './metadata.service';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsRouterService {
    private readonly router = inject(Router);
    private readonly metadataService = inject(MetadataService);

    initialize(): void {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            this.metadataService.trackCurrentPage();
        });
    }
}