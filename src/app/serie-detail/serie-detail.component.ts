import { Component, OnInit, computed, signal, inject, DestroyRef, ChangeDetectionStrategy, Renderer2, DOCUMENT } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { DatePipe, DecimalPipe } from '@angular/common';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SeriesService } from '../services/series.service';
import { AuthService } from '../services/auth.service';
import { MetadataService } from '../services/metadata.service';
import { Serie, Season, SerieStats, getTmdbImageUrl, formatRating } from '../models/serie.model';
import { SerieWatchProvidersComponent } from './serie-watch-providers/serie-watch-providers.component';
import { SerieVideosComponent } from './serie-videos/serie-videos.component';
import { SerieSeasonsComponent } from './serie-seasons/serie-seasons.component';
import { SerieHeaderComponent } from './serie-header/serie-header.component';
import { SerieRecommendationsComponent } from './serie-recommendations/serie-recommendations.component';
import { SerieImagesComponent } from './serie-images/serie-images.component';
import { environment } from '../../environments/environment';
import { getSerieCanonicalUrl } from '../utils/url.utils';

@Component({
    selector: 'app-serie-detail',
    imports: [
        DatePipe,
        DecimalPipe,
        TranslocoModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatDividerModule,
        MatExpansionModule,
        MatTabsModule,
        MatTooltipModule,
        SerieWatchProvidersComponent,
        SerieVideosComponent,
        SerieSeasonsComponent,
        SerieHeaderComponent,
        SerieRecommendationsComponent,
        SerieImagesComponent
    ],
    templateUrl: './serie-detail.component.html',
    styleUrl: './serie-detail.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SerieDetailComponent implements OnInit {
    private readonly serieId = signal<number>(0);
    private readonly serieName = signal<string>('');

    protected serie = signal<Serie | null>(null);
    protected stats = signal<SerieStats | null>(null);
    protected loading = signal<boolean>(true);
    protected error = signal<string | null>(null);
    protected followLoading = signal<boolean>(false);
    protected watchedLoading = signal<boolean>(false);
    protected seasonLoadingStates = signal<Map<number, boolean>>(new Map());
    protected episodeLoadingStates = signal<Map<number, boolean>>(new Map());

    protected backdropUrl = computed(() => {
        const currentSerie = this.serie();
        return currentSerie ? getTmdbImageUrl(currentSerie.backdrop_path, 'original') : '';
    });

    protected posterUrl = computed(() => {
        const currentSerie = this.serie();
        return currentSerie ? getTmdbImageUrl(currentSerie.poster_path, 'w500') : '';
    });

    protected seasons = computed(() => {
        const currentSerie = this.serie();
        return currentSerie?.seasons || [];
    });

    protected currentUser = computed(() => this.authService.currentUser());
    protected isAuthenticated = computed(() => this.authService.isAuthenticated());

    protected isFollowing = computed(() => {
        const currentStats = this.stats();
        return currentStats?.followedByCurrentUser || false;
    });

    protected isWatched = computed(() => {
        const currentStats = this.stats();
        return currentStats?.watchedByCurrentUser || false;
    });

    protected userSerieData = computed(() => {
        const currentSerie = this.serie();
        return currentSerie?.user_data || null;
    });

    protected watchedEpisodes = computed(() => {
        const userData = this.userSerieData();
        return userData?.watched_episodes || [];
    });

    protected watchedSeasons = computed(() => {
        const userData = this.userSerieData();
        return userData?.watched_seasons || [];
    });

    protected watchProviders = computed(() => {
        const currentSerie = this.serie();
        return currentSerie?.watch_providers || [];
    });

    protected hasWatchProviders = computed(() => {
        return this.watchProviders().length > 0;
    });

    protected videos = computed(() => {
        const currentSerie = this.serie();
        return currentSerie?.videos || [];
    });

    protected hasVideos = computed(() => {
        return this.videos().length > 0;
    });

    protected officialTrailers = computed(() => {
        return this.videos().filter(v => v.type === 'Trailer' && v.official);
    });

    protected recommendations = computed(() => {
        const currentSerie = this.serie();
        return currentSerie?.recommendations || [];
    });

    protected images = computed(() => {
        const currentSerie = this.serie();
        return currentSerie?.images || null;
    });

    protected hasImages = computed(() => {
        const imgs = this.images();
        return imgs ? (imgs.backdrops.length > 0 || imgs.posters.length > 0 || imgs.logos.length > 0) : false;
    });

    // Primary backdrop image for Open Graph meta tags (social media sharing and SEO)
    protected primaryBackdropUrl = computed(() => {
        const imgs = this.images();
        const firstBackdrop = imgs?.backdrops[0];
        return firstBackdrop ? firstBackdrop.file_path : this.backdropUrl();
    });

    // Primary poster image for Open Graph meta tags
    protected primaryPosterUrl = computed(() => {
        const imgs = this.images();
        const firstPoster = imgs?.posters[0];
        return firstPoster ? firstPoster.file_path : this.posterUrl();
    });

    protected isSeasonWatched(seasonId: number): boolean {
        const watchedSeasons = this.watchedSeasons();
        return watchedSeasons.includes(seasonId);
    }

    protected isSeasonLoading(seasonId: number): boolean {
        const loadingStates = this.seasonLoadingStates();
        return loadingStates.get(seasonId) || false;
    }

    protected isEpisodeWatched(episodeId: number): boolean {
        const watchedEpisodes = this.watchedEpisodes();
        return watchedEpisodes.includes(episodeId);
    }

    protected isEpisodeLoading(episodeId: number): boolean {
        const loadingStates = this.episodeLoadingStates();
        return loadingStates.get(episodeId) || false;
    }

    private buildSerieStats(serie: Serie, stats: { seasons_count: number; episodes_count: number } | undefined, isReallyFollowed: boolean): SerieStats {
        return {
            followedByCurrentUser: isReallyFollowed,
            watchedByCurrentUser: serie.user_data?.is_watched || false,
            totalFollowers: 0, // Will be provided by backend later
            seasons_count: stats?.seasons_count || 0,
            episodes_count: stats?.episodes_count || 0
        };
    }

    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly seriesService = inject(SeriesService);
    private readonly authService = inject(AuthService);
    private readonly transloco = inject(TranslocoService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly metadataService = inject(MetadataService);
    private readonly metaService = inject(Meta);
    private readonly renderer = inject(Renderer2);
    private readonly document = inject(DOCUMENT);

    ngOnInit() {
        this.route.params.pipe(
            switchMap(params => {
                this.serieId.set(+params['id']);
                this.serieName.set(params['nom']);

                this.loading.set(true);
                this.error.set(null);
                return this.seriesService.getSerieDetails(this.serieId());
            }),
            switchMap((response) => {
                if (response?.success) {
                    const { serie, stats } = response;
                    this.serie.set(serie);

                    // Use switchMap to avoid nested subscriptions
                    return this.seriesService.isSerieReallyFollowed(serie.id)
                        .pipe(
                            map((isReallyFollowed) => ({ serie, stats, isReallyFollowed })),
                            catchError(() => of({ serie, stats, isReallyFollowed: serie.user_data?.is_following ?? false }))
                        );
                } else {
                    throw new Error(this.transloco.translate('notifications.errors.serie_not_found'));
                }
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: ({ serie, stats, isReallyFollowed }) => {
                const serieStats = this.buildSerieStats(serie, stats, isReallyFollowed);
                this.stats.set(serieStats);
                this.updateMetadataForSerie(serie);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.message || this.transloco.translate('notifications.errors.loading_serie'));
                this.loading.set(false);
            }
        });
    }

    protected goBack() {
        this.router.navigate(['/']);
    }

    private updateMetadataForSerie(serie: Serie): void {
        const title = serie.name;

        let description: string;
        if (serie.overview) {
            description = serie.overview.length > 155
                ? `${serie.overview.substring(0, 155)}...`
                : serie.overview;
        } else {
            description = this.transloco.translate('seo.serie_detail.default_description');
        }

        const imageUrl = this.primaryBackdropUrl() || (serie.poster_path ? getTmdbImageUrl(serie.poster_path, 'w500') : undefined);
        const canonicalUrl = getSerieCanonicalUrl(serie.id, serie.name, environment.siteUrl);
        const fullUrl = `${environment.siteUrl}/serie/${serie.id}`;

        this.metadataService.updatePageMetadata({
            title,
            description,
            image: imageUrl,
            canonicalUrl
        });

        // Open Graph specific for TV Series
        this.metadataService.setOpenGraphData(title, description, imageUrl, fullUrl);
        this.metaService.updateTag({ property: 'og:type', content: 'video.tv_show' });

        // Structured Data for TV Series
        const images = [imageUrl, this.primaryPosterUrl()].filter(url => url && url.length > 0);
        const structuredData: Record<string, unknown> = {
            '@context': 'https://schema.org',
            '@type': 'TVSeries',
            name: serie.name,
            description: serie.overview
        };

        if (images.length > 0) {
            structuredData['image'] = images;
        }

        // Only include rating if valid data exists
        if (typeof serie.vote_average === 'number' && serie.vote_count > 0) {
            structuredData['aggregateRating'] = {
                '@type': 'AggregateRating',
                ratingValue: serie.vote_average,
                bestRating: 10,
                worstRating: 0,
                ratingCount: serie.vote_count
            };
        }

        this.addStructuredData(structuredData);
    }

    private addStructuredData(data: Record<string, unknown>): void {
        // Remove existing structured data first to avoid duplicates
        const existingScripts = this.document.head.querySelectorAll(
            'script[type="application/ld+json"][data-schema="serie-detail"]'
        );
        existingScripts.forEach((existingScript) => {
            this.renderer.removeChild(this.document.head, existingScript);
        });

        // Create and add new structured data
        const script = this.renderer.createElement('script');
        this.renderer.setAttribute(script, 'type', 'application/ld+json');
        this.renderer.setAttribute(script, 'data-schema', 'serie-detail');

        // Escape potential script injection vectors
        const json = JSON.stringify(data)
            .replaceAll('</script>', String.raw`<\/script>`)
            .replaceAll('<!--', String.raw`<\!--`);

        const textNode = this.renderer.createText(json);
        this.renderer.appendChild(script, textNode);
        this.renderer.appendChild(this.document.head, script);
    }

    protected onToggleFollow() {
        const currentSerie = this.serie();
        if (!currentSerie || !this.isAuthenticated()) {
            return;
        }

        this.followLoading.set(true);
        const isCurrentlyFollowing = this.isFollowing();

        const action = isCurrentlyFollowing
            ? this.seriesService.unfollowSerie(currentSerie.id)
            : this.seriesService.followSerie(currentSerie.id);

        action.subscribe({
            next: (success) => {
                if (success) {
                    const currentStats = this.stats();
                    if (currentStats) {
                        const newStats = {
                            ...currentStats,
                            followedByCurrentUser: !isCurrentlyFollowing,
                            totalFollowers: isCurrentlyFollowing
                                ? Math.max(0, currentStats.totalFollowers - 1)
                                : currentStats.totalFollowers + 1
                        };
                        this.stats.set(newStats);
                    }
                }
                this.followLoading.set(false);
            },
            error: () => {
                this.followLoading.set(false);
            }
        });
    } protected onToggleWatched() {
        if (!this.isAuthenticated()) {
            return;
        }

        const currentStats = this.stats();
        if (!currentStats) {
            return;
        }

        const isCurrentlyWatched = currentStats.watchedByCurrentUser;
        this.watchedLoading.set(true);

        this.stats.set({
            ...currentStats,
            watchedByCurrentUser: !isCurrentlyWatched
        });

        if (isCurrentlyWatched) {
            this.clearAllWatchedData();
        } else {
            this.markAllWatchedData();
        }

        const action = isCurrentlyWatched
            ? this.seriesService.unmarkSerieAsWatched(this.serieId())
            : this.seriesService.markSerieAsWatched(this.serieId());

        action.subscribe({
            next: (success) => {
                if (!success) {
                    if (currentStats) {
                        this.stats.set({
                            ...currentStats,
                            watchedByCurrentUser: isCurrentlyWatched
                        });
                    }
                }
                this.watchedLoading.set(false);
            },
            error: () => {
                if (currentStats) {
                    this.stats.set({
                        ...currentStats,
                        watchedByCurrentUser: isCurrentlyWatched
                    });
                }
                this.watchedLoading.set(false);
            }
        });
    } protected onToggleSeasonWatched(seasonId: number) {
        if (!this.isAuthenticated()) {
            return;
        }

        const currentSerie = this.serie();
        if (!currentSerie?.user_data) {
            return;
        }

        const isCurrentlyWatched = this.isSeasonWatched(seasonId);

        const loadingStates = this.seasonLoadingStates();
        loadingStates.set(seasonId, true);
        this.seasonLoadingStates.set(new Map(loadingStates));

        const currentWatchedSeasons = [...this.watchedSeasons()];
        const updatedWatchedSeasons = isCurrentlyWatched
            ? currentWatchedSeasons.filter(id => id !== seasonId)
            : [...currentWatchedSeasons, seasonId];

        const updatedUserData = {
            ...currentSerie.user_data,
            watched_seasons: updatedWatchedSeasons
        };

        this.serie.set({
            ...currentSerie,
            user_data: updatedUserData
        });

        const action = isCurrentlyWatched
            ? this.seriesService.unmarkSeasonAsWatched(this.serieId(), seasonId)
            : this.seriesService.markSeasonAsWatched(this.serieId(), seasonId);

        action.subscribe({
            next: (success) => {
                if (success) {
                    this.updateAllEpisodesInSeason(seasonId, !isCurrentlyWatched);
                }

                if (!success) {
                    if (currentSerie.user_data) {
                        this.serie.set({
                            ...currentSerie,
                            user_data: {
                                ...currentSerie.user_data,
                                watched_seasons: currentWatchedSeasons
                            }
                        });
                    }
                }

                const loadingStates = this.seasonLoadingStates();
                loadingStates.set(seasonId, false);
                this.seasonLoadingStates.set(new Map(loadingStates));
            },
            error: () => {
                if (currentSerie.user_data) {
                    this.serie.set({
                        ...currentSerie,
                        user_data: {
                            ...currentSerie.user_data,
                            watched_seasons: currentWatchedSeasons
                        }
                    });
                }

                const loadingStates = this.seasonLoadingStates();
                loadingStates.set(seasonId, false);
                this.seasonLoadingStates.set(new Map(loadingStates));
            }
        });
    } protected onToggleEpisodeWatched(episodeId: number) {
        if (!this.isAuthenticated()) {
            return;
        }

        const currentSerie = this.serie();
        if (!currentSerie?.user_data) {
            return;
        }

        const isCurrentlyWatched = this.isEpisodeWatched(episodeId);

        const currentSeasons = this.seasons();
        let episodeSeason: Season | null = null;
        for (const season of currentSeasons) {
            if (season.episodes?.some(ep => ep.id === episodeId)) {
                episodeSeason = season;
                break;
            }
        }

        const loadingStates = this.episodeLoadingStates();
        loadingStates.set(episodeId, true);
        this.episodeLoadingStates.set(new Map(loadingStates));

        const currentWatchedEpisodes = [...this.watchedEpisodes()];
        const updatedWatchedEpisodes = isCurrentlyWatched
            ? currentWatchedEpisodes.filter(id => id !== episodeId)
            : [...currentWatchedEpisodes, episodeId];

        const updatedUserData = {
            ...currentSerie.user_data,
            watched_episodes: updatedWatchedEpisodes
        };

        this.serie.set({
            ...currentSerie,
            user_data: updatedUserData
        });

        const action = isCurrentlyWatched
            ? this.seriesService.unmarkEpisodeAsWatched(this.serieId(), episodeId)
            : this.seriesService.markEpisodeAsWatched(this.serieId(), episodeId);

        action.subscribe({
            next: (success) => {
                if (success && episodeSeason) {
                    this.checkAndUpdateSeasonStatus(episodeSeason);
                }

                if (!success) {
                    if (currentSerie.user_data) {
                        this.serie.set({
                            ...currentSerie,
                            user_data: {
                                ...currentSerie.user_data,
                                watched_episodes: currentWatchedEpisodes
                            }
                        });
                    }
                }

                const loadingStates = this.episodeLoadingStates();
                loadingStates.set(episodeId, false);
                this.episodeLoadingStates.set(new Map(loadingStates));
            },
            error: () => {
                if (currentSerie.user_data) {
                    this.serie.set({
                        ...currentSerie,
                        user_data: {
                            ...currentSerie.user_data,
                            watched_episodes: currentWatchedEpisodes
                        }
                    });
                }

                const loadingStates = this.episodeLoadingStates();
                loadingStates.set(episodeId, false);
                this.episodeLoadingStates.set(new Map(loadingStates));
            }
        });
    } private updateAllEpisodesInSeason(seasonId: number, markAsWatched: boolean) {
        const currentSeasons = this.seasons();
        const season = currentSeasons.find(s => s.id === seasonId);

        if (!season?.episodes || season.episodes.length === 0) {
            return;
        }

        const currentSerie = this.serie();
        if (!currentSerie?.user_data) {
            return;
        }

        const currentWatchedEpisodes = [...this.watchedEpisodes()];
        const seasonEpisodeIds = season.episodes.map(ep => ep.id);

        let updatedWatchedEpisodes: number[];

        if (markAsWatched) {
            const newWatchedEpisodes = seasonEpisodeIds.filter(id => !currentWatchedEpisodes.includes(id));
            updatedWatchedEpisodes = [...currentWatchedEpisodes, ...newWatchedEpisodes];
        } else {
            updatedWatchedEpisodes = currentWatchedEpisodes.filter(id => !seasonEpisodeIds.includes(id));
        }

        const updatedUserData = {
            ...currentSerie.user_data,
            watched_episodes: updatedWatchedEpisodes
        };

        this.serie.set({
            ...currentSerie,
            user_data: updatedUserData
        });
    } private checkAndUpdateSeasonStatus(season: Season) {
        if (!season.episodes || season.episodes.length === 0) {
            return;
        }

        const currentWatchedEpisodes = this.watchedEpisodes();
        const seasonEpisodeIds = season.episodes.map(ep => ep.id);
        const watchedEpisodesInSeason = seasonEpisodeIds.filter(id => currentWatchedEpisodes.includes(id));

        const isSeasonCurrentlyWatched = this.isSeasonWatched(season.id);
        const allEpisodesWatched = watchedEpisodesInSeason.length === seasonEpisodeIds.length;
        const noEpisodesWatched = watchedEpisodesInSeason.length === 0;

        if (allEpisodesWatched && !isSeasonCurrentlyWatched) {
            this.seriesService.markSeasonAsWatched(this.serieId(), season.id).subscribe({
                next: (success) => {
                    if (success) {
                        const currentSerie = this.serie();
                        if (currentSerie?.user_data) {
                            const updatedWatchedSeasons = [...(currentSerie.user_data.watched_seasons || []), season.id];
                            this.serie.set({
                                ...currentSerie,
                                user_data: {
                                    ...currentSerie.user_data,
                                    watched_seasons: updatedWatchedSeasons
                                }
                            });
                        }
                    }
                }
            });
        }
        else if (noEpisodesWatched && isSeasonCurrentlyWatched) {
            this.seriesService.unmarkSeasonAsWatched(this.serieId(), season.id).subscribe({
                next: (success) => {
                    if (success) {
                        const currentSerie = this.serie();
                        if (currentSerie?.user_data) {
                            const updatedWatchedSeasons = (currentSerie.user_data.watched_seasons || [])
                                .filter(id => id !== season.id);
                            this.serie.set({
                                ...currentSerie,
                                user_data: {
                                    ...currentSerie.user_data,
                                    watched_seasons: updatedWatchedSeasons
                                }
                            });
                        }
                    }
                }
            });
        }
    }

    private clearAllWatchedData() {
        const currentSerie = this.serie();
        if (!currentSerie?.user_data) {
            return;
        }

        const updatedUserData = {
            ...currentSerie.user_data,
            watched_episodes: [],
            watched_seasons: []
        };

        this.serie.set({
            ...currentSerie,
            user_data: updatedUserData
        });
    }

    private markAllWatchedData() {
        const currentSerie = this.serie();
        if (!currentSerie?.user_data) {
            return;
        }

        const allSeasons = this.seasons();
        const allSeasonIds: number[] = [];
        const allEpisodeIds: number[] = [];

        for (const season of allSeasons) {
            allSeasonIds.push(season.id);
            if (season.episodes) {
                for (const episode of season.episodes) {
                    allEpisodeIds.push(episode.id);
                }
            }
        }

        const updatedUserData = {
            ...currentSerie.user_data,
            watched_episodes: allEpisodeIds,
            watched_seasons: allSeasonIds
        };

        this.serie.set({
            ...currentSerie,
            user_data: updatedUserData
        });
    }

    protected formatRating = formatRating;
}