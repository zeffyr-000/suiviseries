import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SerieImagesComponent } from './serie-images.component';
import { SerieImages } from '../../models/serie.model';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';

describe('SerieImagesComponent', () => {
    let component: SerieImagesComponent;
    let fixture: ComponentFixture<SerieImagesComponent>;

    const mockImages: SerieImages = {
        backdrops: [
            {
                file_path: 'https://image.tmdb.org/t/p/original/backdrop1.jpg',
                width: 1920,
                height: 1080,
                aspect_ratio: 1.778,
                vote_average: 5.5,
                vote_count: 10,
                iso_639_1: null
            }
        ],
        posters: [
            {
                file_path: 'https://image.tmdb.org/t/p/original/poster1.jpg',
                width: 2000,
                height: 3000,
                aspect_ratio: 0.667,
                vote_average: 5.3,
                vote_count: 8,
                iso_639_1: 'fr'
            }
        ],
        logos: []
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                SerieImagesComponent,
                getTranslocoTestingModule()
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SerieImagesComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('images', mockImages);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Image Collections', () => {
        it('should display backdrops', () => {
            expect(component['hasBackdrops']()).toBe(true);
            expect(component['backdrops']().length).toBe(1);
        });

        it('should display posters', () => {
            expect(component['hasPosters']()).toBe(true);
            expect(component['posters']().length).toBe(1);
        });

        it('should handle empty collections', () => {
            fixture.componentRef.setInput('images', { backdrops: [], posters: [], logos: [] });
            fixture.detectChanges();

            expect(component['hasBackdrops']()).toBe(false);
            expect(component['hasPosters']()).toBe(false);
        });
    });

    describe('Image Preview', () => {
        it('should open and close preview', () => {
            const image = mockImages.backdrops[0];
            component['onImageClick'](image, 'backdrop');
            expect(component['selectedImage']()).toEqual(image);

            component['closePreview']();
            expect(component['selectedImage']()).toBeNull();
        });

        it('should set imageLoading to true when clicking an image', () => {
            const image = mockImages.backdrops[0];
            expect(component['imageLoading']()).toBe(false);

            component['onImageClick'](image, 'backdrop');
            expect(component['imageLoading']()).toBe(true);
        });

        it('should set imageLoading to false when image loads', () => {
            const image = mockImages.backdrops[0];
            component['onImageClick'](image, 'backdrop');
            expect(component['imageLoading']()).toBe(true);

            component['onImageLoad']();
            expect(component['imageLoading']()).toBe(false);
        });

        it('should set imageLoading to true when navigating between images', () => {
            const backdrops = [
                mockImages.backdrops[0],
                {
                    file_path: 'https://image.tmdb.org/t/p/original/backdrop2.jpg',
                    width: 1920,
                    height: 1080,
                    aspect_ratio: 1.778,
                    vote_average: 6,
                    vote_count: 12,
                    iso_639_1: null
                }
            ];
            fixture.componentRef.setInput('images', { backdrops, posters: [], logos: [] });
            fixture.detectChanges();

            const mockEvent = new MouseEvent('click');
            component['onImageClick'](backdrops[0], 'backdrop');
            component['onImageLoad']();
            expect(component['imageLoading']()).toBe(false);

            component['nextImage'](mockEvent);
            expect(component['imageLoading']()).toBe(true);

            component['onImageLoad']();
            expect(component['imageLoading']()).toBe(false);

            component['previousImage'](mockEvent);
            expect(component['imageLoading']()).toBe(true);
        });

        it('should navigate between images', () => {
            const backdrops = [
                mockImages.backdrops[0],
                {
                    file_path: 'https://image.tmdb.org/t/p/original/backdrop2.jpg',
                    width: 1920,
                    height: 1080,
                    aspect_ratio: 1.778,
                    vote_average: 6,
                    vote_count: 12,
                    iso_639_1: null
                }
            ];
            fixture.componentRef.setInput('images', { backdrops, posters: [], logos: [] });
            fixture.detectChanges();

            const mockEvent = new MouseEvent('click');
            component['onImageClick'](backdrops[0], 'backdrop');
            component['nextImage'](mockEvent);
            expect(component['selectedImage']()).toEqual(backdrops[1]);

            component['previousImage'](mockEvent);
            expect(component['selectedImage']()).toEqual(backdrops[0]);
        });
    });

    describe('Tab Navigation', () => {
        it('should update selected tab', () => {
            expect(component['selectedTab']()).toBe(0);

            component['onTabChange'](1);
            expect(component['selectedTab']()).toBe(1);
        });

        it('should update current images based on tab', () => {
            component['onTabChange'](1);
            const currentImages = component['currentImages']();
            expect(currentImages.length).toBe(mockImages.posters.length);
            expect(currentImages).toEqual(mockImages.posters);
        });
    });
});
