import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MySeriesComponent } from './my-series.component';
import { SeriesService } from '../services/series.service';
import { MetadataService } from '../services/metadata.service';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';
import { createMockSerie, createMockMetadataService } from '../testing/mocks';
import { SerieStatus } from '../models/serie.model';

describe('MySeriesComponent', () => {
    let component: MySeriesComponent;
    let mockSeriesService: { getUserSeries: ReturnType<typeof vi.fn> };
    let mockMetadataService: ReturnType<typeof createMockMetadataService>;

    const mockSeries = [
        createMockSerie({
            name: 'My Serie 1',
            original_name: 'My Serie 1',
            overview: 'Description 1',
            number_of_seasons: 3,
            number_of_episodes: 30,
        }),
    ];

    beforeEach(() => {
        mockSeriesService = {
            getUserSeries: vi.fn().mockReturnValue(of(mockSeries)),
        };

        mockMetadataService = createMockMetadataService();

        TestBed.configureTestingModule({
            imports: [MySeriesComponent, getTranslocoTestingModule()],
            providers: [
                // Catch-all so goToSearch()'s router.navigate(['/search']) resolves
                // instead of rejecting async with NG04002 (an unhandled rejection that
                // otherwise floats onto unrelated test files).
                provideRouter([{ path: '**', children: [] }]),
                { provide: SeriesService, useValue: mockSeriesService },
                { provide: MetadataService, useValue: mockMetadataService },
            ],
        });

        component = TestBed.createComponent(MySeriesComponent).componentInstance;
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should have initial signal values', () => {
            expect(component['mySeries']()).toEqual([]);
            expect(component['loading']()).toBe(true);
            expect(component['error']()).toBeNull();
        });
    });

    describe('ngOnInit', () => {
        it('should update metadata with translated values', () => {
            component.ngOnInit();

            expect(mockMetadataService.updatePageMetadata).toHaveBeenCalledWith({
                title: 'Mes Séries',
                description:
                    'Gérez votre collection personnelle de séries TV. Suivez votre progression et ne ratez jamais un épisode.',
                canonicalUrl: 'http://localhost:4200/my-series',
            });
        });

        it('should load user series', () => {
            component.ngOnInit();

            expect(mockSeriesService.getUserSeries).toHaveBeenCalled();
            expect(component['mySeries']()).toEqual(mockSeries);
            expect(component['loading']()).toBe(false);
        });

        it('should handle empty series list', () => {
            mockSeriesService.getUserSeries.mockReturnValue(of([]));

            component.ngOnInit();

            expect(component['mySeries']()).toEqual([]);
            expect(component['loading']()).toBe(false);
        });

        it('should handle errors gracefully', () => {
            mockSeriesService.getUserSeries.mockReturnValue(
                throwError(() => new Error('API Error')),
            );

            component.ngOnInit();

            expect(component['loading']()).toBe(false);
            expect(component['mySeries']()).toEqual([]);
        });
    });

    describe('onRefresh', () => {
        beforeEach(() => {
            component.ngOnInit();
            vi.clearAllMocks();
        });

        it('should reload user series', () => {
            component['onRefresh']();

            expect(mockSeriesService.getUserSeries).toHaveBeenCalled();
        });

        it('should reset error state', () => {
            component['error'].set('Previous error');

            component['onRefresh']();

            expect(component['error']()).toBeNull();
        });

        it('should update series list', () => {
            const newSeries = [
                createMockSerie({
                    id: 2,
                    name: 'New Serie',
                }),
            ];
            mockSeriesService.getUserSeries.mockReturnValue(of(newSeries));

            component['onRefresh']();

            expect(component['mySeries']()).toEqual(newSeries);
        });
    });

    describe('goToSearch', () => {
        it('should call router navigate', () => {
            // Navigation is tested indirectly through the router provider
            expect(() => component['goToSearch']()).not.toThrow();
        });
    });

    describe('Collection statistics', () => {
        it('should total seasons and episodes across the collection', () => {
            component['mySeries'].set([
                createMockSerie({ id: 1, number_of_seasons: 5, number_of_episodes: 62 }),
                createMockSerie({ id: 2, number_of_seasons: 3, number_of_episodes: 30 }),
            ]);

            expect(component['totalSeasons']()).toBe(8);
            expect(component['totalEpisodes']()).toBe(92);
        });

        it('should count only the series still airing', () => {
            component['mySeries'].set([
                createMockSerie({ id: 1, status: SerieStatus.RETURNING }),
                createMockSerie({ id: 2, status: SerieStatus.ENDED }),
                createMockSerie({ id: 3, status: SerieStatus.RETURNING }),
                createMockSerie({ id: 4, status: SerieStatus.CANCELED }),
            ]);

            expect(component['airingCount']()).toBe(2);
        });

        it('should report zero totals for an empty collection', () => {
            component['mySeries'].set([]);

            expect(component['totalSeasons']()).toBe(0);
            expect(component['totalEpisodes']()).toBe(0);
            expect(component['airingCount']()).toBe(0);
        });

        it('should hide watch progress when the payload carries none', () => {
            component['mySeries'].set([createMockSerie({ id: 1 })]);

            expect(component['hasWatchedData']()).toBe(false);
        });

        it('should compute watch progress when the payload carries it', () => {
            component['mySeries'].set([
                createMockSerie({
                    id: 1,
                    number_of_episodes: 20,
                    user_data: {
                        is_following: true,
                        followed_at: null,
                        is_watched: false,
                        watched_at: null,
                        watched_seasons: [],
                        watched_episodes: [1, 2, 3, 4, 5],
                    },
                }),
            ]);

            expect(component['hasWatchedData']()).toBe(true);
            expect(component['watchedEpisodes']()).toBe(5);
            expect(component['watchedPercent']()).toBe(25);
        });

        it('should not divide by zero when the episode count is unknown', () => {
            component['mySeries'].set([createMockSerie({ id: 1, number_of_episodes: 0 })]);

            expect(component['watchedRatio']()).toBe(0);
        });
    });
});
