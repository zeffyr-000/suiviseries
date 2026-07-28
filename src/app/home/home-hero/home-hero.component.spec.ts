import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'vitest';
import { ActivatedRoute } from '@angular/router';

import { HomeHeroComponent } from './home-hero.component';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';

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

    it('should expose the browse action as a button, since it triggers navigation', () => {
        fixture.detectChanges();

        const button = fixture.nativeElement.querySelector('button');

        expect(button).toBeTruthy();
        expect(button.textContent).toContain('Parcourir');
    });

    it('should fall back to the gradient when no backdrop has loaded', () => {
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.hero-backdrop')).toBeNull();
        expect(
            fixture.nativeElement.querySelector('.hero').classList.contains('hero--has-backdrop'),
        ).toBe(false);
    });

    it('should paint the backdrop once one is available', () => {
        fixture.componentRef.setInput('backdrop', 'https://image.tmdb.org/t/p/w780/hero.jpg');
        fixture.detectChanges();

        const backdrop = fixture.nativeElement.querySelector('.hero-backdrop');

        expect(backdrop).toBeTruthy();
        expect(backdrop.style.backgroundImage).toContain('/hero.jpg');
        expect(backdrop.getAttribute('aria-hidden')).toBe('true');
    });

    it('should point the secondary action at the section that explains the app', () => {
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.hero-secondary').getAttribute('href')).toBe(
            '#decouvrir',
        );
    });
});
