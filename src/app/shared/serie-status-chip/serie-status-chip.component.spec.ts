import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SerieStatusChipComponent } from './serie-status-chip.component';
import { SerieStatus } from '../../models/serie.model';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';

describe('SerieStatusChipComponent', () => {
    let component: SerieStatusChipComponent;
    let fixture: ComponentFixture<SerieStatusChipComponent>;

    const setInput = (status: SerieStatus, size?: string) => {
        fixture.componentRef.setInput('status', status);
        if (size) fixture.componentRef.setInput('size', size);
        fixture.detectChanges();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                SerieStatusChipComponent,
                getTranslocoTestingModule()
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SerieStatusChipComponent);
        component = fixture.componentInstance;
    });

    describe('Component Creation', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should have default status as PLANNED', () => {
            fixture.detectChanges();
            expect(component.status()).toBe(SerieStatus.PLANNED);
        });

        it('should have default size as small', () => {
            fixture.detectChanges();
            expect(component.size()).toBe('small');
        });

        it('should show icon by default', () => {
            fixture.detectChanges();
            expect(component.showIcon()).toBe(true);
        });
    });

    describe('Status Class Computed', () => {
        it.each([
            [SerieStatus.RETURNING, 'status-returning size-small'],
            [SerieStatus.ENDED, 'status-ended size-small'],
            [SerieStatus.CANCELED, 'status-canceled size-small'],
            [SerieStatus.IN_PRODUCTION, 'status-production size-small'],
            [SerieStatus.PLANNED, 'status-planned size-small']
        ])('should return correct class for %s status', (status, expectedClass) => {
            setInput(status);
            expect(component['statusClass']()).toBe(expectedClass);
        });

        it.each([
            ['medium', 'status-returning size-medium'],
            ['large', 'status-ended size-large']
        ])('should include %s size in class', (size, expectedClass) => {
            const status = size === 'medium' ? SerieStatus.RETURNING : SerieStatus.ENDED;
            setInput(status, size);
            expect(component['statusClass']()).toBe(expectedClass);
        });
    });

    describe('Status Icon Computed', () => {
        it.each([
            [SerieStatus.RETURNING, 'refresh'],
            [SerieStatus.ENDED, 'check_circle'],
            [SerieStatus.CANCELED, 'cancel'],
            [SerieStatus.IN_PRODUCTION, 'work'],
            [SerieStatus.PLANNED, 'schedule']
        ])('should return %s icon for %s status', (status, expectedIcon) => {
            setInput(status);
            expect(component['statusIcon']()).toBe(expectedIcon);
        });
    });

    describe('Translated Status Computed', () => {
        it.each([
            [SerieStatus.RETURNING, 'En cours'],
            [SerieStatus.ENDED, 'Terminée'],
            [SerieStatus.CANCELED, 'Annulée'],
            [SerieStatus.IN_PRODUCTION, 'En production'],
            [SerieStatus.PLANNED, 'Prévue']
        ])('should return translated text for %s status', (status, expectedText) => {
            setInput(status);
            expect(component['translatedStatus']()).toBe(expectedText);
        });
    });

    describe('Input Changes', () => {
        it('should update statusClass when status input changes', () => {
            setInput(SerieStatus.RETURNING);
            expect(component['statusClass']()).toContain('status-returning');

            setInput(SerieStatus.ENDED);
            expect(component['statusClass']()).toContain('status-ended');
        });

        it('should update statusClass when size input changes', () => {
            setInput(SerieStatus.PLANNED, 'small');
            expect(component['statusClass']()).toContain('size-small');

            setInput(SerieStatus.PLANNED, 'large');
            expect(component['statusClass']()).toContain('size-large');
        });

        it('should update all computed values when status changes', () => {
            setInput(SerieStatus.RETURNING);
            expect(component['statusIcon']()).toBe('refresh');
            expect(component['translatedStatus']()).toBe('En cours');
            expect(component['statusClass']()).toContain('status-returning');

            setInput(SerieStatus.CANCELED);
            expect(component['statusIcon']()).toBe('cancel');
            expect(component['translatedStatus']()).toBe('Annulée');
            expect(component['statusClass']()).toContain('status-canceled');
        });
    });

    describe('Template Rendering', () => {
        it('should render mat-chip with correct class', () => {
            setInput(SerieStatus.RETURNING, 'medium');

            const chip = fixture.nativeElement.querySelector('mat-chip');
            expect(chip).toBeTruthy();
            expect(chip.classList.contains('status-returning')).toBe(true);
            expect(chip.classList.contains('size-medium')).toBe(true);
        });

        it('should render icon when showIcon is true', () => {
            fixture.componentRef.setInput('showIcon', true);
            setInput(SerieStatus.ENDED);

            const icon = fixture.nativeElement.querySelector('mat-icon');
            expect(icon).toBeTruthy();
            expect(icon.textContent.trim()).toBe('check_circle');
        });

        it('should not render icon when showIcon is false', () => {
            fixture.componentRef.setInput('showIcon', false);
            fixture.detectChanges();

            const icon = fixture.nativeElement.querySelector('mat-icon');
            expect(icon).toBeFalsy();
        });

        it('should render translated status text', () => {
            setInput(SerieStatus.PLANNED);

            const chip = fixture.nativeElement.querySelector('mat-chip');
            expect(chip.textContent).toContain('Prévue');
        });
    });
});
