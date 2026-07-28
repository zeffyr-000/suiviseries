import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'vitest';
import { ActivatedRoute } from '@angular/router';

import { SerieRailComponent } from './serie-rail.component';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';
import { createMockSerie } from '../../testing/mocks';

describe('SerieRailComponent', () => {
    let component: SerieRailComponent;
    let fixture: ComponentFixture<SerieRailComponent>;

    const series = [
        createMockSerie({ id: 1, name: 'Silo' }),
        createMockSerie({ id: 2, name: 'FROM' }),
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SerieRailComponent, getTranslocoTestingModule()],
            providers: [{ provide: ActivatedRoute, useValue: { snapshot: { params: {} } } }],
        });

        fixture = TestBed.createComponent(SerieRailComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render one card per serie', () => {
        fixture.componentRef.setInput('series', series);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('app-serie-card')).toHaveLength(2);
    });

    it('should be a landmark region without needing an explicit role', () => {
        fixture.componentRef.setInput('series', series);
        fixture.detectChanges();

        const rail = fixture.nativeElement.querySelector('.serie-rail');

        expect(rail.tagName).toBe('SECTION');
        expect(rail.getAttribute('role')).toBeNull();
    });

    it('should leave keyboard access to the cards rather than focusing the container', () => {
        fixture.componentRef.setInput('series', series);
        fixture.detectChanges();

        const rail = fixture.nativeElement.querySelector('.serie-rail');

        // The scrollable region is reachable because its cards are links; a
        // tabindex here would only add a stop that lands on nothing.
        expect(rail.getAttribute('tabindex')).toBeNull();
        expect(rail.querySelectorAll('a').length).toBeGreaterThan(0);
    });

    it('should label the region with the translated default key', () => {
        fixture.componentRef.setInput('series', series);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.serie-rail').getAttribute('aria-label')).toBe(
            'Séries populaires',
        );
    });

    it('should accept a custom label key', () => {
        fixture.componentRef.setInput('series', series);
        fixture.componentRef.setInput('labelKey', 'sections.featured_label');
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.serie-rail').getAttribute('aria-label')).toBe(
            'Série mise en avant',
        );
    });
});
