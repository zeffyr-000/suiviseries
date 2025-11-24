import { TestBed } from '@angular/core/testing';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { vi } from 'vitest';
import { MetadataService } from './metadata.service';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

describe('MetadataService', () => {
    let service: MetadataService;
    let titleService: { setTitle: ReturnType<typeof vi.fn>; getTitle: ReturnType<typeof vi.fn> };
    let metaService: { updateTag: ReturnType<typeof vi.fn> };
    let router: { url: string };
    let googleAnalytics: { pageView: ReturnType<typeof vi.fn> };
    let mockDocument: Document;

    beforeEach(() => {
        titleService = {
            setTitle: vi.fn(),
            getTitle: vi.fn().mockReturnValue('Test Title')
        };
        metaService = {
            updateTag: vi.fn()
        };
        router = { url: '/test' };
        googleAnalytics = {
            pageView: vi.fn()
        };

        mockDocument = document;

        TestBed.configureTestingModule({
            imports: [getTranslocoTestingModule()],
            providers: [
                MetadataService,
                { provide: Title, useValue: titleService },
                { provide: Meta, useValue: metaService },
                { provide: Router, useValue: router },
                { provide: GoogleAnalyticsService, useValue: googleAnalytics },
                { provide: DOCUMENT, useValue: mockDocument }
            ]
        });

        service = TestBed.inject(MetadataService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('setTitle', () => {
        it('should set title with suffix', () => {
            service.setTitle('Page Title');
            expect(titleService.setTitle).toHaveBeenCalledWith('Page Title - Suivi Séries');
        });

        it('should set default title when empty', () => {
            service.setTitle('');
            expect(titleService.setTitle).toHaveBeenCalledWith('Suivi Séries');
        });
    });

    describe('setDescription', () => {
        it('should update meta description', () => {
            service.setDescription('Test description');
            expect(metaService.updateTag).toHaveBeenCalledWith({
                name: 'description',
                content: 'Test description'
            });
        });

        it('should use default description when empty', () => {
            service.setDescription('');
            expect(metaService.updateTag).toHaveBeenCalledWith({
                name: 'description',
                content: 'Suivez vos séries TV préférées, découvrez de nouveaux contenus et ne ratez jamais un épisode.'
            });
        });
    });

    describe('setOpenGraphData', () => {
        it('should set og tags', () => {
            service.setOpenGraphData('Title', 'Description', 'image.jpg', 'https://example.com');

            expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:title', content: 'Title - Suivi Séries' });
            expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:description', content: 'Description' });
            expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:type', content: 'website' });
            expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:url', content: 'https://example.com' });
            expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:image', content: 'image.jpg' });
        });

        it('should not set url and image when not provided', () => {
            metaService.updateTag.mockClear();
            service.setOpenGraphData('Title', 'Description');

            const calls = metaService.updateTag.mock.calls;
            expect(calls.some((c: unknown) => (c as [{ property?: string }])[0].property === 'og:url')).toBe(false);
            expect(calls.some((c: unknown) => (c as [{ property?: string }])[0].property === 'og:image')).toBe(false);
        });
    });

    describe('setTwitterCard', () => {
        it('should set twitter card tags', () => {
            service.setTwitterCard('Title', 'Description', 'image.jpg');

            expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'twitter:card', content: 'summary_large_image' });
            expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'twitter:title', content: 'Title - Suivi Séries' });
            expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'twitter:description', content: 'Description' });
            expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'twitter:image', content: 'image.jpg' });
        });
    });

    describe('setCanonicalUrl', () => {
        it('should add canonical link', () => {
            service.setCanonicalUrl('https://example.com/page');

            const canonical = document.querySelector('link[rel="canonical"]');
            expect(canonical).toBeTruthy();
            expect(canonical?.getAttribute('href')).toBe('https://example.com/page');
        });

        it('should replace existing canonical link', () => {
            service.setCanonicalUrl('https://example.com/page1');
            service.setCanonicalUrl('https://example.com/page2');

            const canonicals = document.querySelectorAll('link[rel="canonical"]');
            expect(canonicals.length).toBe(1);
            expect(canonicals[0].getAttribute('href')).toBe('https://example.com/page2');
        });
    });

    describe('updatePageMetadata', () => {
        it('should update all metadata', () => {
            service.updatePageMetadata({
                title: 'Test Page',
                description: 'Test Description',
                image: 'test.jpg',
                canonicalUrl: 'https://example.com'
            });

            expect(titleService.setTitle).toHaveBeenCalled();
            expect(metaService.updateTag).toHaveBeenCalled();
        });

        it('should skip og and twitter when disabled', () => {
            metaService.updateTag.mockClear();

            service.updatePageMetadata({
                title: 'Test',
                description: 'Test',
                includeOpenGraph: false,
                includeTwitter: false
            });

            const calls = metaService.updateTag.mock.calls;
            expect(calls.some((c: unknown) => (c as [{ property?: string }])[0].property?.startsWith('og:'))).toBe(false);
            expect(calls.some((c: unknown) => (c as [{ name?: string }])[0].name?.startsWith('twitter:'))).toBe(false);
        });
    });

    describe('trackCurrentPage', () => {
        it('should track page view', () => {
            service.trackCurrentPage();
            expect(googleAnalytics.pageView).toHaveBeenCalledWith('/test', 'Test Title');
        });

        it('should not throw on error', () => {
            googleAnalytics.pageView.mockImplementation(() => {
                throw new Error('Analytics error');
            });
            expect(() => service.trackCurrentPage()).not.toThrow();
        });
    });

    describe('resetToDefaults', () => {
        it('should reset all metadata', () => {
            service.resetToDefaults();
            expect(titleService.setTitle).toHaveBeenCalled();
            expect(metaService.updateTag).toHaveBeenCalled();
        });
    });

    afterEach(() => {
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            canonical.remove();
        }
    });
});
