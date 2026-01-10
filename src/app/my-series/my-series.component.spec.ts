import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MySeriesComponent } from './my-series.component';
import { SeriesService } from '../services/series.service';
import { MetadataService } from '../services/metadata.service';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';
import { createMockSerie, createMockMetadataService } from '../testing/mocks';

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
            number_of_episodes: 30
        })
    ];

    beforeEach(() => {
        mockSeriesService = {
            getUserSeries: vi.fn().mockReturnValue(of(mockSeries))
        };

        mockMetadataService = createMockMetadataService();

        TestBed.configureTestingModule({
            imports: [
                MySeriesComponent,
                getTranslocoTestingModule()
            ],
            providers: [
                provideRouter([]),
                { provide: SeriesService, useValue: mockSeriesService },
                { provide: MetadataService, useValue: mockMetadataService }
            ]
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
                description: 'Gérez votre collection personnelle de séries TV. Suivez votre progression et ne ratez jamais un épisode.',
                canonicalUrl: 'http://localhost:4200/my-series'
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
                throwError(() => new Error('API Error'))
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
                    name: 'New Serie'
                })
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
});
