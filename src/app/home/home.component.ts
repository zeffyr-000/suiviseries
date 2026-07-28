import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { SeriesService } from '../services/series.service';
import { AuthService } from '../services/auth.service';
import { MetadataService } from '../services/metadata.service';
import { Serie, getTmdbImageUrl } from '../models/serie.model';
import { LoginComponent } from '../login/login.component';
import { SectionHeaderComponent } from '../shared/section-header/section-header.component';
import { HomeHeroComponent } from './home-hero/home-hero.component';
import { FeaturedSerieComponent } from './featured-serie/featured-serie.component';
import { SerieRailComponent } from './serie-rail/serie-rail.component';
import { HomeValuePropsComponent } from './home-value-props/home-value-props.component';
import { RankedSeriesComponent } from './ranked-series/ranked-series.component';
import { environment } from '../../environments/environment';

// A serie needs at least this TMDB rating to headline the page. The cut sits
// just under the "well regarded" band and, on a typical day, removes only the
// daily news and late-night shows from the pool.
const FEATURE_RATING_FLOOR = 7.5;

const DAY_IN_MS = 86_400_000;

// Whole days elapsed since the epoch, in local time so the rotation turns over
// at the reader's midnight rather than UTC's.
function currentDayIndex(): number {
    const now = new Date();
    return Math.floor(
        new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / DAY_IN_MS,
    );
}

