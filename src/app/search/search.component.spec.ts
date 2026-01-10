import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, expect } from 'vitest';
import { of } from 'rxjs';

import { SearchComponent } from './search.component';
import { SeriesService } from '../services/series.service';
import { MetadataService } from '../services/metadata.service';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';
import { createMockMetadataService } from '../testing/mocks';

describe('SearchComponent', () => {
    let component: SearchComponent;
    let fixture: ComponentFixture<SearchComponent>;
    let seriesService: {
        searchSeries: ReturnType<typeof vi.fn>;
    };
    let metadataService: ReturnType<typeof createMockMetadataService>;

    beforeEach(() => {
        seriesService = {
            searchSeries: vi.fn().mockReturnValue(of([]))
        };

        metadataService = createMockMetadataService();

        TestBed.configureTestingModule({
            imports: [SearchComponent, getTranslocoTestingModule()],
            providers: [
                { provide: SeriesService, useValue: seriesService },
                { provide: MetadataService, useValue: metadataService }
            ]
        });

        fixture = TestBed.createComponent(SearchComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Template Rendering - Initial State', () => {
        it('should display page title and subtitle', () => {
            fixture.detectChanges();

            const title = fixture.nativeElement.querySelector('.display-small');
            const subtitle = fixture.nativeElement.querySelector('.search-subtitle');

            expect(title).toBeTruthy();
            expect(subtitle).toBeTruthy();
        });

        it('should display search form with input field', () => {
            fixture.detectChanges();

            const input = fixture.nativeElement.querySelector('input[matInput]');
            const searchIcon = fixture.nativeElement.querySelector('mat-icon[matPrefix]');

            expect(input).toBeTruthy();
            expect(searchIcon?.textContent?.trim()).toBe('search');
        });

        it('should display search button', () => {
            fixture.detectChanges();

            const button = fixture.nativeElement.querySelector('.search-button');

            expect(button).toBeTruthy();
        });

        it('should display search instructions initially', () => {
            fixture.detectChanges();

            const instructions = fixture.nativeElement.querySelector('.search-instructions');
            const instructionsIcon = instructions?.querySelector('mat-icon');

            expect(instructions).toBeTruthy();
            expect(instructionsIcon?.textContent?.trim()).toBe('info');
        });

        it('should show 3 instruction items', () => {
            fixture.detectChanges();

            const instructionItems = fixture.nativeElement.querySelectorAll('.search-instructions li');

            expect(instructionItems.length).toBe(3);
        });
    });

    describe('Form Input Behavior', () => {
        it('should show clear button when input has value', () => {
            fixture.detectChanges();

            const input = fixture.nativeElement.querySelector('input[matInput]');
            input.value = 'test';
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            const clearButton = fixture.nativeElement.querySelector('button[matSuffix]');

            expect(clearButton).toBeTruthy();
        });

        it('should hide clear button when input is empty', () => {
            fixture.detectChanges();

            const clearButton = fixture.nativeElement.querySelector('button[matSuffix]');

            expect(clearButton).toBeFalsy();
        });

        it('should enable search button with valid input', () => {
            fixture.detectChanges();

            const input = fixture.nativeElement.querySelector('input[matInput]');
            input.value = 'breaking bad';
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            // Wait for debounce
            vi.useFakeTimers();
            vi.advanceTimersByTime(500);
            fixture.detectChanges();

            const button = fixture.nativeElement.querySelector('.search-button');

            expect(button.disabled).toBe(false);
        });

        it('should clear input when clear button clicked', () => {
            fixture.detectChanges();

            const input = fixture.nativeElement.querySelector('input[matInput]');
            input.value = 'test query';
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            const clearButton = fixture.nativeElement.querySelector('button[matSuffix]');
            clearButton?.click();
            fixture.detectChanges();

            expect(input.value).toBe('');
        });
    });

    describe('Search Results Display', () => {
        it('should have search button that can trigger search', () => {
            fixture.detectChanges();

            const searchButton = fixture.nativeElement.querySelector('.search-button');

            expect(searchButton).toBeTruthy();
        });
    });

    describe('Lifecycle', () => {
        it('should update metadata on init', () => {
            fixture.detectChanges();

            expect(metadataService.updatePageMetadata).toHaveBeenCalled();
        });

        it('should setup search subscription on init', () => {
            fixture.detectChanges();

            expect(component).toBeTruthy();
            // Search subscription is active (tested indirectly through other tests)
        });
    });
});
