import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { HomeComponent } from './home.component';
import { SeriesService } from '../services/series.service';
import { AuthService } from '../services/auth.service';
import { MetadataService } from '../services/metadata.service';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';
import { Serie, SerieStatus } from '../models/serie.model';
import { signal } from '@angular/core';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let mockSeriesService: {
        getPopularSeries: ReturnType<typeof vi.fn>;
        getTopRatedSeries: ReturnType<typeof vi.fn>;
    };
    let mockDialog: { open: ReturnType<typeof vi.fn> };
    let mockAuthService: {
        isAuthenticated: ReturnType<typeof vi.fn>;
        currentUser: ReturnType<typeof signal>;
        loading: ReturnType<typeof signal>;
    };
    let mockMetadataService: { updatePageMetadata: ReturnType<typeof vi.fn> };

    const mockSeries: Serie[] = [
        {
            id: 1,
            tmdb_id: 101,
            name: 'Test Serie 1',
            original_name: 'Test Serie 1',
            overview: 'Description 1',
            poster_path: '/poster1.jpg',
            backdrop_path: '/backdrop1.jpg',
            first_air_date: '2024-01-01',
            last_air_date: null,
            vote_average: 8.5,
            vote_count: 1000,
            status: SerieStatus.RETURNING,
            number_of_seasons: 1,
            number_of_episodes: 10,
            popularity: 100,
            data_complete: true
        }
    ];

    beforeEach(() => {
        mockSeriesService = {
            getPopularSeries: vi.fn().mockReturnValue(of(mockSeries)),
            getTopRatedSeries: vi.fn().mockReturnValue(of(mockSeries))
        };

        mockDialog = {
            open: vi.fn().mockReturnValue({
                afterClosed: vi.fn().mockReturnValue(of(null))
            })
        };

        mockAuthService = {
            isAuthenticated: vi.fn().mockReturnValue(false),
            currentUser: signal(null),
            loading: signal(false)
        };

        mockMetadataService = {
            updatePageMetadata: vi.fn()
        };

        TestBed.configureTestingModule({
            imports: [
                HomeComponent,
                getTranslocoTestingModule()
            ],
            providers: [
                provideRouter([]),
                { provide: SeriesService, useValue: mockSeriesService },
                { provide: MatDialog, useValue: mockDialog },
                { provide: AuthService, useValue: mockAuthService },
                { provide: MetadataService, useValue: mockMetadataService }
            ]
        });

        component = TestBed.createComponent(HomeComponent).componentInstance;
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should have initial signal values', () => {
            expect(component['popularSeries']()).toEqual([]);
            expect(component['loading']()).toBe(true);
            expect(component['loadingMore']()).toBe(false);
            expect(component['hasMore']()).toBe(true);

            expect(component['topRatedSeries']()).toEqual([]);
            expect(component['topRatedLoading']()).toBe(true);
            expect(component['topRatedLoadingMore']()).toBe(false);
            expect(component['topRatedHasMore']()).toBe(true);
        });
    });

    describe('ngOnInit', () => {
        it('should update metadata with translated values', () => {
            component.ngOnInit();

            expect(mockMetadataService.updatePageMetadata).toHaveBeenCalledWith({
                title: 'Suivi de Séries TV en Ligne - Gestion, Statistiques et Recommandations Gratuit',
                description: 'Gérez facilement votre collection de séries TV, suivez votre progression, découvrez les tendances et recevez des recommandations personnalisées. Suivi Séries vous aide à ne jamais rater un épisode et à explorer de nouvelles séries populaires, le tout gratuitement et sans publicité.',
                canonicalUrl: 'http://localhost:4200/'
            });
        });

        it('should load popular series', () => {
            component.ngOnInit();

            expect(mockSeriesService.getPopularSeries).toHaveBeenCalledWith(12, 1);
            expect(component['popularSeries']()).toEqual(mockSeries);
            expect(component['loading']()).toBe(false);
        });

        it('should load top rated series', () => {
            component.ngOnInit();

            expect(mockSeriesService.getTopRatedSeries).toHaveBeenCalledWith(12, 1);
            expect(component['topRatedSeries']()).toEqual(mockSeries);
            expect(component['topRatedLoading']()).toBe(false);
        });

        it('should handle errors when loading popular series', () => {
            mockSeriesService.getPopularSeries.mockReturnValue(
                throwError(() => new Error('API Error'))
            );

            component.ngOnInit();

            expect(component['popularSeries']()).toEqual([]);
            expect(component['loading']()).toBe(false);
        });

        it('should set hasMore to false when less than pageSize returned', () => {
            mockSeriesService.getPopularSeries.mockReturnValue(of([mockSeries[0]]));

            component.ngOnInit();

            expect(component['hasMore']()).toBe(false);
        });
    });

    describe('loadMoreSeries', () => {
        it('should exist and be callable', () => {
            component.ngOnInit();
            expect(() => component['loadMoreSeries']()).not.toThrow();
        });
    });

    describe('loadMoreTopRated', () => {
        it('should exist and be callable', () => {
            component.ngOnInit();
            expect(() => component['loadMoreTopRated']()).not.toThrow();
        });
    });

    describe('goToLogin', () => {
        it('should open login dialog', () => {
            component['goToLogin']();

            expect(mockDialog.open).toHaveBeenCalled();
        });

        it('should pass returnUrl to dialog', () => {
            component['goToLogin']('/my-series');

            expect(mockDialog.open).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    data: { returnUrl: '/my-series' }
                })
            );
        });
    });
});
