import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { SerieDetailComponent } from './serie-detail.component';
import { SeriesService } from '../services/series.service';
import { AuthService } from '../services/auth.service';
import { MetadataService } from '../services/metadata.service';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';
import {
    createMockSerie,
    createMockSerieStats,
    createMockAuthService,
    createMockMetadataService
} from '../testing/mocks';
import { SerieStatus, WatchProvider, Video } from '../models/serie.model';

describe('SerieDetailComponent', () => {
    let component: SerieDetailComponent;
    let mockSeriesService: {
        getSerieDetails: ReturnType<typeof vi.fn>;
        isSerieReallyFollowed: ReturnType<typeof vi.fn>;
    };
    let mockAuthService: ReturnType<typeof createMockAuthService>;
    let mockMetadataService: ReturnType<typeof createMockMetadataService>;

    const mockSerie = createMockSerie({
        name: 'Breaking Bad',
        original_name: 'Breaking Bad',
        overview: 'A high school chemistry teacher turned methamphetamine producer.',
        poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
        backdrop_path: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
        first_air_date: '2008-01-20',
        last_air_date: '2013-09-29',
        vote_average: 9.3,
        vote_count: 12000,
        status: SerieStatus.ENDED,
        number_of_seasons: 5,
        number_of_episodes: 62,
        popularity: 300,
        seasons: []
    });

    const mockStats = createMockSerieStats({
        totalFollowers: 1000,
        seasons_count: 5,
        episodes_count: 62
    });

    const mockResponse = {
        success: true,
        serie: mockSerie,
        stats: mockStats
    };

    beforeEach(() => {
        mockSeriesService = {
            getSerieDetails: vi.fn().mockReturnValue(of(mockResponse)),
            isSerieReallyFollowed: vi.fn().mockReturnValue(of(false))
        };

        mockAuthService = createMockAuthService();
        mockMetadataService = createMockMetadataService();

        TestBed.configureTestingModule({
            imports: [
                SerieDetailComponent,
                getTranslocoTestingModule()
            ],
            providers: [
                provideRouter([]),
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: '1', nom: 'breaking-bad' })
                    }
                },
                { provide: SeriesService, useValue: mockSeriesService },
                { provide: AuthService, useValue: mockAuthService },
                { provide: MetadataService, useValue: mockMetadataService }
            ]
        });

        component = TestBed.createComponent(SerieDetailComponent).componentInstance;
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should have initial signal values', () => {
            expect(component['serie']()).toBeNull();
            expect(component['stats']()).toBeNull();
            expect(component['loading']()).toBe(true);
            expect(component['error']()).toBeNull();
        });
    });

    describe('ngOnInit', () => {
        it('should load serie details', () => {
            component.ngOnInit();

            expect(mockSeriesService.getSerieDetails).toHaveBeenCalledWith(1);
            expect(component['serie']()).toEqual(mockSerie);
            expect(component['loading']()).toBe(false);
        });

        it('should update metadata after loading', () => {
            component.ngOnInit();

            expect(mockMetadataService.updatePageMetadata).toHaveBeenCalled();
        });

        it('should handle errors', () => {
            mockSeriesService.getSerieDetails.mockReturnValue(
                of({ success: false })
            );

            component.ngOnInit();

            // Component should handle error gracefully
            expect(component['loading']()).toBe(false);
        });
    });

    describe('Computed Properties', () => {
        beforeEach(() => {
            component.ngOnInit();
        });

        it('should compute backdrop URL', () => {
            const url = component['backdropUrl']();
            expect(url).toContain('image.tmdb.org');
            expect(url).toContain(mockSerie.backdrop_path);
        });

        it('should compute poster URL', () => {
            const url = component['posterUrl']();
            expect(url).toContain('image.tmdb.org');
            expect(url).toContain(mockSerie.poster_path);
        });

        it('should return seasons array', () => {
            expect(component['seasons']()).toEqual([]);
        });

        it('should compute isFollowing from stats', () => {
            expect(component['isFollowing']()).toBe(false);

            component['stats'].set({
                ...mockStats,
                followedByCurrentUser: true
            });

            expect(component['isFollowing']()).toBe(true);
        });

        it('should compute isWatched from stats', () => {
            expect(component['isWatched']()).toBe(false);

            component['stats'].set({
                ...mockStats,
                watchedByCurrentUser: true
            });

            expect(component['isWatched']()).toBe(true);
        });
    });

    describe('Authentication State', () => {
        it('should reflect authenticated state', () => {
            mockAuthService.isAuthenticated.mockReturnValue(true);
            component.ngOnInit();

            expect(component['isAuthenticated']()).toBe(true);
        });

        it('should reflect unauthenticated state', () => {
            mockAuthService.isAuthenticated.mockReturnValue(false);
            component.ngOnInit();

            expect(component['isAuthenticated']()).toBe(false);
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors', () => {
            mockSeriesService.getSerieDetails.mockReturnValue(
                throwError(() => new Error('Network error'))
            );

            component.ngOnInit();

            expect(component['loading']()).toBe(false);
            expect(component['error']()).toBeTruthy();
        });
    });

    describe('Watch Providers', () => {
        const mockWatchProviders: WatchProvider[] = [
            {
                provider_id: 8,
                provider_name: 'Netflix',
                logo_path: 'https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg',
                type: 'flatrate'
            },
            {
                provider_id: 119,
                provider_name: 'Amazon Prime Video',
                logo_path: 'https://image.tmdb.org/t/p/original/emthp39XA2YScoYL1p0sdbAH2WA.jpg',
                type: 'flatrate'
            },
            {
                provider_id: 2,
                provider_name: 'Apple TV',
                logo_path: 'https://image.tmdb.org/t/p/original/peURlLlr8jggOwK53fJ5wdQl05y.jpg',
                type: 'buy'
            },
            {
                provider_id: 3,
                provider_name: 'Google Play Movies',
                logo_path: 'https://image.tmdb.org/t/p/original/tbEdFQDwx5LEVr8WpSeXQSIirVq.jpg',
                type: 'rent'
            }
        ];

        it('should compute watch providers from serie data', () => {
            const serieWithProviders = {
                ...mockSerie,
                watch_providers: mockWatchProviders
            };

            component['serie'].set(serieWithProviders);

            expect(component['watchProviders']()).toEqual(mockWatchProviders);
        });

        it('should return empty array when no watch providers', () => {
            component['serie'].set(mockSerie);

            expect(component['watchProviders']()).toEqual([]);
        });

        it('should compute hasWatchProviders correctly', () => {
            component['serie'].set(mockSerie);
            expect(component['hasWatchProviders']()).toBe(false);

            const serieWithProviders = {
                ...mockSerie,
                watch_providers: mockWatchProviders
            };
            component['serie'].set(serieWithProviders);
            expect(component['hasWatchProviders']()).toBe(true);
        });
    });

    describe('Videos', () => {
        const mockVideos: Video[] = [
            {
                key: 'dQw4w9WgXcQ',
                name: 'Official Trailer',
                type: 'Trailer',
                site: 'YouTube',
                size: 1080,
                official: true,
                published_at: '2024-01-15T10:00:00.000Z'
            },
            {
                key: 'abc123xyz',
                name: 'Behind the Scenes',
                type: 'Behind the Scenes',
                site: 'YouTube',
                size: 720,
                official: false,
                published_at: '2024-01-10T08:30:00.000Z'
            },
            {
                key: 'xyz456abc',
                name: 'Season Teaser',
                type: 'Teaser',
                site: 'YouTube',
                size: 1080,
                official: true,
                published_at: '2024-01-05T12:00:00.000Z'
            }
        ];

        it('should compute videos from serie data', () => {
            const serieWithVideos = {
                ...mockSerie,
                videos: mockVideos
            };

            component['serie'].set(serieWithVideos);

            expect(component['videos']()).toEqual(mockVideos);
            expect(component['videos']()).toHaveLength(3);
        });

        it('should return empty array when no videos', () => {
            component['serie'].set(mockSerie);

            expect(component['videos']()).toEqual([]);
        });

        it('should compute hasVideos correctly', () => {
            component['serie'].set(mockSerie);
            expect(component['hasVideos']()).toBe(false);

            const serieWithVideos = {
                ...mockSerie,
                videos: mockVideos
            };
            component['serie'].set(serieWithVideos);
            expect(component['hasVideos']()).toBe(true);
        });

        it('should filter official trailers', () => {
            const serieWithVideos = {
                ...mockSerie,
                videos: mockVideos
            };

            component['serie'].set(serieWithVideos);

            const trailers = component['officialTrailers']();
            expect(trailers).toHaveLength(1);
            expect(trailers[0].type).toBe('Trailer');
            expect(trailers[0].official).toBe(true);
            expect(trailers[0].name).toBe('Official Trailer');
        });
    });

    describe('Images', () => {
        const mockImages = {
            backdrops: [{
                file_path: '/backdrop1.jpg',
                width: 1920,
                height: 1080,
                aspect_ratio: 1.78,
                vote_average: 5.5,
                vote_count: 100,
                iso_639_1: null
            }],
            posters: [{
                file_path: '/poster1.jpg',
                width: 500,
                height: 750,
                aspect_ratio: 0.67,
                vote_average: 5,
                vote_count: 50,
                iso_639_1: 'en'
            }],
            logos: []
        };

        it('should compute images from serie data', () => {
            const serieWithImages = {
                ...mockSerie,
                images: mockImages
            };

            component['serie'].set(serieWithImages);

            expect(component['images']()).toEqual(mockImages);
        });

        it('should return null when no images', () => {
            component['serie'].set(mockSerie);

            expect(component['images']()).toBeNull();
        });

        it('should compute hasImages correctly', () => {
            component['serie'].set(mockSerie);
            expect(component['hasImages']()).toBe(false);

            const serieWithImages = {
                ...mockSerie,
                images: mockImages
            };
            component['serie'].set(serieWithImages);
            expect(component['hasImages']()).toBe(true);
        });

        it('should compute primaryBackdropUrl from images', () => {
            const serieWithImages = {
                ...mockSerie,
                images: mockImages
            };

            component['serie'].set(serieWithImages);

            expect(component['primaryBackdropUrl']()).toBe('/backdrop1.jpg');
        });

        it('should fallback to backdropUrl when no images', () => {
            component['serie'].set(mockSerie);

            expect(component['primaryBackdropUrl']()).toContain(mockSerie.backdrop_path);
        });
    });

    describe('Recommendations', () => {
        const mockRecommendations = [
            createMockSerie({
                id: 2,
                tmdb_id: 102,
                name: 'Better Call Saul',
                original_name: 'Better Call Saul',
                overview: 'A prequel to Breaking Bad',
                poster_path: '/poster2.jpg',
                backdrop_path: '/backdrop2.jpg',
                first_air_date: '2015-02-08',
                last_air_date: null,
                vote_average: 8.8,
                vote_count: 5000,
                status: SerieStatus.ENDED,
                number_of_seasons: 6,
                number_of_episodes: 63,
                popularity: 200
            })
        ];

        it('should compute recommendations from serie data', () => {
            const serieWithRecs = {
                ...mockSerie,
                recommendations: mockRecommendations
            };

            component['serie'].set(serieWithRecs);

            expect(component['recommendations']()).toEqual(mockRecommendations);
            expect(component['recommendations']()).toHaveLength(1);
        });

        it('should return empty array when no recommendations', () => {
            component['serie'].set(mockSerie);

            expect(component['recommendations']()).toEqual([]);
        });
    });

    describe('User Data', () => {
        const mockUserData = {
            is_following: true,
            followed_at: '2024-01-01T00:00:00Z',
            is_watched: false,
            watched_at: null,
            watched_episodes: [1, 2, 3],
            watched_seasons: [1]
        };

        it('should compute userSerieData from serie', () => {
            const serieWithUserData = {
                ...mockSerie,
                user_data: mockUserData
            };

            component['serie'].set(serieWithUserData);

            expect(component['userSerieData']()).toEqual(mockUserData);
        });

        it('should return null when no user data', () => {
            component['serie'].set(mockSerie);

            expect(component['userSerieData']()).toBeNull();
        });

        it('should compute watchedEpisodes from user data', () => {
            const serieWithUserData = {
                ...mockSerie,
                user_data: mockUserData
            };

            component['serie'].set(serieWithUserData);

            expect(component['watchedEpisodes']()).toEqual([1, 2, 3]);
        });

        it('should return empty array when no watched episodes', () => {
            component['serie'].set(mockSerie);

            expect(component['watchedEpisodes']()).toEqual([]);
        });

        it('should compute watchedSeasons from user data', () => {
            const serieWithUserData = {
                ...mockSerie,
                user_data: mockUserData
            };

            component['serie'].set(serieWithUserData);

            expect(component['watchedSeasons']()).toEqual([1]);
        });
    });

    describe('Season and Episode Status', () => {
        beforeEach(() => {
            const serieWithUserData = {
                ...mockSerie,
                user_data: {
                    is_following: true,
                    followed_at: '2024-01-01T00:00:00Z',
                    is_watched: false,
                    watched_at: null,
                    watched_episodes: [10, 20, 30],
                    watched_seasons: [1, 2]
                }
            };
            component['serie'].set(serieWithUserData);
        });

        it('should check if season is watched', () => {
            expect(component['isSeasonWatched'](1)).toBe(true);
            expect(component['isSeasonWatched'](2)).toBe(true);
            expect(component['isSeasonWatched'](3)).toBe(false);
        });

        it('should check if episode is watched', () => {
            expect(component['isEpisodeWatched'](10)).toBe(true);
            expect(component['isEpisodeWatched'](20)).toBe(true);
            expect(component['isEpisodeWatched'](99)).toBe(false);
        });

        it('should check season loading state', () => {
            expect(component['isSeasonLoading'](1)).toBe(false);

            const loadingMap = new Map<number, boolean>();
            loadingMap.set(1, true);
            component['seasonLoadingStates'].set(loadingMap);

            expect(component['isSeasonLoading'](1)).toBe(true);
            expect(component['isSeasonLoading'](2)).toBe(false);
        });

        it('should check episode loading state', () => {
            expect(component['isEpisodeLoading'](10)).toBe(false);

            const loadingMap = new Map<number, boolean>();
            loadingMap.set(10, true);
            component['episodeLoadingStates'].set(loadingMap);

            expect(component['isEpisodeLoading'](10)).toBe(true);
            expect(component['isEpisodeLoading'](20)).toBe(false);
        });
    });

    describe('goBack', () => {
        it('should navigate to home', () => {
            const router = TestBed.inject(Router);
            const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

            component['goBack']();

            expect(navigateSpy).toHaveBeenCalledWith(['/']);
        });
    });

    describe('Toggle Follow', () => {
        beforeEach(() => {
            mockAuthService.isAuthenticated.mockReturnValue(true);
            component['serie'].set(mockSerie);
            component['stats'].set(mockStats);
        });

        it('should not toggle follow when not authenticated', () => {
            mockAuthService.isAuthenticated.mockReturnValue(false);
            const initialLoading = component['followLoading']();

            component['onToggleFollow']();

            expect(component['followLoading']()).toBe(initialLoading);
        });

        it('should not toggle follow when no serie loaded', () => {
            component['serie'].set(null);

            component['onToggleFollow']();

            expect(component['followLoading']()).toBe(false);
        });

        it('should call followSerie when not following', () => {
            const followSpy = vi.fn().mockReturnValue(of(true));
            (mockSeriesService as unknown as { followSerie: typeof followSpy }).followSerie = followSpy;

            component['onToggleFollow']();

            expect(followSpy).toHaveBeenCalledWith(mockSerie.id);
        });

        it('should call unfollowSerie when already following', () => {
            const unfollowSpy = vi.fn().mockReturnValue(of(true));
            (mockSeriesService as unknown as { unfollowSerie: typeof unfollowSpy }).unfollowSerie = unfollowSpy;
            component['stats'].set({ ...mockStats, followedByCurrentUser: true });

            component['onToggleFollow']();

            expect(unfollowSpy).toHaveBeenCalledWith(mockSerie.id);
        });

        it('should update stats on successful follow', () => {
            const followSpy = vi.fn().mockReturnValue(of(true));
            (mockSeriesService as unknown as { followSerie: typeof followSpy }).followSerie = followSpy;

            component['onToggleFollow']();

            expect(component['isFollowing']()).toBe(true);
        });

        it('should handle follow error', () => {
            const followSpy = vi.fn().mockReturnValue(throwError(() => new Error('API Error')));
            (mockSeriesService as unknown as { followSerie: typeof followSpy }).followSerie = followSpy;

            component['onToggleFollow']();

            expect(component['followLoading']()).toBe(false);
        });
    });

    describe('Toggle Watched', () => {
        beforeEach(() => {
            mockAuthService.isAuthenticated.mockReturnValue(true);
            component['serie'].set({
                ...mockSerie,
                user_data: {
                    is_following: false,
                    followed_at: null,
                    is_watched: false,
                    watched_at: null,
                    watched_episodes: [],
                    watched_seasons: []
                }
            });
            component['stats'].set(mockStats);
        });

        it('should not toggle watched when not authenticated', () => {
            mockAuthService.isAuthenticated.mockReturnValue(false);

            component['onToggleWatched']();

            expect(component['watchedLoading']()).toBe(false);
        });

        it('should not toggle watched when no stats', () => {
            component['stats'].set(null);

            component['onToggleWatched']();

            expect(component['watchedLoading']()).toBe(false);
        });

        it('should call markSerieAsWatched when not watched', () => {
            const markSpy = vi.fn().mockReturnValue(of(true));
            (mockSeriesService as unknown as { markSerieAsWatched: typeof markSpy }).markSerieAsWatched = markSpy;

            component['onToggleWatched']();

            expect(markSpy).toHaveBeenCalled();
        });

        it('should call unmarkSerieAsWatched when already watched', () => {
            const unmarkSpy = vi.fn().mockReturnValue(of(true));
            (mockSeriesService as unknown as { unmarkSerieAsWatched: typeof unmarkSpy }).unmarkSerieAsWatched = unmarkSpy;
            component['stats'].set({ ...mockStats, watchedByCurrentUser: true });

            component['onToggleWatched']();

            expect(unmarkSpy).toHaveBeenCalled();
        });

        it('should revert on failure', () => {
            const markSpy = vi.fn().mockReturnValue(of(false));
            (mockSeriesService as unknown as { markSerieAsWatched: typeof markSpy }).markSerieAsWatched = markSpy;

            component['onToggleWatched']();

            expect(component['stats']()?.watchedByCurrentUser).toBe(false);
        });

        it('should handle watched error', () => {
            const markSpy = vi.fn().mockReturnValue(throwError(() => new Error('API Error')));
            (mockSeriesService as unknown as { markSerieAsWatched: typeof markSpy }).markSerieAsWatched = markSpy;

            component['onToggleWatched']();

            expect(component['watchedLoading']()).toBe(false);
            expect(component['stats']()?.watchedByCurrentUser).toBe(false);
        });
    });

    describe('Toggle Season Watched', () => {
        const mockSerieWithSeasons = {
            ...mockSerie,
            seasons: [
                {
                    id: 100,
                    season_number: 1,
                    name: 'Season 1',
                    overview: 'Season overview',
                    poster_path: '/season_poster.jpg',
                    air_date: '2023-01-01',
                    episode_count: 10,
                    episodes: [
                        { id: 1001, episode_number: 1, name: 'Ep 1', overview: '', still_path: '', air_date: '2023-01-01', season_number: 1, show_id: 1, vote_average: 8, vote_count: 100, episode_type: 'standard', runtime: 45 },
                        { id: 1002, episode_number: 2, name: 'Ep 2', overview: '', still_path: '', air_date: '2023-01-08', season_number: 1, show_id: 1, vote_average: 8, vote_count: 100, episode_type: 'standard', runtime: 45 }
                    ]
                }
            ],
            user_data: {
                is_following: true,
                followed_at: '2024-01-01',
                is_watched: false,
                watched_at: null,
                watched_episodes: [],
                watched_seasons: []
            }
        };

        beforeEach(() => {
            mockAuthService.isAuthenticated.mockReturnValue(true);
            component['serie'].set(mockSerieWithSeasons);
            component['stats'].set(mockStats);
        });

        it('should not toggle when not authenticated', () => {
            mockAuthService.isAuthenticated.mockReturnValue(false);

            component['onToggleSeasonWatched'](100);

            expect(component['isSeasonLoading'](100)).toBe(false);
        });

        it('should not toggle when no user data', () => {
            component['serie'].set(mockSerie);

            component['onToggleSeasonWatched'](100);

            expect(component['isSeasonLoading'](100)).toBe(false);
        });

        it('should mark season as watched', () => {
            const markSpy = vi.fn().mockReturnValue(of(true));
            (mockSeriesService as unknown as { markSeasonAsWatched: typeof markSpy }).markSeasonAsWatched = markSpy;

            component['onToggleSeasonWatched'](100);

            expect(markSpy).toHaveBeenCalled();
        });

        it('should unmark season as watched when already watched', () => {
            const unmarkSpy = vi.fn().mockReturnValue(of(true));
            (mockSeriesService as unknown as { unmarkSeasonAsWatched: typeof unmarkSpy }).unmarkSeasonAsWatched = unmarkSpy;

            const serieWithWatchedSeason = {
                ...mockSerieWithSeasons,
                user_data: {
                    ...mockSerieWithSeasons.user_data,
                    watched_seasons: [100]
                }
            };
            component['serie'].set(serieWithWatchedSeason);

            component['onToggleSeasonWatched'](100);

            expect(unmarkSpy).toHaveBeenCalled();
        });
    });

    describe('Toggle Episode Watched', () => {
        const mockSerieWithEpisodes = {
            ...mockSerie,
            seasons: [
                {
                    id: 100,
                    season_number: 1,
                    name: 'Season 1',
                    overview: 'Season overview',
                    poster_path: '/season_poster.jpg',
                    air_date: '2023-01-01',
                    episode_count: 2,
                    episodes: [
                        { id: 1001, episode_number: 1, name: 'Ep 1', overview: '', still_path: '', air_date: '2023-01-01', season_number: 1, show_id: 1, vote_average: 8, vote_count: 100, episode_type: 'standard', runtime: 45 },
                        { id: 1002, episode_number: 2, name: 'Ep 2', overview: '', still_path: '', air_date: '2023-01-08', season_number: 1, show_id: 1, vote_average: 8, vote_count: 100, episode_type: 'standard', runtime: 45 }
                    ]
                }
            ],
            user_data: {
                is_following: true,
                followed_at: '2024-01-01',
                is_watched: false,
                watched_at: null,
                watched_episodes: [],
                watched_seasons: []
            }
        };

        beforeEach(() => {
            mockAuthService.isAuthenticated.mockReturnValue(true);
            component['serie'].set(mockSerieWithEpisodes);
            component['stats'].set(mockStats);
        });

        it('should not toggle when not authenticated', () => {
            mockAuthService.isAuthenticated.mockReturnValue(false);

            component['onToggleEpisodeWatched'](1001);

            expect(component['isEpisodeLoading'](1001)).toBe(false);
        });

        it('should not toggle when no user data', () => {
            component['serie'].set(mockSerie);

            component['onToggleEpisodeWatched'](1001);

            expect(component['isEpisodeLoading'](1001)).toBe(false);
        });

        it('should mark episode as watched', () => {
            const markSpy = vi.fn().mockReturnValue(of(true));
            (mockSeriesService as unknown as { markEpisodeAsWatched: typeof markSpy }).markEpisodeAsWatched = markSpy;

            component['onToggleEpisodeWatched'](1001);

            expect(markSpy).toHaveBeenCalled();
        });

        it('should unmark episode as watched when already watched', () => {
            const unmarkSpy = vi.fn().mockReturnValue(of(true));
            (mockSeriesService as unknown as { unmarkEpisodeAsWatched: typeof unmarkSpy }).unmarkEpisodeAsWatched = unmarkSpy;

            const serieWithWatchedEpisode = {
                ...mockSerieWithEpisodes,
                user_data: {
                    ...mockSerieWithEpisodes.user_data,
                    watched_episodes: [1001]
                }
            };
            component['serie'].set(serieWithWatchedEpisode);

            component['onToggleEpisodeWatched'](1001);

            expect(unmarkSpy).toHaveBeenCalled();
        });

        it('should update watched episodes list', () => {
            const markSpy = vi.fn().mockReturnValue(of(true));
            (mockSeriesService as unknown as { markEpisodeAsWatched: typeof markSpy }).markEpisodeAsWatched = markSpy;
            (mockSeriesService as unknown as { markSeasonAsWatched: ReturnType<typeof vi.fn> }).markSeasonAsWatched = vi.fn().mockReturnValue(of(true));

            component['onToggleEpisodeWatched'](1001);

            expect(component['watchedEpisodes']()).toContain(1001);
        });
    });

    describe('formatRating', () => {
        it('should have formatRating function available', () => {
            expect(component['formatRating']).toBeDefined();
            expect(typeof component['formatRating']).toBe('function');
        });
    });
});
