import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';

import { SerieWatchProvidersComponent, WatchProvider } from './serie-watch-providers.component';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';

describe('SerieWatchProvidersComponent', () => {
    let fixture: ComponentFixture<SerieWatchProvidersComponent>;
    let component: SerieWatchProvidersComponent;
    let componentRef: ComponentRef<SerieWatchProvidersComponent>;

    const mockProviders: WatchProvider[] = [
        {
            provider_id: 8,
            provider_name: 'Netflix',
            logo_path: 'https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg',
            type: 'flatrate'
        },
        {
            provider_id: 119,
            provider_name: 'Amazon Prime Video',
            logo_path: 'https://image.tmdb.org/t/p/original/emthp39XA2YScoYL1p0sdbAH2WA.jpg',
            type: 'flatrate'
        },
        {
            provider_id: 2,
            provider_name: 'Apple TV',
            logo_path: 'https://image.tmdb.org/t/p/original/peURlLlr8jggOwK53fJ5wdQl05y.jpg',
            type: 'buy'
        },
        {
            provider_id: 3,
            provider_name: 'Google Play Movies',
            logo_path: null,
            type: 'rent'
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                SerieWatchProvidersComponent,
                getTranslocoTestingModule()
            ]
        });

        fixture = TestBed.createComponent(SerieWatchProvidersComponent);
        component = fixture.componentInstance;
        componentRef = fixture.componentRef;
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            componentRef.setInput('providers', mockProviders);
            fixture.detectChanges();

            expect(component).toBeTruthy();
        });

        it('should have providers input', () => {
            componentRef.setInput('providers', mockProviders);
            fixture.detectChanges();

            expect(component.providers()).toEqual(mockProviders);
            expect(component.providers()).toHaveLength(4);
        });
    });

    describe('Template Rendering', () => {
        it('should render all providers', () => {
            componentRef.setInput('providers', mockProviders);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const providerItems = compiled.querySelectorAll('.watch-provider-item');
            expect(providerItems.length).toBe(4);
        });

        it('should render provider logos', () => {
            componentRef.setInput('providers', mockProviders);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const logos = compiled.querySelectorAll('.provider-logo');
            expect(logos.length).toBe(3); // Only 3 have logo_path
        });

        it('should render provider names', () => {
            componentRef.setInput('providers', mockProviders);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const names = compiled.querySelectorAll('.provider-name');
            expect(names.length).toBe(4);
            expect(names[0].textContent?.trim()).toBe('Netflix');
        });

        it('should render provider types', () => {
            componentRef.setInput('providers', mockProviders);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const types = compiled.querySelectorAll('.provider-type');
            expect(types.length).toBe(4);
        });

        it('should render placeholder for missing logo', () => {
            componentRef.setInput('providers', mockProviders);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const placeholders = compiled.querySelectorAll('.provider-placeholder');
            expect(placeholders.length).toBe(1); // Google Play has null logo_path
        });

        it('should display empty state when no providers', () => {
            componentRef.setInput('providers', []);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const providerItems = compiled.querySelectorAll('.watch-provider-item');
            expect(providerItems.length).toBe(0);
        });
    });

    describe('Schema.org Markup', () => {
        it('should have BroadcastService schema.org markup', () => {
            componentRef.setInput('providers', mockProviders);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            // Check if schema.org markup exists in the template
            const schemaElements = compiled.querySelectorAll('[itemscope]');
            expect(schemaElements.length).toBeGreaterThan(0);
        });

        it('should have provider name in itemprop', () => {
            componentRef.setInput('providers', mockProviders);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const names = compiled.querySelectorAll('[itemprop="name"]');
            expect(names.length).toBeGreaterThanOrEqual(4);
        });

        it('should render provider logos with schema markup', () => {
            componentRef.setInput('providers', mockProviders);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const logos = compiled.querySelectorAll('.provider-logo');
            expect(logos.length).toBe(3); // Only providers with logo_path
        });

        it('should have WatchAction in potentialAction', () => {
            componentRef.setInput('providers', mockProviders);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const watchActions = compiled.querySelectorAll('[itemprop="potentialAction"]');
            expect(watchActions.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Provider Types', () => {
        it('should handle flatrate providers', () => {
            const flatrateProviders = mockProviders.filter(p => p.type === 'flatrate');
            componentRef.setInput('providers', flatrateProviders);
            fixture.detectChanges();

            expect(component.providers()).toHaveLength(2);
            expect(component.providers().every(p => p.type === 'flatrate')).toBe(true);
        });

        it('should handle buy providers', () => {
            const buyProviders = mockProviders.filter(p => p.type === 'buy');
            componentRef.setInput('providers', buyProviders);
            fixture.detectChanges();

            expect(component.providers()).toHaveLength(1);
            expect(component.providers()[0].type).toBe('buy');
        });

        it('should handle rent providers', () => {
            const rentProviders = mockProviders.filter(p => p.type === 'rent');
            componentRef.setInput('providers', rentProviders);
            fixture.detectChanges();

            expect(component.providers()).toHaveLength(1);
            expect(component.providers()[0].type).toBe('rent');
        });
    });

    describe('Accessibility', () => {
        it('should have semantic nav element', () => {
            componentRef.setInput('providers', mockProviders);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const nav = compiled.querySelector('nav');
            expect(nav).toBeTruthy();
        });

        it('should have aria-label on nav', () => {
            componentRef.setInput('providers', mockProviders);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const nav = compiled.querySelector('nav');
            expect(nav?.getAttribute('aria-label')).toBeTruthy();
        });

        it('should have alt text on provider logos', () => {
            componentRef.setInput('providers', mockProviders);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const logos = compiled.querySelectorAll('.provider-logo');
            logos.forEach(logo => {
                expect((logo as HTMLImageElement).alt).toBeTruthy();
            });
        });
    });
});
