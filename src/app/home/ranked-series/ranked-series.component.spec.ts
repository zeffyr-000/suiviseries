import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'vitest';
import { ActivatedRoute } from '@angular/router';

import { RankedSeriesComponent } from './ranked-series.component';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';
import { createMockSerie } from '../../testing/mocks';

describe('RankedSeriesComponent', () => {
    let component: RankedSeriesComponent;
    let fixture: ComponentFixture<RankedSeriesComponent>;

    const series = [
        createMockSerie({ id: 1, name: 'Breaking Bad', vote_average: 8.9 }),
        createMockSerie({ id: 2, name: 'Arcane', vote_average: 8.8 }),
        createMockSerie({ id: 3, name: 'Chernobyl', vote_average: 8.7 }),
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RankedSeriesComponent, getTranslocoTestingModule()],
            providers: [{ provide: ActivatedRoute, useValue: { snapshot: { params: {} } } }],
        });

        fixture = TestBed.createComponent(RankedSeriesComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render one card per serie', () => {
        fixture.componentRef.setInput('series', series);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('app-serie-card')).toHaveLength(3);
    });

    it('should render the ranking as an ordered list, so the order is conveyed without the glyph', () => {
        fixture.componentRef.setInput('series', series);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('ol')).toBeTruthy();
    });

    it('should pad rank numbers to two digits', () => {
        expect(component['rankLabel'](0)).toBe('01');
        expect(component['rankLabel'](8)).toBe('09');
        expect(component['rankLabel'](9)).toBe('10');
        expect(component['rankLabel'](11)).toBe('12');
    });

    it('should hide the decorative rank glyph from assistive technology', () => {
        fixture.componentRef.setInput('series', series);
        fixture.detectChanges();

        const numbers = fixture.nativeElement.querySelectorAll('.rank-number');

        expect(numbers[0].getAttribute('aria-hidden')).toBe('true');
        expect(numbers[0].textContent.trim()).toBe('01');
    });

    it('should render nothing when the list is empty', () => {
        fixture.componentRef.setInput('series', []);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.ranked-item')).toHaveLength(0);
    });
});
