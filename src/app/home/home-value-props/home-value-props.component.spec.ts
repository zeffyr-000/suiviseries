import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'vitest';

import { HomeValuePropsComponent } from './home-value-props.component';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';

describe('HomeValuePropsComponent', () => {
    let component: HomeValuePropsComponent;
    let fixture: ComponentFixture<HomeValuePropsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HomeValuePropsComponent, getTranslocoTestingModule()],
        });

        fixture = TestBed.createComponent(HomeValuePropsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render one card per capability', () => {
        expect(fixture.nativeElement.querySelectorAll('.value-prop')).toHaveLength(4);
    });

    it('should translate the copy rather than print the key', () => {
        const first = fixture.nativeElement.querySelector('.value-prop-title');

        expect(first.textContent.trim()).toBe('Suivi hiérarchique');
    });

    it('should give each card its own accent', () => {
        const accents = Array.from(
            fixture.nativeElement.querySelectorAll('.value-prop') as NodeListOf<HTMLElement>,
        ).map((element) => element.dataset['accent']);

        expect(accents).toEqual(['gold', 'flare', 'ice', 'violet']);
    });

    it('should hide the decorative icons from assistive technology', () => {
        const icons = fixture.nativeElement.querySelectorAll('.value-prop-icon');

        expect(icons).toHaveLength(4);
        icons.forEach((icon: HTMLElement) => {
            expect(icon.getAttribute('aria-hidden')).toBe('true');
        });
    });
});
