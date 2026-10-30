import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'vitest';

import { StatRingComponent } from './stat-ring.component';

describe('StatRingComponent', () => {
    let component: StatRingComponent;
    let fixture: ComponentFixture<StatRingComponent>;

    const render = (ratio: number, label = 'x', extra: Record<string, unknown> = {}) => {
        fixture.componentRef.setInput('ratio', ratio);
        fixture.componentRef.setInput('label', label);
        Object.entries(extra).forEach(([key, value]) => fixture.componentRef.setInput(key, value));
        fixture.detectChanges();
    };

    const arc = () => fixture.nativeElement.querySelector('.stat-ring-value');
    const circumference = () => Number(arc().getAttribute('stroke-dasharray'));
    const offset = () => Number(arc().getAttribute('stroke-dashoffset'));

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [StatRingComponent] });

        fixture = TestBed.createComponent(StatRingComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render the label', () => {
        render(0.5, '8.2');

        expect(fixture.nativeElement.querySelector('.stat-ring-label').textContent.trim()).toBe(
            '8.2',
        );
    });

    it('should leave the arc empty at zero', () => {
        render(0);

        expect(offset()).toBeCloseTo(circumference());
    });

    it('should close the arc at one', () => {
        render(1);

        expect(offset()).toBeCloseTo(0);
    });

    it('should fill half the arc at one half', () => {
        render(0.5);

        expect(offset()).toBeCloseTo(circumference() / 2);
    });

    it('should clamp values above one, since ratings and progress come from data it does not own', () => {
        render(1.4);

        expect(offset()).toBeCloseTo(0);
    });

    it('should clamp negative values', () => {
        render(-0.3);

        expect(offset()).toBeCloseTo(circumference());
    });

    it('should default to the gold accent', () => {
        render(0.5);

        const ring = fixture.nativeElement.querySelector('.stat-ring');

        expect(ring.classList.contains('stat-ring--ice')).toBe(false);
        expect(ring.classList.contains('stat-ring--flare')).toBe(false);
    });

    it('should apply the requested accent', () => {
        render(0.5, 'x', { accent: 'ice' });

        expect(
            fixture.nativeElement.querySelector('.stat-ring').classList.contains('stat-ring--ice'),
        ).toBe(true);
    });

    it('should describe the arc for screen readers when a description is given', () => {
        render(0.5, '50%', { description: '31 épisodes vus sur 62' });

        expect(fixture.nativeElement.querySelector('.visually-hidden').textContent.trim()).toBe(
            '31 épisodes vus sur 62',
        );
    });

    it('should omit the hidden description when none is given', () => {
        render(0.5);

        expect(fixture.nativeElement.querySelector('.visually-hidden')).toBeNull();
    });

    it('should hide the bare figure from screen readers when a description replaces it', () => {
        render(0.5, '50%', { description: '31 épisodes vus sur 62' });

        expect(
            fixture.nativeElement.querySelector('.stat-ring-label').getAttribute('aria-hidden'),
        ).toBe('true');
    });

    it('should leave the figure readable when there is no description', () => {
        render(0.5, '50%');

        expect(
            fixture.nativeElement.querySelector('.stat-ring-label').hasAttribute('aria-hidden'),
        ).toBe(false);
    });
});
