import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

import { SerieDetailComponent } from './serie-detail.component';
import { SeriesService } from '../services/series.service';
import { AuthService } from '../services/auth.service';
import { MetadataService } from '../services/metadata.service';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';
import { Serie, SerieStatus } from '../models/serie.model';

describe('SerieDetailComponent', () => {
    let component: SerieDetailComponent;
    let mockSeriesService: {
        getSerieDetails: ReturnType<typeof vi.fn>;
        isSerieReallyFollowed: ReturnType<typeof vi.fn>;
    };
    let mockAuthService: {
        isAuthenticated: ReturnType<typeof vi.fn>;
        currentUser: ReturnType<typeof signal>;
    };
    let mockMetadataService: { updatePageMetadata: ReturnType<typeof vi.fn> };

    const mockSerie: Serie = {
        id: 1,
        tmdb_id: 101,
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
        data_complete: true,
        seasons: []
    };

    const mockStats = {
        followedByCurrentUser: false,
        watchedByCurrentUser: false,
        totalFollowers: 1000,
        seasons_count: 5,
        episodes_count: 62
    };

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

        mockAuthService = {
            isAuthenticated: vi.fn().mockReturnValue(false),
            currentUser: signal(null)
        };

        mockMetadataService = {
            updatePageMetadata: vi.fn()
        };

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
});