@Component({
    selector: 'app-home',
    imports: [
        TranslocoModule,
        RouterModule,
        MatButtonModule,
        MatIconModule,
        SectionHeaderComponent,
        HomeHeroComponent,
        FeaturedSerieComponent,
        SerieRailComponent,
        HomeValuePropsComponent,
        RankedSeriesComponent,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
    // Placeholder slots rendered while the first page loads.
    protected readonly skeletonSlots = [1, 2, 3, 4, 5, 6];

    protected popularSeries = signal<Serie[]>([]);
    protected loading = signal(true);
    protected loadingMore = signal(false);
    protected hasMore = signal(true);
    private currentPage = 1;
    private readonly pageSize = 12;

    // Read once when the page is built, not on every evaluation: a computed
    // only recomputes when a signal it depends on changes, and the clock is not
    // one, so reading it inline would silently freeze at the first value. It
    // also pins the pick for the whole visit.
    private readonly dayIndex = signal(currentDayIndex());

    // Pool the front-page pick is drawn from. Popular and top rated are merged
    // because the popular list alone is only twelve entries and its top barely
    // moves week to week. The rating floor keeps out the daily news and talk
    // shows, which TMDB ranks highly because popularity rewards broadcast
    // frequency rather than interest.
    protected readonly featureCandidates = computed(() => {
        // First page of each list only: "load more" appends, and letting the
        // pool grow would change the hero under a visitor mid-session.
        const pool = [
            ...this.popularSeries().slice(0, this.pageSize),
            ...this.topRatedSeries().slice(0, this.topRatedPageSize),
        ];

        const byId = new Map<number, Serie>();
        for (const serie of pool) {
            if (serie.backdrop_path && serie.vote_average >= FEATURE_RATING_FLOOR) {
                byId.set(serie.id, serie);
            }
        }

        // Sorted by id so the daily sequence stays put when the API returns the
        // same series in a different order.
        return [...byId.values()].sort((a, b) => a.id - b.id);
    });

    // One serie carries both the hero backdrop and the featured card, so the
    // page opens on a single consistent subject. It rotates once a day: fixed
    // within a visit, so nothing swaps under the reader or flickers on reload,
    // but never the same image two days running.
    protected readonly featuredSerie = computed(() => {
        // Both lists feed the pool, so waiting for both avoids the hero jumping
        // to a different serie the moment the second request lands.
        if (this.loading() || this.topRatedLoading()) {
            return null;
        }

        const candidates = this.featureCandidates();
        if (candidates.length === 0) {
            return null;
        }

        return candidates[this.dayIndex() % candidates.length];
    });

    protected readonly heroBackdrop = computed(() => {
        const featured = this.featuredSerie();
        return featured ? getTmdbImageUrl(featured.backdrop_path, 'w780') : null;
    });

    // Whatever the featured card already shows is dropped from the rail.
    protected readonly railSeries = computed(() => {
        const featuredId = this.featuredSerie()?.id;
        return this.popularSeries().filter((serie) => serie.id !== featuredId);
    });

    protected topRatedSeries = signal<Serie[]>([]);
    protected topRatedLoading = signal(true);
    protected topRatedLoadingMore = signal(false);
    protected topRatedHasMore = signal(true);
    private topRatedCurrentPage = 1;
    private readonly topRatedPageSize = 12;

    // Cards claim a view-transition name keyed by serie id, and a name has to
    // be unique in the document, so a serie already shown above is filtered out
    // of the ranking rather than rendered twice. The featured serie is excluded
    // explicitly: it is now drawn from both lists, so it can be a top-rated
    // entry that the popular ids would not catch.
    protected readonly rankedSeries = computed(() => {
        const featuredId = this.featuredSerie()?.id;
        const alreadyShown = new Set(this.popularSeries().map((serie) => serie.id));

        return this.topRatedSeries().filter(
            (serie) => !alreadyShown.has(serie.id) && serie.id !== featuredId,
        );
    });

    private readonly seriesService = inject(SeriesService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly dialog = inject(MatDialog);
    private readonly destroyRef = inject(DestroyRef);
    private readonly metadataService = inject(MetadataService);
    private readonly translocoService = inject(TranslocoService);
    protected readonly authService = inject(AuthService);

    ngOnInit() {
        this.updateMetadata();
        this.loadSeriesData();
        this.loadTopRatedData();
        this.checkForAutoLogin();
    }

    private updateMetadata(): void {
        this.metadataService.updatePageMetadata({
            title: this.translocoService.translate('seo.home.title'),
            description: this.translocoService.translate('seo.home.description'),
            canonicalUrl: `${environment.siteUrl}/`,
        });
    }

    private loadSeriesData() {
        this.loading.set(true);

        this.seriesService
            .getPopularSeries(this.pageSize, this.currentPage)
            .pipe(
                catchError(() => {
                    return of([]);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((series) => {
                this.popularSeries.set(series);
                this.loading.set(false);
                this.hasMore.set(series.length === this.pageSize);
            });
    }

    private loadTopRatedData() {
        this.topRatedLoading.set(true);

        this.seriesService
            .getTopRatedSeries(this.topRatedPageSize, this.topRatedCurrentPage)
            .pipe(
                catchError(() => {
                    return of([]);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((series) => {
                this.topRatedSeries.set(series);
                this.topRatedLoading.set(false);
                this.topRatedHasMore.set(series.length === this.topRatedPageSize);
            });
    }

    protected loadMoreSeries() {
        if (this.loadingMore() || !this.hasMore()) return;

        this.loadingMore.set(true);
        const nextPage = this.currentPage + 1;

        this.seriesService
            .getPopularSeries(this.pageSize, nextPage)
            .pipe(
                catchError(() => {
                    return of([]);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((series) => {
                if (series.length > 0) {
                    this.currentPage = nextPage;
                    this.popularSeries.set([...this.popularSeries(), ...series]);
                }

                this.hasMore.set(series.length === this.pageSize);
                this.loadingMore.set(false);
            });
    }

    protected loadMoreTopRated() {
        if (this.topRatedLoadingMore() || !this.topRatedHasMore()) return;

        this.topRatedLoadingMore.set(true);
        const nextPage = this.topRatedCurrentPage + 1;

        this.seriesService
            .getTopRatedSeries(this.topRatedPageSize, nextPage)
            .pipe(
                catchError(() => {
                    return of([]);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((series) => {
                if (series.length > 0) {
                    this.topRatedCurrentPage = nextPage;
                    this.topRatedSeries.set([...this.topRatedSeries(), ...series]);
                }

                this.topRatedHasMore.set(series.length === this.topRatedPageSize);
                this.topRatedLoadingMore.set(false);
            });
    }

    private checkForAutoLogin() {
        this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
            if (params['login'] === 'true' && !this.authService.isAuthenticated()) {
                const returnUrl = params['returnUrl'];
                this.goToLogin(returnUrl);
            }
        });
    }

    protected goToLogin(returnUrl?: string) {
        const dialogRef = this.dialog.open(LoginComponent, {
            width: '400px',
            disableClose: false,
            autoFocus: true,
            data: { returnUrl: returnUrl },
        });

        dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((result) => {
                if (result && returnUrl) {
                    this.router.navigate([returnUrl]);
                }
            });
    }
}
