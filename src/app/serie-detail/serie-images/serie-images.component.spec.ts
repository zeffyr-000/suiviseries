import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
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

    describe('Swipe Gesture', () => {
        const multipleBackdrops = [
            {
                file_path: 'https://image.tmdb.org/t/p/original/backdrop1.jpg',
                width: 1920,
                height: 1080,
                aspect_ratio: 1.778,
                vote_average: 5.5,
                vote_count: 10,
                iso_639_1: null
            },
            {
                file_path: 'https://image.tmdb.org/t/p/original/backdrop2.jpg',
                width: 1920,
                height: 1080,
                aspect_ratio: 1.778,
                vote_average: 6,
                vote_count: 12,
                iso_639_1: null
            },
            {
                file_path: 'https://image.tmdb.org/t/p/original/backdrop3.jpg',
                width: 1920,
                height: 1080,
                aspect_ratio: 1.778,
                vote_average: 7,
                vote_count: 15,
                iso_639_1: null
            }
        ];

        beforeEach(() => {
            fixture.componentRef.setInput('images', { backdrops: multipleBackdrops, posters: [], logos: [] });
            fixture.detectChanges();
            component['onImageClick'](multipleBackdrops[1], 'backdrop');
        });

        afterEach(() => {
            vi.restoreAllMocks();
            sessionStorage.clear();
        });

        it('should navigate to next image on swipe left (touch)', () => {
            const pointerDown = new PointerEvent('pointerdown', {
                clientX: 300,
                clientY: 200,
                pointerId: 1,
                pointerType: 'touch'
            });
            const pointerUp = new PointerEvent('pointerup', {
                clientX: 100,
                clientY: 200,
                pointerId: 1,
                pointerType: 'touch'
            });

            component['onPointerDown'](pointerDown);
            component['onPointerUp'](pointerUp);

            expect(component['selectedImage']()).toEqual(multipleBackdrops[2]);
        });

        it('should navigate to previous image on swipe right (touch)', () => {
            const pointerDown = new PointerEvent('pointerdown', {
                clientX: 100,
                clientY: 200,
                pointerId: 1,
                pointerType: 'touch'
            });
            const pointerUp = new PointerEvent('pointerup', {
                clientX: 300,
                clientY: 200,
                pointerId: 1,
                pointerType: 'touch'
            });

            component['onPointerDown'](pointerDown);
            component['onPointerUp'](pointerUp);

            expect(component['selectedImage']()).toEqual(multipleBackdrops[0]);
        });

        it('should navigate on swipe with pen input', () => {
            const pointerDown = new PointerEvent('pointerdown', {
                clientX: 300,
                clientY: 200,
                pointerId: 1,
                pointerType: 'pen'
            });
            const pointerUp = new PointerEvent('pointerup', {
                clientX: 100,
                clientY: 200,
                pointerId: 1,
                pointerType: 'pen'
            });

            component['onPointerDown'](pointerDown);
            component['onPointerUp'](pointerUp);

            expect(component['selectedImage']()).toEqual(multipleBackdrops[2]);
        });

        it('should ignore swipe when pointer IDs do not match (multi-touch)', () => {
            const initialImage = component['selectedImage']();
            const pointerDown = new PointerEvent('pointerdown', {
                clientX: 300,
                clientY: 200,
                pointerId: 1,
                pointerType: 'touch'
            });
            const pointerUp = new PointerEvent('pointerup', {
                clientX: 100,
                clientY: 200,
                pointerId: 2, // Different pointer ID (second finger)
                pointerType: 'touch'
            });

            component['onPointerDown'](pointerDown);
            component['onPointerUp'](pointerUp);

            expect(component['selectedImage']()).toEqual(initialImage);
        });

        it('should ignore mouse pointer events for swipe', () => {
            const initialImage = component['selectedImage']();
            const pointerDown = new PointerEvent('pointerdown', {
                clientX: 300,
                clientY: 200,
                pointerId: 1,
                pointerType: 'mouse'
            });
            const pointerUp = new PointerEvent('pointerup', {
                clientX: 100,
                clientY: 200,
                pointerId: 1,
                pointerType: 'mouse'
            });

            component['onPointerDown'](pointerDown);
            component['onPointerUp'](pointerUp);

            expect(component['selectedImage']()).toEqual(initialImage);
        });

        it('should not navigate if swipe distance is too small', () => {
            const initialImage = component['selectedImage']();
            const pointerDown = new PointerEvent('pointerdown', {
                clientX: 200,
                clientY: 200,
                pointerId: 1,
                pointerType: 'touch'
            });
            const pointerUp = new PointerEvent('pointerup', {
                clientX: 180,
                clientY: 200,
                pointerId: 1,
                pointerType: 'touch'
            });

            component['onPointerDown'](pointerDown);
            component['onPointerUp'](pointerUp);

            expect(component['selectedImage']()).toEqual(initialImage);
        });

        it('should not navigate if swipe takes too long (exceeds SWIPE_MAX_TIME)', () => {
            vi.useFakeTimers();

            const initialImage = component['selectedImage']();
            const pointerDown = new PointerEvent('pointerdown', {
                clientX: 300,
                clientY: 200,
                pointerId: 1,
                pointerType: 'touch'
            });

            component['onPointerDown'](pointerDown);

            // Advance time beyond SWIPE_MAX_TIME (500ms)
            vi.advanceTimersByTime(600);

            const pointerUp = new PointerEvent('pointerup', {
                clientX: 100,
                clientY: 200,
                pointerId: 1,
                pointerType: 'touch'
            });

            component['onPointerUp'](pointerUp);

            expect(component['selectedImage']()).toEqual(initialImage);

            vi.useRealTimers();
        });

        it('should not navigate if vertical movement is too large', () => {
            const initialImage = component['selectedImage']();
            const pointerDown = new PointerEvent('pointerdown', {
                clientX: 300,
                clientY: 100,
                pointerId: 1,
                pointerType: 'touch'
            });
            const pointerUp = new PointerEvent('pointerup', {
                clientX: 100,
                clientY: 300,
                pointerId: 1,
                pointerType: 'touch'
            });

            component['onPointerDown'](pointerDown);
            component['onPointerUp'](pointerUp);

            expect(component['selectedImage']()).toEqual(initialImage);
        });

        it('should reset swipe state on pointer cancel', () => {
            const pointerDown = new PointerEvent('pointerdown', {
                clientX: 300,
                clientY: 200,
                pointerId: 1,
                pointerType: 'touch'
            });

            component['onPointerDown'](pointerDown);
            component['onPointerCancel']();

            // After cancel, a pointerup should do nothing
            const pointerUp = new PointerEvent('pointerup', {
                clientX: 100,
                clientY: 200,
                pointerId: 1,
                pointerType: 'touch'
            });
            const initialImage = component['selectedImage']();
            component['onPointerUp'](pointerUp);

            expect(component['selectedImage']()).toEqual(initialImage);
        });

        it('should reset swipe state on visibility change', () => {
            const pointerDown = new PointerEvent('pointerdown', {
                clientX: 300,
                clientY: 200,
                pointerId: 1,
                pointerType: 'touch'
            });

            component['onPointerDown'](pointerDown);
            expect(component['swipeState']).not.toBeNull();

            // Simulate visibility change (user switches tabs)
            component['onVisibilityChange']();
            expect(component['swipeState']).toBeNull();
        });

        it('should ignore swipe starting on interactive elements', () => {
            const button = document.createElement('button');
            const pointerDown = new PointerEvent('pointerdown', {
                clientX: 300,
                clientY: 200,
                pointerId: 1,
                pointerType: 'touch'
            });
            Object.defineProperty(pointerDown, 'target', { value: button });

            component['onPointerDown'](pointerDown);
            expect(component['swipeState']).toBeNull();
        });

        it('should show swipe hint on mobile devices', () => {
            // Mock touch device
            const originalOntouchstart = (globalThis as { ontouchstart?: unknown }).ontouchstart;
            Object.defineProperty(globalThis, 'ontouchstart', { value: true, configurable: true });
            sessionStorage.removeItem('swipeHintSeen');

            vi.useFakeTimers();

            component['onImageClick'](multipleBackdrops[0], 'backdrop');
            expect(component['showSwipeHint']()).toBe(true);

            vi.advanceTimersByTime(3000);
            expect(component['showSwipeHint']()).toBe(false);

            vi.useRealTimers();

            // Restore
            if (originalOntouchstart === undefined) {
                delete (globalThis as { ontouchstart?: unknown }).ontouchstart;
            } else {
                Object.defineProperty(globalThis, 'ontouchstart', { value: originalOntouchstart, configurable: true });
            }
        });

        it('should not show swipe hint twice in the same session', () => {
            const originalOntouchstart = (globalThis as { ontouchstart?: unknown }).ontouchstart;
            sessionStorage.setItem('swipeHintSeen', 'true');
            Object.defineProperty(globalThis, 'ontouchstart', { value: true, configurable: true });

            component['onImageClick'](multipleBackdrops[0], 'backdrop');
            expect(component['showSwipeHint']()).toBe(false);

            // Restore
            if (originalOntouchstart === undefined) {
                delete (globalThis as { ontouchstart?: unknown }).ontouchstart;
            } else {
                Object.defineProperty(globalThis, 'ontouchstart', { value: originalOntouchstart, configurable: true });
            }
        });
    });
});
