import { Component, OnInit, signal, inject, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { SeriesService } from '../services/series.service';
import { MetadataService } from '../services/metadata.service';
import { Serie } from '../models/serie.model';
import { SerieCardComponent } from '../shared/serie-card/serie-card.component';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-my-series',
    imports: [
        TranslocoModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        SerieCardComponent
    ],
    templateUrl: './my-series.component.html',
    styleUrl: './my-series.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MySeriesComponent implements OnInit {
    private readonly seriesService = inject(SeriesService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);
    private readonly metadataService = inject(MetadataService);
    private readonly translocoService = inject(TranslocoService);

    protected mySeries = signal<Serie[]>([]);
    protected loading = signal<boolean>(true);
    protected error = signal<string | null>(null);

    ngOnInit(): void {
        this.updateMetadata();
        this.loadMySeries();
    }

    private updateMetadata(): void {
        this.metadataService.updatePageMetadata({
            title: this.translocoService.translate('seo.my_series.title'),
            description: this.translocoService.translate('seo.my_series.description'),
            canonicalUrl: `${environment.siteUrl}/my-series`
        });
    }

    private loadMySeries(): void {
        this.loading.set(true);
        this.error.set(null);

        this.seriesService.getUserSeries().pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (series: Serie[]) => {
                this.mySeries.set(series);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    protected onRefresh(): void {
        this.loadMySeries();
    }

    protected goToSearch(): void {
        this.router.navigate(['/search']);
    }
}