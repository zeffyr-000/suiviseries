import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'vitest';
import { ActivatedRoute } from '@angular/router';

import { SerieCardComponent } from './serie-card.component';
import { SerieStatus } from '../../models/serie.model';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';
import { createMockSerie } from '../../testing/mocks';

describe('SerieCardComponent', () => {
    let component: SerieCardComponent;
    let fixture: ComponentFixture<SerieCardComponent>;

    const mockSerie = createMockSerie({
        tmdb_id: 1234,
        name: 'Breaking Bad',
        original_name: 'Breaking Bad',
        overview: 'A chemistry teacher turned meth manufacturer partners with a former student.',
        first_air_date: '2008-01-20',
        last_air_date: '2013-09-29',
        number_of_seasons: 5,
        number_of_episodes: 62,
        status: SerieStatus.ENDED,
        popularity: 95.5,
        vote_average: 9.5,
        vote_count: 15000,
    });

    const renderWith = (serie: unknown = mockSerie) => {
        fixture.componentRef.setInput('serie', serie);
        fixture.detectChanges();
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SerieCardComponent, getTranslocoTestingModule()],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { params: {} },
                    },
                },
            ],
        });

        fixture = TestBed.createComponent(SerieCardComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Template Rendering', () => {
        it('should display serie title', () => {
            renderWith();

            const title = fixture.nativeElement.querySelector('.series-title');

            expect(title).toBeTruthy();
            expect(title.textContent.trim()).toBe('Breaking Bad');
        });

        it('should display serie poster', () => {
            renderWith();

            const img = fixture.nativeElement.querySelector('.series-poster');

            expect(img).toBeTruthy();
            expect(img.src).toContain('/poster.jpg');
            expect(img.alt).toBe('Breaking Bad');
        });

        it('should display serie status chip', () => {
            renderWith();

            const statusChip = fixture.nativeElement.querySelector('app-serie-status-chip');

            expect(statusChip).toBeTruthy();
        });

        it('should display number of seasons', () => {
            renderWith();

            expect(fixture.nativeElement.querySelector('.seasons')).toBeTruthy();
        });

        it('should display number of episodes', () => {
            renderWith();

            expect(fixture.nativeElement.querySelector('.episodes')).toBeTruthy();
        });

        it('should display truncated overview when longer than 100 characters', () => {
            renderWith({ ...mockSerie, overview: 'A'.repeat(150) });

            const overview = fixture.nativeElement.querySelector('.series-overview');

            expect(overview).toBeTruthy();
            expect(overview.textContent.trim()).toHaveLength(103); // 100 chars + '...'
            expect(overview.textContent).toContain('...');
        });

        it('should display full overview when shorter than 100 characters', () => {
            const shortOverview = 'Short description';
            renderWith({ ...mockSerie, overview: shortOverview });

            const overview = fixture.nativeElement.querySelector('.series-overview');

            expect(overview.textContent.trim()).toBe(shortOverview);
            expect(overview.textContent).not.toContain('...');
        });

        it('should have clickable card link', () => {
            renderWith();

            const link = fixture.nativeElement.querySelector('.series-card-link');

            expect(link).toBeTruthy();
            expect(link.tagName).toBe('A');
        });

        it('should expose the artwork to the bloom layer as a custom property', () => {
            renderWith();

            const card = fixture.nativeElement.querySelector('.series-card');

            expect(card.style.getPropertyValue('--poster-src')).toContain('/poster.jpg');
        });
    });

    describe('Image Handling', () => {
        it('should generate correct TMDB image URL for w500', () => {
            renderWith();

            const img = fixture.nativeElement.querySelector('.series-poster');

            expect(img.src).toBe('https://image.tmdb.org/t/p/w500/poster.jpg');
        });

        it('should request nothing when the serie has no artwork', () => {
            renderWith({ ...mockSerie, poster_path: '' });

            const img = fixture.nativeElement.querySelector('.series-poster');

            // No src at all rather than an empty one, which would make the
            // browser re-request the current page.
            expect(img).toBeTruthy();
            expect(img.getAttribute('src')).toBeNull();
        });

        it('should survive artwork the API returned as null', () => {
            expect(() => renderWith({ ...mockSerie, poster_path: null })).not.toThrow();
            expect(
                fixture.nativeElement.querySelector('.series-poster').getAttribute('src'),
            ).toBeNull();
        });
    });

    describe('Rating Ring', () => {
        it('should display the rating on the TMDB 0-10 scale', () => {
            renderWith();

            const rating = fixture.nativeElement.querySelector('.stat-ring-label');

            expect(rating.textContent.trim()).toBe('9.5');
        });

        it('should describe the rating for screen readers', () => {
            renderWith();

            const description = fixture.nativeElement.querySelector(
                '.rating-badge .visually-hidden',
            );

            expect(description.textContent.trim()).toBe('Note de 9.5 sur 10');
        });

        it('should handle low ratings', () => {
            renderWith({ ...mockSerie, vote_average: 2 });

            expect(fixture.nativeElement.querySelector('.stat-ring-label').textContent.trim()).toBe(
                '2.0',
            );
        });

        it('should leave no gap in the arc for a perfect rating', () => {
            renderWith({ ...mockSerie, vote_average: 10 });

            const arc = fixture.nativeElement.querySelector('.stat-ring-value');

            expect(Number(arc.getAttribute('stroke-dashoffset'))).toBeCloseTo(0);
        });

        it('should leave the arc empty for an unrated serie', () => {
            renderWith({ ...mockSerie, vote_average: 0 });

            const arc = fixture.nativeElement.querySelector('.stat-ring-value');
            const circumference = Number(arc.getAttribute('stroke-dasharray'));

            expect(Number(arc.getAttribute('stroke-dashoffset'))).toBeCloseTo(circumference);
        });

        it('should fill half the arc for a rating of five', () => {
            renderWith({ ...mockSerie, vote_average: 5 });

            const arc = fixture.nativeElement.querySelector('.stat-ring-value');
            const circumference = Number(arc.getAttribute('stroke-dasharray'));

            expect(Number(arc.getAttribute('stroke-dashoffset'))).toBeCloseTo(circumference / 2);
        });
    });

    describe('View Transition', () => {
        it('should name the poster after the serie so it can morph into the detail hero', () => {
            renderWith();

            const img = fixture.nativeElement.querySelector('.series-poster');

            expect(img.style.viewTransitionName).toBe(`serie-poster-${mockSerie.id}`);
        });
    });

    describe('Structure', () => {
        it('should have series-card class for styling', () => {
            renderWith();

            expect(fixture.nativeElement.querySelector('.series-card')).toBeTruthy();
        });

        it('should have series-info section', () => {
            renderWith();

            expect(fixture.nativeElement.querySelector('.series-info')).toBeTruthy();
        });
    });
});
