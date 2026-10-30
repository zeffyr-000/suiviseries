import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'vitest';
import { ActivatedRoute } from '@angular/router';

import { HomeHeroComponent } from './home-hero.component';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';
import { createMockSerie } from '../../testing/mocks';

describe('HomeHeroComponent', () => {
    let component: HomeHeroComponent;
    let fixture: ComponentFixture<HomeHeroComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HomeHeroComponent, getTranslocoTestingModule()],
            providers: [{ provide: ActivatedRoute, useValue: { snapshot: { params: {} } } }],
        });

        fixture = TestBed.createComponent(HomeHeroComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should carry the single level one heading of the page', () => {
        fixture.detectChanges();

        const headings = fixture.nativeElement.querySelectorAll('h1');

        expect(headings).toHaveLength(1);
        expect(headings[0].textContent).toContain('Ne ratez plus jamais un');
        expect(headings[0].textContent).toContain('épisode');
    });

    it('should expose the browse action as a link, since it navigates', () => {
        fixture.detectChanges();

        const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.btn-expressive');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toBe('/search');
        expect(link.textContent).toContain('Parcourir');
    });

    it('should fall back to the gradient when no backdrop has loaded', () => {
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.hero-backdrop')).toBeNull();
        expect(
            fixture.nativeElement.querySelector('.hero').classList.contains('hero--has-backdrop'),
        ).toBe(false);
    });

    it('should paint the backdrop once one is available', () => {
        fixture.componentRef.setInput(
            'spotlight',
            createMockSerie({ id: 7, name: 'Silo', backdrop_path: '/hero.jpg' }),
        );
        fixture.detectChanges();

        const backdrop: HTMLImageElement = fixture.nativeElement.querySelector('.hero-backdrop');

        expect(backdrop).toBeTruthy();
        expect(backdrop.getAttribute('src')).toBe('https://image.tmdb.org/t/p/w1280/hero.jpg');
        expect(backdrop.getAttribute('alt')).toBe('');
        expect(backdrop.getAttribute('aria-hidden')).toBe('true');
        expect(
            fixture.nativeElement.querySelector('.hero').classList.contains('hero--has-backdrop'),
        ).toBe(true);
    });

    it('should offer sharper renditions so a wide or dense screen does not stretch the artwork', () => {
        fixture.componentRef.setInput(
            'spotlight',
            createMockSerie({ id: 7, name: 'Silo', backdrop_path: '/hero.jpg' }),
        );
        fixture.detectChanges();

        const srcset = fixture.nativeElement.querySelector('.hero-backdrop').getAttribute('srcset');

        expect(srcset).toContain('/w780/hero.jpg 780w');
        expect(srcset).toContain('/w1280/hero.jpg 1280w');
        expect(srcset).toContain('/original/hero.jpg');
    });

    it('should credit the artwork with a link to its serie', () => {
        fixture.componentRef.setInput(
            'spotlight',
            createMockSerie({ id: 7, name: 'Silo', backdrop_path: '/hero.jpg' }),
        );
        fixture.detectChanges();

        const credit: HTMLAnchorElement = fixture.nativeElement.querySelector('.hero-credit');

        expect(credit.textContent).toContain('Silo');
        expect(credit.getAttribute('href')).toBe('/serie/7/silo');
    });

    it('should not show a credit before a serie is picked', () => {
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.hero-credit')).toBeNull();
    });

    it('should point the secondary action at the section that explains the app', () => {
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.hero-secondary').getAttribute('href')).toBe(
            '/#decouvrir',
        );
    });
});
