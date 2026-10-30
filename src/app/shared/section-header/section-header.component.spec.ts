import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'vitest';

import { SectionHeaderComponent } from './section-header.component';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';

describe('SectionHeaderComponent', () => {
    let component: SectionHeaderComponent;
    let fixture: ComponentFixture<SectionHeaderComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SectionHeaderComponent, getTranslocoTestingModule()],
        });

        fixture = TestBed.createComponent(SectionHeaderComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render the title as a level two heading', () => {
        fixture.componentRef.setInput('titleKey', 'sections.top_rated');
        fixture.detectChanges();

        const heading = fixture.nativeElement.querySelector('h2');

        expect(heading).toBeTruthy();
        expect(heading.textContent.trim()).toBe('Meilleures notes');
    });

    it('should omit the eyebrow and lead when no key is given', () => {
        fixture.componentRef.setInput('titleKey', 'sections.top_rated');
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.eyebrow')).toBeNull();
        expect(fixture.nativeElement.querySelector('.section-lead')).toBeNull();
    });

    it('should render the eyebrow and lead when keys are given', () => {
        fixture.componentRef.setInput('titleKey', 'sections.top_rated');
        fixture.componentRef.setInput('eyebrowKey', 'sections.top_rated_eyebrow');
        fixture.componentRef.setInput('leadKey', 'sections.top_rated_lead');
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.eyebrow').textContent.trim()).toBe(
            'Le classement',
        );
        expect(fixture.nativeElement.querySelector('.section-lead')).toBeTruthy();
    });

    it('should default to the gold accent', () => {
        fixture.componentRef.setInput('titleKey', 'sections.top_rated');
        fixture.componentRef.setInput('eyebrowKey', 'sections.popular_eyebrow');
        fixture.detectChanges();

        const eyebrow = fixture.nativeElement.querySelector('.eyebrow');

        expect(component.accent()).toBe('gold');
        expect(eyebrow.classList.contains('eyebrow--flare')).toBe(false);
        expect(eyebrow.classList.contains('eyebrow--ice')).toBe(false);
    });

    it('should apply the requested accent modifier', () => {
        fixture.componentRef.setInput('titleKey', 'sections.top_rated');
        fixture.componentRef.setInput('eyebrowKey', 'sections.popular_eyebrow');
        fixture.componentRef.setInput('accent', 'ice');
        fixture.detectChanges();

        expect(
            fixture.nativeElement.querySelector('.eyebrow').classList.contains('eyebrow--ice'),
        ).toBe(true);
    });
});
