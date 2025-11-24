import { Component, OnInit, signal, inject, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';

import { SeriesService } from '../services/series.service';
import { AuthService } from '../services/auth.service';
import { MetadataService } from '../services/metadata.service';
import { Serie } from '../models/serie.model';
import { LoginComponent } from '../login/login.component';
import { SerieCardComponent } from '../shared/serie-card/serie-card.component';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-home',
    imports: [
        TranslocoModule,
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        SerieCardComponent
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
    protected popularSeries = signal<Serie[]>([]);
    protected loading = signal(true);
    protected loadingMore = signal(false);
    protected hasMore = signal(true);
    private currentPage = 1;
    private readonly pageSize = 12;

    protected topRatedSeries = signal<Serie[]>([]);
    protected topRatedLoading = signal(true);
    protected topRatedLoadingMore = signal(false);
    protected topRatedHasMore = signal(true);
    private topRatedCurrentPage = 1;
    private readonly topRatedPageSize = 12;

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
            canonicalUrl: `${environment.siteUrl}/`
        });
    }

    private loadSeriesData() {
        this.loading.set(true);

        this.seriesService.getPopularSeries(this.pageSize, this.currentPage).pipe(
            catchError(() => {
                return of([]);
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(series => {
            this.popularSeries.set(series);
            this.loading.set(false);
            this.hasMore.set(series.length === this.pageSize);
        });
    }

    private loadTopRatedData() {
        this.topRatedLoading.set(true);

        this.seriesService.getTopRatedSeries(this.topRatedPageSize, this.topRatedCurrentPage).pipe(
            catchError(() => {
                return of([]);
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(series => {
            this.topRatedSeries.set(series);
            this.topRatedLoading.set(false);
            this.topRatedHasMore.set(series.length === this.topRatedPageSize);
        });
    }

    protected loadMoreSeries() {
        if (this.loadingMore() || !this.hasMore()) return;

        this.loadingMore.set(true);
        const nextPage = this.currentPage + 1;

        this.seriesService.getPopularSeries(this.pageSize, nextPage).pipe(
            catchError(() => {
                return of([]);
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(series => {
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

        this.seriesService.getTopRatedSeries(this.topRatedPageSize, nextPage).pipe(
            catchError(() => {
                return of([]);
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(series => {
            if (series.length > 0) {
                this.topRatedCurrentPage = nextPage;
                this.topRatedSeries.set([...this.topRatedSeries(), ...series]);
            }

            this.topRatedHasMore.set(series.length === this.topRatedPageSize);
            this.topRatedLoadingMore.set(false);
        });
    }

    private checkForAutoLogin() {
        this.route.queryParams.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(params => {
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
            data: { returnUrl: returnUrl }
        });

        dialogRef.afterClosed().pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(result => {
            if (result && returnUrl) {
                this.router.navigate([returnUrl]);
            }
        });
    }
}