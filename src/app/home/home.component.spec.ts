import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NEVER, of, throwError } from 'rxjs';

import { HomeComponent } from './home.component';
import { SeriesService } from '../services/series.service';
import { AuthService } from '../services/auth.service';
import { MetadataService } from '../services/metadata.service';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';
import {
    createMockSerie,
    createMockAuthService,
    createMockMetadataService,
    createMockMatDialog,
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
            getTopRatedSeries: vi.fn().mockReturnValue(of(mockSeries)),
        };
    }

    beforeEach(() => {
        mockSeriesService = createMockSeriesService();
        mockDialog = createMockMatDialog();
        mockAuthService = createMockAuthService();
        mockMetadataService = createMockMetadataService();

        TestBed.configureTestingModule({
            imports: [HomeComponent, getTranslocoTestingModule()],
            providers: [
                provideRouter([]),
                { provide: SeriesService, useValue: mockSeriesService },
                { provide: MatDialog, useValue: mockDialog },
                { provide: AuthService, useValue: mockAuthService },
                { provide: MetadataService, useValue: mockMetadataService },
            ],
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
                title: 'Suivi de séries TV en ligne - Gestion, statistiques et recommandations gratuites',
                description:
                    'Gérez facilement votre collection de séries TV, suivez votre progression, découvrez les tendances et recevez des recommandations personnalisées. Suivi Séries vous aide à ne jamais rater un épisode et à explorer de nouvelles séries populaires, le tout gratuitement et sans publicité.',
                canonicalUrl: 'http://localhost:4200/',
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
                throwError(() => new Error('API Error')),
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
                name: `Test Serie ${i + 1}`,
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

            const newSeries = [
                {
                    ...mockSeries[0],
                    id: 999,
                    name: 'New Serie',
                },
            ];
            mockSeriesService.getPopularSeries.mockReturnValue(of(newSeries));

            component['loadMoreSeries']();

            expect(component['popularSeries']()).toHaveLength(initialCount + 1);
        });

        it('should handle errors gracefully', () => {
            mockSeriesService.getPopularSeries.mockReturnValue(
                throwError(() => new Error('Network error')),
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
                name: `Top Rated Serie ${i + 1}`,
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

            const newSeries = [
                {
                    ...mockSeries[0],
                    id: 999,
                    name: 'Top Rated New',
                },
            ];
            mockSeriesService.getTopRatedSeries.mockReturnValue(of(newSeries));

            component['loadMoreTopRated']();

            expect(component['topRatedSeries']()).toHaveLength(initialCount + 1);
        });

        it('should handle errors gracefully', () => {
            mockSeriesService.getTopRatedSeries.mockReturnValue(
                throwError(() => new Error('Network error')),
            );

            component['loadMoreTopRated']();

            expect(component['topRatedLoadingMore']()).toBe(false);
        });
    });

    describe('Headliners', () => {
        const land = (popular: ReturnType<typeof createMockSerie>[], topRated = popular) => {
            component['popularSeries'].set(popular);
            component['topRatedSeries'].set(topRated);
            component['loading'].set(false);
            component['topRatedLoading'].set(false);
        };

        it('should feature the most popular serie as the trend, in the API order', () => {
            land(
                [
                    createMockSerie({ id: 5, backdrop_path: '/b5.jpg', vote_average: 8.0 }),
                    createMockSerie({ id: 3, backdrop_path: '/b3.jpg', vote_average: 9.0 }),
                ],
                [],
            );

            expect(component['trendingSerie']()?.id).toBe(5);
        });

        it('should pass over entries that cannot carry a headline', () => {
            land(
                [
                    createMockSerie({ id: 1, name: 'Talk show', vote_average: 5.1 }),
                    createMockSerie({ id: 2, backdrop_path: '', vote_average: 9.1 }),
                    createMockSerie({ id: 3, backdrop_path: '/b3.jpg', vote_average: 8.0 }),
                ],
                [],
            );

            expect(component['trendingSerie']()?.id).toBe(3);
        });

        it('should never show the trending serie in the hero as well', () => {
            land(
                [
                    createMockSerie({ id: 1, backdrop_path: '/b1.jpg', vote_average: 8.1 }),
                    createMockSerie({ id: 2, backdrop_path: '/b2.jpg', vote_average: 8.2 }),
                    createMockSerie({ id: 3, backdrop_path: '/b3.jpg', vote_average: 8.3 }),
                ],
                [],
            );

            for (let day = 0; day < 6; day++) {
                component['dayIndex'].set(day);

                expect(component['spotlightSerie']()).not.toBeNull();
                expect(component['spotlightSerie']()?.id).not.toBe(
                    component['trendingSerie']()?.id,
                );
            }
        });

        it('should leave the hero to its gradient when the trend is the only candidate', () => {
            land([createMockSerie({ id: 1, backdrop_path: '/b1.jpg', vote_average: 8.1 })], []);

            expect(component['trendingSerie']()?.id).toBe(1);
            expect(component['spotlightSerie']()).toBeNull();
        });

        it('should keep the ranking whole and let the rail give way instead', () => {
            const popular = [
                createMockSerie({ id: 1, backdrop_path: '/b1.jpg', vote_average: 8.1 }),
                createMockSerie({ id: 2, backdrop_path: '/b2.jpg', vote_average: 6.0 }),
                createMockSerie({ id: 3, backdrop_path: '/b3.jpg', vote_average: 8.5 }),
                createMockSerie({ id: 7, backdrop_path: '/b7.jpg', vote_average: 9.0 }),
            ];
            const topRated = [
                createMockSerie({ id: 7, backdrop_path: '/b7.jpg', vote_average: 9.0 }),
                createMockSerie({ id: 8, backdrop_path: '/b8.jpg', vote_average: 9.4 }),
            ];
            land(popular, topRated);

            // 1 trends. 7 and 8 rank, so neither can take the hero: 3 is the only
            // candidate left, however well rated the other two are.
            expect(component['trendingSerie']()?.id).toBe(1);
            expect(component['spotlightSerie']()?.id).toBe(3);
            // 7 is both popular and ranked: it keeps its place in the ranking
            // and leaves the rail, along with both headliners.
            expect(component['railSeries']().map((serie) => serie.id)).toEqual([2]);
            expect(component['topRatedSeries']().map((serie) => serie.id)).toEqual([7, 8]);
        });

        it('should hold both picks back until both lists have landed', () => {
            component['popularSeries'].set([
                createMockSerie({ id: 1, backdrop_path: '/b1.jpg', vote_average: 8.1 }),
            ]);
            component['loading'].set(false);

            expect(component['trendingSerie']()).toBeNull();
            expect(component['spotlightSerie']()).toBeNull();
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
                    data: { returnUrl: '/my-series' },
                }),
            );
        });

        it('should configure dialog with correct options', () => {
            component['goToLogin']();

            expect(mockDialog.open).toHaveBeenCalledWith(
                LoginComponent,
                expect.objectContaining({
                    width: '540px',
                    maxWidth: '90vw',
                    autoFocus: true,
                }),
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
                imports: [HomeComponent, getTranslocoTestingModule()],
                providers: [
                    provideRouter([]),
                    {
                        provide: ActivatedRoute,
                        useValue: {
                            queryParams: of({ login: 'true' }),
                        },
                    },
                    { provide: SeriesService, useValue: mockSeriesService },
                    { provide: MatDialog, useValue: mockDialog },
                    { provide: AuthService, useValue: mockAuthService },
                    { provide: MetadataService, useValue: mockMetadataService },
                ],
            });

            const fixture = TestBed.createComponent(HomeComponent);
            fixture.componentInstance.ngOnInit();

            expect(mockDialog.open).not.toHaveBeenCalled();
        });
    });
    describe('Featured serie rotation', () => {
        // A pool wide enough that a rotation is observable, mixing a headliner
        // with the kind of entry the rating floor is meant to reject.
        const popular = [
            createMockSerie({ id: 10, name: 'Silo', vote_average: 8.2 }),
            createMockSerie({ id: 20, name: 'Tagesschau', vote_average: 6.8 }),
            createMockSerie({ id: 30, name: 'House of the Dragon', vote_average: 8.4 }),
            createMockSerie({ id: 40, name: 'Sans image', vote_average: 9, backdrop_path: '' }),
            createMockSerie({ id: 70, name: 'Severance', vote_average: 8.4 }),
            createMockSerie({ id: 60, name: 'The Bear', vote_average: 8.1 }),
        ];
        const topRated = [
            createMockSerie({ id: 30, name: 'House of the Dragon', vote_average: 8.4 }),
            createMockSerie({ id: 50, name: 'Breaking Bad', vote_average: 8.9 }),
        ];

        // The day is captured when the component is constructed, so the clock
        // has to be set before the component exists.
        const bootWith = (pop = popular, top = topRated) => {
            mockSeriesService.getPopularSeries.mockReturnValue(of(pop));
            mockSeriesService.getTopRatedSeries.mockReturnValue(of(top));
            component = TestBed.createComponent(HomeComponent).componentInstance;
            component.ngOnInit();
        };

        const onDay = (iso: string) => {
            vi.setSystemTime(new Date(iso));
        };

        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should draw the pool from the popular list, leaving out the trend and the ranking', () => {
            onDay('2026-03-01T10:00:00');
            bootWith();

            const ids = component['spotlightCandidates']().map((serie) => serie.id);

            // Silo (10) leads the popular list, so it is the trend, not a
            // candidate. House of the Dragon (30) is popular but also ranks, and
            // Breaking Bad (50) only ranks: the ranking keeps both.
            expect(component['trendingSerie']()?.id).toBe(10);
            expect(ids).toEqual([60, 70]);
        });

        it('should reject series below the rating floor, which is what keeps news shows off the front page', () => {
            onDay('2026-03-01T10:00:00');
            bootWith();

            const names = component['spotlightCandidates']().map((serie) => serie.name);

            expect(names).not.toContain('Tagesschau');
        });

        it('should reject series with no wide artwork', () => {
            onDay('2026-03-01T10:00:00');
            bootWith();

            expect(component['spotlightCandidates']().map((serie) => serie.id)).not.toContain(40);
        });

        it('should keep the same pick throughout a day, so nothing swaps on reload', () => {
            onDay('2026-03-01T08:00:00');
            bootWith();
            const morning = component['spotlightSerie']()?.id;

            onDay('2026-03-01T23:30:00');
            const night = component['spotlightSerie']()?.id;

            expect(morning).toBeDefined();
            expect(night).toBe(morning);
        });

        it('should move to another serie the next day', () => {
            onDay('2026-03-01T10:00:00');
            bootWith();
            const today = component['spotlightSerie']()?.id;

            onDay('2026-03-02T10:00:00');
            bootWith();
            const tomorrow = component['spotlightSerie']()?.id;

            expect(today).toBeDefined();
            expect(tomorrow).not.toBe(today);
        });

        it('should walk the whole pool before repeating', () => {
            const seen = new Set<number | undefined>();

            for (let day = 1; day <= 2; day++) {
                onDay(`2026-03-0${day}T10:00:00`);
                bootWith();
                seen.add(component['spotlightSerie']()?.id);
            }

            // Two candidates are left once the trend is set aside, so two days
            // give two different headliners before the sequence comes round.
            expect(seen.size).toBe(2);
        });

        it('should hold back the pick until both lists have landed', () => {
            onDay('2026-03-01T10:00:00');
            component = TestBed.createComponent(HomeComponent).componentInstance;

            // ngOnInit not called: both lists are still marked as loading.
            expect(component['spotlightSerie']()).toBeNull();
        });

        it('should not change when more pages are appended', () => {
            onDay('2026-03-01T10:00:00');
            bootWith();
            const before = component['spotlightSerie']()?.id;

            mockSeriesService.getPopularSeries.mockReturnValue(
                of([createMockSerie({ id: 99, name: 'Page deux', vote_average: 9.9 })]),
            );
            component['loadMoreSeries']();
            // A later ranking page that happens to list the hero leaves it alone
            mockSeriesService.getTopRatedSeries.mockReturnValue(
                of([createMockSerie({ id: before, vote_average: 8.4 })]),
            );
            component['loadMoreTopRated']();

            expect(component['spotlightSerie']()?.id).toBe(before);
        });

        it('should return nothing when no serie clears the bar', () => {
            onDay('2026-03-01T10:00:00');
            bootWith([createMockSerie({ id: 1, vote_average: 3 })], []);

            expect(component['spotlightSerie']()).toBeNull();
        });

        it('should never take the hero from the ranking, which stays whole', () => {
            for (let day = 1; day <= 4; day++) {
                onDay(`2026-03-0${day}T10:00:00`);
                bootWith();

                const spotlightId = component['spotlightSerie']()?.id;
                const rankedIds = component['topRatedSeries']().map((serie) => serie.id);

                expect(spotlightId).toBeDefined();
                expect(rankedIds).toEqual([30, 50]);
                expect(rankedIds).not.toContain(spotlightId);
            }
        });
    });

    describe('Template', () => {
        // Popular entries clear the feature rating floor and top-rated ones do
        // not, and the two pages share no id unless a test says so, so the
        // counts below stay deterministic whatever the day of the rotation.
        const popularPage = (count: number, firstId = 1) =>
            Array.from({ length: count }, (_, index) =>
                createMockSerie({
                    id: firstId + index,
                    name: `Popular ${firstId + index}`,
                    backdrop_path: '/backdrop.jpg',
                    vote_average: 8.2,
                }),
            );
        const topRatedPage = (count: number) =>
            Array.from({ length: count }, (_, index) =>
                createMockSerie({ id: 100 + index, name: `Top ${index}`, vote_average: 7 }),
            );

        const render = () => {
            const fixture = TestBed.createComponent(HomeComponent);
            fixture.detectChanges();
            return fixture;
        };

        it('should show placeholders while the lists load', () => {
            mockSeriesService.getPopularSeries.mockReturnValue(NEVER);
            mockSeriesService.getTopRatedSeries.mockReturnValue(NEVER);

            const fixture = render();

            // The page mirrors its loaded layout: one feature and a row of
            // posters, then a full page of the ranking grid.
            expect(fixture.nativeElement.querySelectorAll('.skeleton-feature')).toHaveLength(1);
            expect(fixture.nativeElement.querySelectorAll('.skeleton-rail .skeleton')).toHaveLength(
                6,
            );
            expect(fixture.nativeElement.querySelectorAll('.skeleton-grid .skeleton')).toHaveLength(
                12,
            );
            expect(fixture.nativeElement.querySelector('app-featured-serie')).toBeNull();
        });

        it('should keep the first band skeleton until both lists have landed', () => {
            mockSeriesService.getPopularSeries.mockReturnValue(of(popularPage(12)));
            mockSeriesService.getTopRatedSeries.mockReturnValue(NEVER);

            const fixture = render();

            expect(fixture.nativeElement.querySelector('.skeleton-feature')).toBeTruthy();
            expect(fixture.nativeElement.querySelector('app-serie-rail')).toBeNull();
        });

        it('should headline two different series and keep both out of the rail', () => {
            mockSeriesService.getPopularSeries.mockReturnValue(of(popularPage(12)));
            mockSeriesService.getTopRatedSeries.mockReturnValue(of(topRatedPage(12)));

            const fixture = render();
            const element: HTMLElement = fixture.nativeElement;

            const trending = element.querySelector('app-featured-serie h3')?.textContent?.trim();
            const spotlight = element.querySelector('.hero-credit-name')?.textContent?.trim();

            expect(trending).toBe('Popular 1');
            expect(spotlight).toBeTruthy();
            expect(spotlight).not.toBe(trending);
            expect(element.querySelectorAll('app-serie-rail app-serie-card')).toHaveLength(10);
            expect(element.querySelectorAll('app-ranked-series li')).toHaveLength(12);
        });

        it('should rank a serie that is also popular in its place, and drop it from the rail', () => {
            const shared = popularPage(1, 5)[0];
            mockSeriesService.getPopularSeries.mockReturnValue(of(popularPage(12)));
            mockSeriesService.getTopRatedSeries.mockReturnValue(of([shared, ...topRatedPage(11)]));

            const fixture = render();
            const element: HTMLElement = fixture.nativeElement;
            const titles = (selector: string) =>
                [...element.querySelectorAll(`${selector} .series-title`)].map((title) =>
                    title.textContent?.trim(),
                );

            expect(element.querySelectorAll('app-ranked-series li')).toHaveLength(12);
            expect(titles('app-ranked-series')[0]).toBe('Popular 5');
            expect(titles('app-serie-rail')).not.toContain('Popular 5');
            expect(element.querySelector('.hero-credit-name')?.textContent?.trim()).not.toBe(
                'Popular 5',
            );
        });

        it('should give the rail the whole band when nothing can trend', () => {
            mockSeriesService.getPopularSeries.mockReturnValue(of(topRatedPage(12)));
            mockSeriesService.getTopRatedSeries.mockReturnValue(of(topRatedPage(5)));

            const fixture = render();
            const bento = fixture.nativeElement.querySelector('.trending-bento');

            expect(fixture.nativeElement.querySelector('app-featured-serie')).toBeNull();
            expect(bento.classList.contains('trending-bento--rail-only')).toBe(true);
        });

        it('should offer "load more" on both lists after a full page', () => {
            mockSeriesService.getPopularSeries.mockReturnValue(of(popularPage(12)));
            mockSeriesService.getTopRatedSeries.mockReturnValue(of(topRatedPage(12)));

            const fixture = render();

            expect(fixture.nativeElement.querySelectorAll('button.load-more')).toHaveLength(2);
        });

        it('should hide "load more" once a partial page reveals the end of a list', () => {
            mockSeriesService.getPopularSeries.mockReturnValue(of(popularPage(5)));
            mockSeriesService.getTopRatedSeries.mockReturnValue(of(topRatedPage(5)));

            const fixture = render();

            expect(fixture.nativeElement.querySelector('button.load-more')).toBeNull();
        });

        it('should request the next popular page from the rail button', () => {
            mockSeriesService.getPopularSeries.mockReturnValue(of(popularPage(12)));
            mockSeriesService.getTopRatedSeries.mockReturnValue(of(topRatedPage(5)));
            const fixture = render();

            mockSeriesService.getPopularSeries.mockReturnValue(NEVER);
            const tile: HTMLButtonElement = fixture.nativeElement.querySelector(
                'app-serie-rail button.rail-more',
            );
            tile.click();
            fixture.detectChanges();

            expect(mockSeriesService.getPopularSeries).toHaveBeenLastCalledWith(12, 2);
            // The tile stays in place and turns into a spinner, rather than
            // vanishing and shifting the rail while the page loads.
            expect(tile.disabled).toBe(true);
            expect(tile.querySelector('mat-progress-spinner')).toBeTruthy();
        });

        it('should close the rail with the "load more" tile, after the last poster', () => {
            mockSeriesService.getPopularSeries.mockReturnValue(of(popularPage(12)));
            mockSeriesService.getTopRatedSeries.mockReturnValue(of(topRatedPage(5)));

            const fixture = render();
            const rail = fixture.nativeElement.querySelector('.serie-rail');

            expect(rail.lastElementChild.classList.contains('rail-more')).toBe(true);
        });

        it('should request the next top-rated page from the ranking button', () => {
            mockSeriesService.getPopularSeries.mockReturnValue(of(popularPage(5)));
            mockSeriesService.getTopRatedSeries.mockReturnValue(of(topRatedPage(12)));
            const fixture = render();

            mockSeriesService.getTopRatedSeries.mockReturnValue(NEVER);
            const button: HTMLButtonElement = fixture.nativeElement.querySelector(
                '.load-more-row button.load-more',
            );
            button.click();
            fixture.detectChanges();

            expect(mockSeriesService.getTopRatedSeries).toHaveBeenLastCalledWith(12, 2);
            expect(button.disabled).toBe(true);
            expect(button.querySelector('mat-progress-spinner')).toBeTruthy();
        });
    });
});
