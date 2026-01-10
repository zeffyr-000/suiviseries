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
        vote_count: 15000
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SerieCardComponent, getTranslocoTestingModule()],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { params: {} }
                    }
                }
            ]
        });

        fixture = TestBed.createComponent(SerieCardComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Template Rendering', () => {
        it('should display serie title', () => {
            fixture.componentRef.setInput('serie', mockSerie);
            fixture.detectChanges();

            const title = fixture.nativeElement.querySelector('.series-title');

            expect(title).toBeTruthy();
            expect(title.textContent.trim()).toBe('Breaking Bad');
        });

        it('should display serie poster', () => {
            fixture.componentRef.setInput('serie', mockSerie);
            fixture.detectChanges();

            const img = fixture.nativeElement.querySelector('.series-poster');

            expect(img).toBeTruthy();
            expect(img.src).toContain('/poster.jpg');
            expect(img.alt).toBe('Breaking Bad');
        });

        it('should display rating with star icon', () => {
            fixture.componentRef.setInput('serie', mockSerie);
            fixture.detectChanges();

            const ratingBadge = fixture.nativeElement.querySelector('.rating-badge');
            const icon = ratingBadge.querySelector('mat-icon');

            expect(ratingBadge).toBeTruthy();
            expect(icon?.textContent?.trim()).toBe('star');
            expect(ratingBadge.textContent).toContain('4.8');
        });

        it('should display serie status chip', () => {
            fixture.componentRef.setInput('serie', mockSerie);
            fixture.detectChanges();

            const statusChip = fixture.nativeElement.querySelector('app-serie-status-chip');

            expect(statusChip).toBeTruthy();
        });

        it('should display number of seasons', () => {
            fixture.componentRef.setInput('serie', mockSerie);
            fixture.detectChanges();

            const seasons = fixture.nativeElement.querySelector('.seasons');

            expect(seasons).toBeTruthy();
        });

        it('should display number of episodes', () => {
            fixture.componentRef.setInput('serie', mockSerie);
            fixture.detectChanges();

            const episodes = fixture.nativeElement.querySelector('.episodes');

            expect(episodes).toBeTruthy();
        });

        it('should display truncated overview when longer than 100 characters', () => {
            const longOverview = 'A'.repeat(150);
            const serieWithLongOverview = { ...mockSerie, overview: longOverview };
            fixture.componentRef.setInput('serie', serieWithLongOverview);
            fixture.detectChanges();

            const overview = fixture.nativeElement.querySelector('.series-overview');

            expect(overview).toBeTruthy();
            expect(overview.textContent.trim()).toHaveLength(103); // 100 chars + '...'
            expect(overview.textContent).toContain('...');
        });

        it('should display full overview when shorter than 100 characters', () => {
            const shortOverview = 'Short description';
            const serieWithShortOverview = { ...mockSerie, overview: shortOverview };
            fixture.componentRef.setInput('serie', serieWithShortOverview);
            fixture.detectChanges();

            const overview = fixture.nativeElement.querySelector('.series-overview');

            expect(overview).toBeTruthy();
            expect(overview.textContent.trim()).toBe(shortOverview);
            expect(overview.textContent).not.toContain('...');
        });

        it('should have clickable card link', () => {
            fixture.componentRef.setInput('serie', mockSerie);
            fixture.detectChanges();

            const link = fixture.nativeElement.querySelector('.series-card-link');

            expect(link).toBeTruthy();
            expect(link.tagName).toBe('A');
        });

        it('should render mat-card wrapper', () => {
            fixture.componentRef.setInput('serie', mockSerie);
            fixture.detectChanges();

            const card = fixture.nativeElement.querySelector('mat-card');

            expect(card).toBeTruthy();
        });
    });

    describe('Router Link Generation', () => {
        it('should have router link element', () => {
            fixture.componentRef.setInput('serie', mockSerie);
            fixture.detectChanges();

            const link = fixture.nativeElement.querySelector('.series-card-link');

            expect(link).toBeTruthy();
            expect(link.tagName).toBe('A');
        });
    });

    describe('Image Handling', () => {
        it('should generate correct TMDB image URL for w500', () => {
            fixture.componentRef.setInput('serie', mockSerie);
            fixture.detectChanges();

            const img = fixture.nativeElement.querySelector('.series-poster');

            expect(img.src).toBe('https://image.tmdb.org/t/p/w500/poster.jpg');
        });

        it('should handle missing poster_path', () => {
            const serieWithoutPoster = { ...mockSerie, poster_path: '' };
            fixture.componentRef.setInput('serie', serieWithoutPoster);
            fixture.detectChanges();

            const img = fixture.nativeElement.querySelector('.series-poster');

            expect(img).toBeTruthy();
            expect(img.src).toContain('w500');
        });
    });

    describe('Rating Formatting', () => {
        it('should format rating from 0-10 to 0-5 scale', () => {
            fixture.componentRef.setInput('serie', mockSerie);
            fixture.detectChanges();

            const ratingBadge = fixture.nativeElement.querySelector('.rating-badge');

            // vote_average: 9.5 → (9.5 / 10 * 5) = 4.75 → "4.8"
            expect(ratingBadge.textContent).toContain('4.8');
        });

        it('should handle low ratings', () => {
            const lowRatedSerie = { ...mockSerie, vote_average: 2 };
            fixture.componentRef.setInput('serie', lowRatedSerie);
            fixture.detectChanges();

            const ratingBadge = fixture.nativeElement.querySelector('.rating-badge');

            // vote_average: 2.0 → (2.0 / 10 * 5) = 1.0
            expect(ratingBadge.textContent).toContain('1.0');
        });

        it('should handle perfect ratings', () => {
            const perfectSerie = { ...mockSerie, vote_average: 10 };
            fixture.componentRef.setInput('serie', perfectSerie);
            fixture.detectChanges();

            const ratingBadge = fixture.nativeElement.querySelector('.rating-badge');

            // vote_average: 10.0 → (10.0 / 10 * 5) = 5.0
            expect(ratingBadge.textContent).toContain('5.0');
        });
    });

    describe('Responsive Classes', () => {
        it('should have series-card class for styling', () => {
            fixture.componentRef.setInput('serie', mockSerie);
            fixture.detectChanges();

            const card = fixture.nativeElement.querySelector('.series-card');

            expect(card).toBeTruthy();
        });

        it('should have poster-container for image layout', () => {
            fixture.componentRef.setInput('serie', mockSerie);
            fixture.detectChanges();

            const container = fixture.nativeElement.querySelector('.poster-container');

            expect(container).toBeTruthy();
        });

        it('should have series-info section', () => {
            fixture.componentRef.setInput('serie', mockSerie);
            fixture.detectChanges();

            const info = fixture.nativeElement.querySelector('.series-info');

            expect(info).toBeTruthy();
        });
    });
});
