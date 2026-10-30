import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { SeriesService } from '../services/series.service';
import { MetadataService } from '../services/metadata.service';
import { Serie, SerieStatus } from '../models/serie.model';
import { SerieCardComponent } from '../shared/serie-card/serie-card.component';
import { StatRingComponent } from '../shared/stat-ring/stat-ring.component';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-my-series',
    imports: [
        RouterModule,
        TranslocoModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        SerieCardComponent,
        StatRingComponent,
    ],
    templateUrl: './my-series.component.html',
    styleUrl: './my-series.component.scss',
})
export class MySeriesComponent implements OnInit {
    private readonly seriesService = inject(SeriesService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly metadataService = inject(MetadataService);
    private readonly translocoService = inject(TranslocoService);

    protected readonly mySeries = signal<Serie[]>([]);
    protected readonly loading = signal<boolean>(true);

    // Everything below is derived from fields the collection endpoint always
    // returns. Runtime and follower counts would make richer tiles, but the
    // payload does not carry them, so they are not shown rather than guessed.
    protected readonly totalSeasons = computed(() =>
        this.mySeries().reduce((total, serie) => total + (serie.number_of_seasons || 0), 0),
    );

    protected readonly totalEpisodes = computed(() =>
        this.mySeries().reduce((total, serie) => total + (serie.number_of_episodes || 0), 0),
    );

    protected readonly airingCount = computed(
        () => this.mySeries().filter((serie) => serie.status === SerieStatus.RETURNING).length,
    );

    // Watched progress is only shown when the payload actually carries it, so
    // the tile never reports a confident zero for data that is simply absent.
    protected readonly hasWatchedData = computed(() =>
        this.mySeries().some((serie) => !!serie.user_data),
    );

    protected readonly watchedEpisodes = computed(() =>
        this.mySeries().reduce(
            (total, serie) => total + (serie.user_data?.watched_episodes?.length || 0),
            0,
        ),
    );

    protected readonly watchedRatio = computed(() => {
        const total = this.totalEpisodes();
        return total > 0 ? this.watchedEpisodes() / total : 0;
    });

    protected readonly watchedPercent = computed(() => Math.round(this.watchedRatio() * 100));

    ngOnInit(): void {
        this.updateMetadata();
        this.loadMySeries();
    }

    private updateMetadata(): void {
        this.metadataService.updatePageMetadata({
            title: this.translocoService.translate('seo.my_series.title'),
            description: this.translocoService.translate('seo.my_series.description'),
            canonicalUrl: `${environment.siteUrl}/mes-series`,
        });
    }

    // getUserSeries notifies the user and resolves to an empty list on failure,
    // so there is no error state to render. The error callback only guarantees
    // the spinner cannot hang if that contract is ever broken.
    private loadMySeries(): void {
        this.loading.set(true);

        this.seriesService
            .getUserSeries(true)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (series) => {
                    this.mySeries.set(series);
                    this.loading.set(false);
                },
                error: (err: unknown) => {
                    console.error('Error loading user series:', err);
                    this.loading.set(false);
                },
            });
    }
}
