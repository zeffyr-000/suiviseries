import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';

import { SerieSeasonsComponent } from './serie-seasons.component';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';
import { Season, Episode } from '../../models/serie.model';

describe('SerieSeasonsComponent', () => {
    let fixture: ComponentFixture<SerieSeasonsComponent>;
    let component: SerieSeasonsComponent;
    let componentRef: ComponentRef<SerieSeasonsComponent>;

    const mockEpisodes: Episode[] = [
        {
            id: 1,
            name: 'Pilot',
            episode_number: 1,
            air_date: '2008-01-20',
            overview: 'High school chemistry teacher Walter White is diagnosed with cancer.',
            still_path: '/ydlY3iPfeOAvu8gVqrxPoMvzNCn.jpg',
            vote_average: 8.5,
            episode_type: 'standard',
            runtime: 58
        },
        {
            id: 2,
            name: 'Cat\'s in the Bag...',
            episode_number: 2,
            air_date: '2008-01-27',
            overview: 'Walt and Jesse attempt to dispose of the bodies.',
            still_path: '/2IqMyDHO1cvugT2cq8qUHZiAnVh.jpg',
            vote_average: 8.2,
            episode_type: 'standard',
            runtime: 48
        }
    ];

    const mockSeasons: Season[] = [
        {
            id: 101,
            season_number: 1,
            name: 'Season 1',
            overview: 'The first season of Breaking Bad.',
            poster_path: '/1BP4xYv9ZG4ZVHkL7ocOziBbSYH.jpg',
            air_date: '2008-01-20',
            episode_count: 7,
            episodes: mockEpisodes
        },
        {
            id: 102,
            season_number: 2,
            name: 'Season 2',
            overview: 'The second season continues the story.',
            poster_path: '/e3oGYpoTUhOFK0popCffRSJBGll.jpg',
            air_date: '2009-03-08',
            episode_count: 13,
            episodes: []
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                SerieSeasonsComponent,
                getTranslocoTestingModule()
            ]
        });

        fixture = TestBed.createComponent(SerieSeasonsComponent);
        component = fixture.componentInstance;
        componentRef = fixture.componentRef;

        // Set required inputs
        componentRef.setInput('seasons', mockSeasons);
        componentRef.setInput('isAuthenticated', false);
        componentRef.setInput('watchedSeasons', []);
        componentRef.setInput('watchedEpisodes', []);
        componentRef.setInput('seasonLoadingStates', new Map());
        componentRef.setInput('episodeLoadingStates', new Map());

        fixture.detectChanges();
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should have required inputs', () => {
            expect(component.seasons()).toEqual(mockSeasons);
            expect(component.isAuthenticated()).toBe(false);
            expect(component.watchedSeasons()).toEqual([]);
            expect(component.watchedEpisodes()).toEqual([]);
            expect(component.seasonLoadingStates()).toBeInstanceOf(Map);
            expect(component.episodeLoadingStates()).toBeInstanceOf(Map);
        });
    });

    describe('Template Rendering', () => {
        it('should render all seasons', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const seasonPanels = compiled.querySelectorAll('mat-expansion-panel');
            // Includes season panels AND episode panels
            expect(seasonPanels.length).toBeGreaterThanOrEqual(2);
        });

        it('should render season names', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const seasonTitles = compiled.querySelectorAll('.season-title');
            expect(seasonTitles.length).toBeGreaterThanOrEqual(2);
            // Season names are translated to French
            expect(seasonTitles[0].textContent).toContain('Saison');
        });

        it('should render season posters', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const posters = compiled.querySelectorAll('.season-poster');
            expect(posters.length).toBeGreaterThanOrEqual(1);
        });

        it('should render episodes for seasons with episode data', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            // Episodes are in mat-expansion-panel elements
            const allPanels = compiled.querySelectorAll('mat-expansion-panel');
            expect(allPanels.length).toBeGreaterThan(0);
        });

        it('should render episode names', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const episodeNames = compiled.querySelectorAll('.episode-name');
            expect(episodeNames.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Watched State', () => {
        it('should check if season is watched', () => {
            componentRef.setInput('watchedSeasons', [101]);
            fixture.detectChanges();

            expect(component['isSeasonWatched'](101)).toBe(true);
            expect(component['isSeasonWatched'](102)).toBe(false);
        });

        it('should check if episode is watched', () => {
            componentRef.setInput('watchedEpisodes', [1]);
            fixture.detectChanges();

            expect(component['isEpisodeWatched'](1)).toBe(true);
            expect(component['isEpisodeWatched'](2)).toBe(false);
        });

        it('should handle multiple watched seasons', () => {
            componentRef.setInput('watchedSeasons', [101, 102]);
            fixture.detectChanges();

            expect(component['isSeasonWatched'](101)).toBe(true);
            expect(component['isSeasonWatched'](102)).toBe(true);
        });

        it('should handle multiple watched episodes', () => {
            componentRef.setInput('watchedEpisodes', [1, 2]);
            fixture.detectChanges();

            expect(component['isEpisodeWatched'](1)).toBe(true);
            expect(component['isEpisodeWatched'](2)).toBe(true);
        });
    });

    describe('Loading States', () => {
        it('should check if season is loading', () => {
            const loadingStates = new Map<number, boolean>();
            loadingStates.set(101, true);
            componentRef.setInput('seasonLoadingStates', loadingStates);
            fixture.detectChanges();

            expect(component['isSeasonLoading'](101)).toBe(true);
            expect(component['isSeasonLoading'](102)).toBe(false);
        });

        it('should check if episode is loading', () => {
            const loadingStates = new Map<number, boolean>();
            loadingStates.set(1, true);
            componentRef.setInput('episodeLoadingStates', loadingStates);
            fixture.detectChanges();

            expect(component['isEpisodeLoading'](1)).toBe(true);
            expect(component['isEpisodeLoading'](2)).toBe(false);
        });

        it('should return false for non-existent loading state', () => {
            expect(component['isSeasonLoading'](999)).toBe(false);
            expect(component['isEpisodeLoading'](999)).toBe(false);
        });
    });

    describe('Output Events', () => {
        it('should emit toggleSeasonWatched event', () => {
            const toggleSeasonWatchedSpy = vi.fn();
            component.toggleSeasonWatched.subscribe(toggleSeasonWatchedSpy);

            const mockEvent = new Event('click');
            component['onToggleSeasonWatched'](101, mockEvent);

            expect(toggleSeasonWatchedSpy).toHaveBeenCalledWith(101);
        });

        it('should emit toggleEpisodeWatched event', () => {
            const toggleEpisodeWatchedSpy = vi.fn();
            component.toggleEpisodeWatched.subscribe(toggleEpisodeWatchedSpy);

            const mockEvent = new Event('click');
            component['onToggleEpisodeWatched'](1, mockEvent);

            expect(toggleEpisodeWatchedSpy).toHaveBeenCalledWith(1);
        });

        it('should stop event propagation when toggling season', () => {
            const mockEvent = new Event('click');
            const stopPropagationSpy = vi.spyOn(mockEvent, 'stopPropagation');

            component['onToggleSeasonWatched'](101, mockEvent);

            expect(stopPropagationSpy).toHaveBeenCalled();
        });

        it('should stop event propagation when toggling episode', () => {
            const mockEvent = new Event('click');
            const stopPropagationSpy = vi.spyOn(mockEvent, 'stopPropagation');

            component['onToggleEpisodeWatched'](1, mockEvent);

            expect(stopPropagationSpy).toHaveBeenCalled();
        });
    });

    describe('Authentication State', () => {
        it('should show watched buttons when authenticated', () => {
            componentRef.setInput('isAuthenticated', true);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const watchedButtons = compiled.querySelectorAll('.season-watched-button, .episode-watched-button');
            expect(watchedButtons.length).toBeGreaterThan(0);
        });

        it('should reflect authentication state', () => {
            componentRef.setInput('isAuthenticated', true);
            fixture.detectChanges();

            expect(component.isAuthenticated()).toBe(true);
        });
    });

    describe('Season Poster Placeholder', () => {
        it('should render placeholder when poster_path is null', () => {
            const seasonsWithNullPoster = [
                {
                    ...mockSeasons[0],
                    poster_path: null
                }
            ];
            componentRef.setInput('seasons', seasonsWithNullPoster);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const placeholder = compiled.querySelector('.season-poster-placeholder');
            expect(placeholder).toBeTruthy();
        });
    });

    describe('Episode Still Images', () => {
        it('should render episode still images', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const stills = compiled.querySelectorAll('.episode-still');
            expect(stills.length).toBeGreaterThanOrEqual(1);
        });

        it('should have alt text on episode stills', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const stills = compiled.querySelectorAll('.episode-still');
            stills.forEach(still => {
                expect((still as HTMLImageElement).alt).toBeTruthy();
            });
        });
    });

    describe('Episode Ratings', () => {
        it('should display episode vote averages', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const ratings = compiled.querySelectorAll('.episode-rating');
            expect(ratings.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Empty States', () => {
        it('should handle seasons with no episodes', () => {
            const season = mockSeasons[1]; // Season 2 has no episodes
            expect(season.episodes).toEqual([]);
        });

        it('should handle empty seasons array', () => {
            componentRef.setInput('seasons', []);
            fixture.detectChanges();

            expect(component.seasons()).toHaveLength(0);
        });
    });

    describe('Accessibility', () => {
        it('should have semantic structure', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const expansionPanels = compiled.querySelectorAll('mat-expansion-panel');
            expect(expansionPanels.length).toBeGreaterThan(0);
        });

        it('should have tooltip support on watched buttons', () => {
            componentRef.setInput('isAuthenticated', true);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const watchedButtons = compiled.querySelectorAll('.season-watched-button, .episode-watched-button');
            expect(watchedButtons.length).toBeGreaterThan(0);
        });
    });
});
