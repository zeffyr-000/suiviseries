import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'vitest';
import { ActivatedRoute } from '@angular/router';

import { FeaturedSerieComponent } from './featured-serie.component';
import { SerieStatus } from '../../models/serie.model';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';
import { createMockSerie } from '../../testing/mocks';

describe('FeaturedSerieComponent', () => {
    let component: FeaturedSerieComponent;
    let fixture: ComponentFixture<FeaturedSerieComponent>;

    const serie = createMockSerie({
        id: 42,
        name: 'Silo',
        backdrop_path: '/backdrop.jpg',
        vote_average: 8.177,
        number_of_seasons: 3,
        number_of_episodes: 30,
        status: SerieStatus.RETURNING,
    });

    const renderWith = (value: unknown = serie) => {
        fixture.componentRef.setInput('serie', value);
        fixture.detectChanges();
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FeaturedSerieComponent, getTranslocoTestingModule()],
            providers: [{ provide: ActivatedRoute, useValue: { snapshot: { params: {} } } }],
        });

        fixture = TestBed.createComponent(FeaturedSerieComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should use the wide backdrop rather than the poster', () => {
        renderWith();

        const image = fixture.nativeElement.querySelector('.featured-backdrop');

        expect(image.src).toBe('https://image.tmdb.org/t/p/w780/backdrop.jpg');
        expect(image.getAttribute('srcset')).toContain('/w1280/backdrop.jpg 1280w');
    });

    it('should leave the artwork unnamed, since the heading already names the serie', () => {
        renderWith();

        expect(fixture.nativeElement.querySelector('.featured-backdrop').getAttribute('alt')).toBe(
            '',
        );
    });

    it('should render the title as a level three heading, below the section heading', () => {
        renderWith();

        expect(fixture.nativeElement.querySelector('h3').textContent.trim()).toBe('Silo');
    });

    it('should round the rating to one decimal', () => {
        renderWith();

        const rating = fixture.nativeElement.querySelector('.featured-rating');

        expect(rating.querySelector('[aria-hidden="true"]:not(mat-icon)').textContent.trim()).toBe(
            '8.2',
        );
        expect(rating.querySelector('.visually-hidden').textContent.trim()).toBe(
            'Note de 8.2 sur 10',
        );
    });

    it('should flag a returning serie as airing', () => {
        renderWith();

        expect(fixture.nativeElement.querySelector('.live-pill')).toBeTruthy();
    });

    it('should not flag an ended serie as airing', () => {
        renderWith({ ...serie, status: SerieStatus.ENDED });

        expect(fixture.nativeElement.querySelector('.live-pill')).toBeNull();
    });

    it('should link to the serie detail page', () => {
        renderWith();

        const cta = fixture.nativeElement.querySelector('.featured-cta');

        expect(cta.tagName).toBe('A');
        expect(cta.getAttribute('href')).toContain('/serie/42');
    });
});
