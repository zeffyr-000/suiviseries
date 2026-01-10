import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { HomeComponent } from './home.component';
import { SeriesService } from '../services/series.service';
import { AuthService } from '../services/auth.service';
import { MetadataService } from '../services/metadata.service';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';
import {
    createMockSerie,
    createMockAuthService,
    createMockMetadataService,
    createMockMatDialog
} from '../testing/mocks';
import { LoginComponent } from '../login/login.component';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let mockSeriesService: ReturnType<typeof createMockSeriesService>;
    let mockDialog: ReturnType<typeof createMockMatDialog>;
    let mockAuthService: ReturnType<typeof createMockAuthService>;
    let mockMetadataService: ReturnType<typeof createMockMetadataService>;

    const mockSeries = [createMockSerie({ name: 'Test Serie 1' })];

    function createMockSeriesService() {
        return {
            getPopularSeries: vi.fn().mockReturnValue(of(mockSeries)),
            getTopRatedSeries: vi.fn().mockReturnValue(of(mockSeries))
        };
    }

    beforeEach(() => {
        mockSeriesService = createMockSeriesService();
        mockDialog = createMockMatDialog();
        mockAuthService = createMockAuthService();
        mockMetadataService = createMockMetadataService();

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
        beforeEach(() => {
            // Return pageSize items so hasMore remains true
            const fullPageSeries = new Array(12).fill(null).map((_, i) => ({
                ...mockSeries[0],
                id: i + 1,
                name: `Test Serie ${i + 1}`
            }));
            mockSeriesService.getPopularSeries.mockReturnValue(of(fullPageSeries));
            component.ngOnInit();
        });

        it('should exist and be callable', () => {
            expect(() => component['loadMoreSeries']()).not.toThrow();
        });

        it('should not load more when already loading', () => {
            component['loadingMore'].set(true);
            mockSeriesService.getPopularSeries.mockClear();

            component['loadMoreSeries']();

            expect(mockSeriesService.getPopularSeries).not.toHaveBeenCalled();
        });

        it('should not load more when no more series available', () => {
            component['hasMore'].set(false);
            mockSeriesService.getPopularSeries.mockClear();

            component['loadMoreSeries']();

            expect(mockSeriesService.getPopularSeries).not.toHaveBeenCalled();
        });

        it('should load next page of series', () => {
            // After ngOnInit, hasMore should be true
            expect(component['hasMore']()).toBe(true);
            mockSeriesService.getPopularSeries.mockClear();

            const nextPageSeries = [{ ...mockSeries[0], id: 100, name: 'Next Page Serie' }];
            mockSeriesService.getPopularSeries.mockReturnValue(of(nextPageSeries));

            component['loadMoreSeries']();

            expect(mockSeriesService.getPopularSeries).toHaveBeenCalledWith(12, 2);
        });

        it('should set loadingMore during fetch', () => {
            mockSeriesService.getPopularSeries.mockReturnValue(of(mockSeries));

            component['loadMoreSeries']();

            // After completion loadingMore should be false
            expect(component['loadingMore']()).toBe(false);
        });

        it('should append new series to existing list', () => {
            const initialCount = component['popularSeries']().length;
            mockSeriesService.getPopularSeries.mockClear();

            const newSeries = [{
                ...mockSeries[0],
                id: 999,
                name: 'New Serie'
            }];
            mockSeriesService.getPopularSeries.mockReturnValue(of(newSeries));

            component['loadMoreSeries']();

            expect(component['popularSeries']()).toHaveLength(initialCount + 1);
        });

        it('should handle errors gracefully', () => {
            mockSeriesService.getPopularSeries.mockReturnValue(
                throwError(() => new Error('Network error'))
            );

            component['loadMoreSeries']();

            expect(component['loadingMore']()).toBe(false);
        });
    });

    describe('loadMoreTopRated', () => {
        beforeEach(() => {
            // Return pageSize items so hasMore remains true
            const fullPageSeries = new Array(12).fill(null).map((_, i) => ({
                ...mockSeries[0],
                id: i + 1,
                name: `Top Rated Serie ${i + 1}`
            }));
            mockSeriesService.getPopularSeries.mockReturnValue(of(fullPageSeries));
            mockSeriesService.getTopRatedSeries.mockReturnValue(of(fullPageSeries));
            component.ngOnInit();
        });

        it('should exist and be callable', () => {
            expect(() => component['loadMoreTopRated']()).not.toThrow();
        });

        it('should not load more when already loading', () => {
            component['topRatedLoadingMore'].set(true);
            mockSeriesService.getTopRatedSeries.mockClear();

            component['loadMoreTopRated']();

            expect(mockSeriesService.getTopRatedSeries).not.toHaveBeenCalled();
        });

        it('should not load more when no more series available', () => {
            component['topRatedHasMore'].set(false);
            mockSeriesService.getTopRatedSeries.mockClear();

            component['loadMoreTopRated']();

            expect(mockSeriesService.getTopRatedSeries).not.toHaveBeenCalled();
        });

        it('should load next page of top rated series', () => {
            // After ngOnInit, topRatedHasMore should be true
            expect(component['topRatedHasMore']()).toBe(true);
            mockSeriesService.getTopRatedSeries.mockClear();

            const nextPageSeries = [{ ...mockSeries[0], id: 100, name: 'Next Top Rated' }];
            mockSeriesService.getTopRatedSeries.mockReturnValue(of(nextPageSeries));

            component['loadMoreTopRated']();

            expect(mockSeriesService.getTopRatedSeries).toHaveBeenCalledWith(12, 2);
        });

        it('should append new series to existing list', () => {
            const initialCount = component['topRatedSeries']().length;
            mockSeriesService.getTopRatedSeries.mockClear();

            const newSeries = [{
                ...mockSeries[0],
                id: 999,
                name: 'Top Rated New'
            }];
            mockSeriesService.getTopRatedSeries.mockReturnValue(of(newSeries));

            component['loadMoreTopRated']();

            expect(component['topRatedSeries']()).toHaveLength(initialCount + 1);
        });

        it('should handle errors gracefully', () => {
            mockSeriesService.getTopRatedSeries.mockReturnValue(
                throwError(() => new Error('Network error'))
            );

            component['loadMoreTopRated']();

            expect(component['topRatedLoadingMore']()).toBe(false);
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

        it('should configure dialog with correct options', () => {
            component['goToLogin']();

            expect(mockDialog.open).toHaveBeenCalledWith(
                LoginComponent,
                expect.objectContaining({
                    width: '400px',
                    disableClose: false,
                    autoFocus: true
                })
            );
        });
    });

    describe('checkForAutoLogin', () => {
        it('should not open login dialog when not in query params', () => {
            component.ngOnInit();

            // Default route has no login param
            expect(mockDialog.open).not.toHaveBeenCalled();
        });

        it('should not open login dialog when already authenticated', () => {
            mockAuthService.isAuthenticated.mockReturnValue(true);

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [
                    HomeComponent,
                    getTranslocoTestingModule()
                ],
                providers: [
                    provideRouter([]),
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            queryParams: of({ login: 'true' })
                        }
                    },
                    { provide: SeriesService, useValue: mockSeriesService },
                    { provide: MatDialog, useValue: mockDialog },
                    { provide: AuthService, useValue: mockAuthService },
                    { provide: MetadataService, useValue: mockMetadataService }
                ]
            });

            const fixture = TestBed.createComponent(HomeComponent);
            fixture.componentInstance.ngOnInit();

            expect(mockDialog.open).not.toHaveBeenCalled();
        });
    });
});
