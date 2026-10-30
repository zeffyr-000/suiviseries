import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule, ActivatedRoute } from '@angular/router';

import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { SeriesService } from '../services/series.service';
import { AuthService } from '../services/auth.service';
import { MetadataService } from '../services/metadata.service';
import { Serie } from '../models/serie.model';
import { openLoginDialog } from '../login/login.component';
import { SectionHeaderComponent } from '../shared/section-header/section-header.component';
import { HomeHeroComponent } from './home-hero/home-hero.component';
import { FeaturedSerieComponent } from './featured-serie/featured-serie.component';
import { SerieRailComponent } from './serie-rail/serie-rail.component';
import { HomeValuePropsComponent } from './home-value-props/home-value-props.component';
import { RankedSeriesComponent } from './ranked-series/ranked-series.component';
import { ButtonLoadingDirective } from '../shared/directives/button-loading.directive';
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

// Both headliners are drawn at 16:9 and lead a section, so they need wide
// artwork and a rating that justifies the space.
function canHeadline(serie: Serie): boolean {
    return !!serie.backdrop_path && serie.vote_average >= FEATURE_RATING_FLOOR;
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
        ButtonLoadingDirective,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
    // Placeholder slots rendered while the first page loads: a rail's worth
    // for the first band, a full page for the ranking.
    protected readonly skeletonSlots = [1, 2, 3, 4, 5, 6];
    protected readonly rankingSkeletonSlots = Array.from({ length: 12 }, (_, index) => index);

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

    // Both headliners and the lists below them depend on both requests, so the
    // first band waits for the pair rather than rendering, then reshuffling
    // when the second response lands.
    protected readonly listsReady = computed(() => !this.loading() && !this.topRatedLoading());

    // The trending card shows what is actually trending: the most popular
    // serie of the moment, in the API's popularity order, that can carry a
    // headline. First page only, so "load more" never swaps it mid-visit.
    protected readonly trendingSerie = computed(() => {
        if (!this.listsReady()) {
            return null;
        }

        return this.popularSeries().slice(0, this.pageSize).find(canHeadline) ?? null;
    });

    // Pool the hero pick is drawn from: the popular series only. The ranking
    // is shown whole, so a hero taken from it would either repeat one of its
    // entries or punch a hole in its order; a popular serie that also ranks is
    // left out for the same reason. The trending serie is left out too: it
    // already leads the band below, and showing it twice in one screen is what
    // made the hero read as a duplicate.
    protected readonly spotlightCandidates = computed(() => {
        const trendingId = this.trendingSerie()?.id;

        // First page of each list only: "load more" appends, and letting the
        // pool move would change the hero under a visitor mid-session.
        const ranked = new Set(
            this.topRatedSeries()
                .slice(0, this.topRatedPageSize)
                .map((serie) => serie.id),
        );

        return (
            this.popularSeries()
                .slice(0, this.pageSize)
                .filter(
                    (serie) =>
                        serie.id !== trendingId && !ranked.has(serie.id) && canHeadline(serie),
                )
                // Sorted by id so the daily sequence stays put when the API
                // returns the same series in a different order.
                .sort((a, b) => a.id - b.id)
        );
    });

    // The hero backdrop rotates once a day: fixed within a visit, so nothing
    // swaps under the reader or flickers on reload, but never the same image
    // two days running.
    protected readonly spotlightSerie = computed(() => {
        if (!this.listsReady()) {
            return null;
        }

        const candidates = this.spotlightCandidates();
        if (candidates.length === 0) {
            return null;
        }

        return candidates[this.dayIndex() % candidates.length];
    });

    // The rail is the one list that gives way. It has no order to break, while
    // the ranking is numbered and shown whole, so a serie that also ranks is
    // dropped from the rail rather than from the ranking. Rail and ranking
    // cards also claim a view-transition name keyed by serie id, and a name has
    // to be unique in the document.
    protected readonly railSeries = computed(() => {
        const shown = new Set(this.topRatedSeries().map((serie) => serie.id));
        for (const headliner of [this.spotlightSerie(), this.trendingSerie()]) {
            if (headliner) {
                shown.add(headliner.id);
            }
        }

        return this.popularSeries().filter((serie) => !shown.has(serie.id));
    });

    protected topRatedSeries = signal<Serie[]>([]);
    protected topRatedLoading = signal(true);
    protected topRatedLoadingMore = signal(false);
    protected topRatedHasMore = signal(true);
    private topRatedCurrentPage = 1;
    private readonly topRatedPageSize = 12;

    private readonly seriesService = inject(SeriesService);
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
        openLoginDialog(this.dialog, returnUrl);
    }
}
