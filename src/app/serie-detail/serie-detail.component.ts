import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SeriesService } from '../services/series.service';
import { AuthService } from '../services/auth.service';
import { Serie, SerieStats, getTmdbImageUrl, formatRating } from '../models/serie.model';
import { SerieStatusChipComponent } from '../shared/serie-status-chip/serie-status-chip.component';

@Component({
    selector: 'app-serie-detail',
    standalone: true,
    imports: [
        CommonModule,
        TranslocoModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatBadgeModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatDividerModule,
        MatExpansionModule,
        MatTabsModule,
        MatTooltipModule,
        SerieStatusChipComponent
    ],
    templateUrl: './serie-detail.component.html',
    styleUrl: './serie-detail.component.scss'
})
export class SerieDetailComponent implements OnInit {
    private serieId = signal<number>(0);
    private serieName = signal<string>('');

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
    }); protected isSeasonWatched(seasonId: number): boolean {
        const watchedSeasons = this.watchedSeasons();
        return watchedSeasons.includes(seasonId);
    } protected isSeasonLoading(seasonId: number): boolean {
        const loadingStates = this.seasonLoadingStates();
        return loadingStates.get(seasonId) || false;
    } protected isEpisodeWatched(episodeId: number): boolean {
        const watchedEpisodes = this.watchedEpisodes();
        return watchedEpisodes.includes(episodeId);
    } protected refreshSerieData(): void {
        this.loadSerieDetails();
    } protected isEpisodeLoading(episodeId: number): boolean {
        const loadingStates = this.episodeLoadingStates();
        return loadingStates.get(episodeId) || false;
    }

    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly seriesService = inject(SeriesService);
    private readonly authService = inject(AuthService);
    private readonly translocoService = inject(TranslocoService);

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.serieId.set(+params['id']);
            this.serieName.set(params['nom']);
            this.loadSerieDetails();
        });
    }

    private loadSerieDetails() {
        this.loading.set(true);
        this.error.set(null);

        this.seriesService.getSerieDetails(this.serieId()).subscribe({
            next: (response) => {
                if (response && response.success) {
                    const { serie, stats } = response;
                    this.serie.set(serie);

                    this.seriesService.isSerieReallyFollowed(serie.id).subscribe({
                        next: (isReallyFollowed) => {
                            const serieStats: SerieStats = {
                                followedByCurrentUser: isReallyFollowed,
                                watchedByCurrentUser: serie.user_data?.is_watched || false,
                                totalFollowers: 0, // Will need to be provided by backend later
                                seasons_count: stats.seasons_count,
                                episodes_count: stats.episodes_count
                            };
                            this.stats.set(serieStats);
                        },
                        error: () => {
                            const serieStats: SerieStats = {
                                followedByCurrentUser: serie.user_data?.is_following || false,
                                watchedByCurrentUser: serie.user_data?.is_watched || false,
                                totalFollowers: 0,
                                seasons_count: stats.seasons_count,
                                episodes_count: stats.episodes_count
                            };
                            this.stats.set(serieStats);
                        }
                    });
                } else {
                    this.error.set('Serie not found');
                }
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Error loading serie');
                this.loading.set(false);
            }
        });
    }

    protected goBack() {
        this.router.navigate(['/']);
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
                } else {
                    this.loadSerieDetails();
                }
                this.followLoading.set(false);
            },
            error: () => {
                this.loadSerieDetails();
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
        let episodeSeason: { id: number, episodes?: { id: number }[] } | null = null;
        for (const season of currentSeasons) {
            if (season.episodes?.some((ep: { id: number }) => ep.id === episodeId)) {
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
        const seasonEpisodeIds = season.episodes.map((ep: { id: number }) => ep.id);

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
    } private checkAndUpdateSeasonStatus(season: { id: number, episodes?: { id: number }[] }) {
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

        allSeasons.forEach(season => {
            allSeasonIds.push(season.id);
            if (season.episodes) {
                season.episodes.forEach((episode: { id: number }) => {
                    allEpisodeIds.push(episode.id);
                });
            }
        });

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