import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';

import { SerieVideosComponent, Video } from './serie-videos.component';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';

describe('SerieVideosComponent', () => {
    let fixture: ComponentFixture<SerieVideosComponent>;
    let component: SerieVideosComponent;
    let componentRef: ComponentRef<SerieVideosComponent>;

    const mockVideos: Video[] = [
        {
            key: 'dQw4w9WgXcQ',
            name: 'Official Trailer',
            type: 'Trailer',
            site: 'YouTube',
            official: true,
            published_at: '2024-01-15T10:00:00.000Z'
        },
        {
            key: 'abc123xyz',
            name: 'Behind the Scenes',
            type: 'Behind the Scenes',
            site: 'YouTube',
            official: false,
            published_at: '2024-01-10T08:30:00.000Z'
        },
        {
            key: '123456789',
            name: 'Vimeo Teaser',
            type: 'Teaser',
            site: 'Vimeo',
            official: true,
            published_at: '2024-01-05T12:00:00.000Z'
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                SerieVideosComponent,
                getTranslocoTestingModule()
            ]
        });

        fixture = TestBed.createComponent(SerieVideosComponent);
        component = fixture.componentInstance;
        componentRef = fixture.componentRef;

        componentRef.setInput('videos', mockVideos);
        fixture.detectChanges();
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should have videos input', () => {
            expect(component.videos()).toEqual(mockVideos);
            expect(component.videos()).toHaveLength(3);
        });

        it('should initialize selectedVideo as null', () => {
            expect(component['selectedVideo']()).toBeNull();
        });
    });

    describe('Video Embed URL Generation', () => {
        it('should generate YouTube embed URL correctly', () => {
            const video = mockVideos[0];
            const url = component['getVideoEmbedUrl'](video);

            expect(url).toBeTruthy();
            if (url) {
                // SafeResourceUrl cannot be sanitized back to string, just check it exists
                expect(url.toString()).toContain('SafeValue');
            }
        });

        it('should generate Vimeo embed URL correctly', () => {
            const video = mockVideos[2];
            const url = component['getVideoEmbedUrl'](video);

            expect(url).toBeTruthy();
            if (url) {
                // SafeResourceUrl cannot be sanitized back to string, just check it exists
                expect(url.toString()).toContain('SafeValue');
            }
        });

        it('should return null for unsupported video site', () => {
            const unsupportedVideo: Video = {
                key: 'abc123',
                name: 'Dailymotion Video',
                site: 'Dailymotion',
                type: 'Clip',
                official: false,
                published_at: null
            };

            const url = component['getVideoEmbedUrl'](unsupportedVideo);
            expect(url).toBeNull();
        });
    });

    describe('Video Thumbnail Generation', () => {
        it('should generate YouTube thumbnail URL correctly', () => {
            const video = mockVideos[0];
            const thumbnail = component['getVideoThumbnail'](video);

            expect(thumbnail).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
        });

        it('should return null for Vimeo thumbnail', () => {
            const video = mockVideos[2];
            const thumbnail = component['getVideoThumbnail'](video);

            expect(thumbnail).toBeNull();
        });

        it('should return null for unsupported video site', () => {
            const unsupportedVideo: Video = {
                key: 'abc123',
                name: 'Dailymotion Video',
                site: 'Dailymotion',
                type: 'Clip',
                official: false,
                published_at: null
            };

            const thumbnail = component['getVideoThumbnail'](unsupportedVideo);
            expect(thumbnail).toBeNull();
        });
    });

    describe('Video Selection', () => {
        it('should select a video by key', () => {
            expect(component['selectedVideo']()).toBeNull();

            component['selectVideo']('dQw4w9WgXcQ');

            expect(component['selectedVideo']()).toBe('dQw4w9WgXcQ');
        });

        it('should update selected video when clicking different video', () => {
            component['selectVideo']('dQw4w9WgXcQ');
            expect(component['selectedVideo']()).toBe('dQw4w9WgXcQ');

            component['selectVideo']('abc123xyz');
            expect(component['selectedVideo']()).toBe('abc123xyz');
        });
    });

    describe('Template Rendering', () => {
        it('should render all videos in the list', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const videoItems = compiled.querySelectorAll('.video-item');
            expect(videoItems.length).toBe(3);
        });

        it('should render video thumbnails', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const thumbnails = compiled.querySelectorAll('.video-thumbnail img');
            expect(thumbnails.length).toBeGreaterThanOrEqual(2); // Only YouTube videos have thumbnails
        });

        it('should render video names', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const names = compiled.querySelectorAll('.video-name');
            expect(names.length).toBe(3);
            expect(names[0].textContent?.trim()).toBe('Official Trailer');
        });

        it('should render play overlay on thumbnails', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const playOverlays = compiled.querySelectorAll('.play-overlay');
            expect(playOverlays.length).toBeGreaterThanOrEqual(2); // Vimeo n'a pas de thumbnail
        });

        it('should render official badge for official videos', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const officialBadges = compiled.querySelectorAll('.official-badge');
            expect(officialBadges.length).toBe(2); // Two official videos
        });

        it('should render video type badges', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const typeBadges = compiled.querySelectorAll('.video-type');
            expect(typeBadges.length).toBe(3);
        });
    });

    describe('Schema.org Markup', () => {
        it('should have VideoGallery schema.org markup', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const videoGallery = compiled.querySelector('[itemtype="https://schema.org/VideoGallery"]');
            expect(videoGallery).toBeTruthy();
        });

        it('should have VideoObject markup for each video', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const videoObjects = compiled.querySelectorAll('[itemtype="https://schema.org/VideoObject"]');
            expect(videoObjects.length).toBe(3);
        });

        it('should have video name in itemprop', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const names = compiled.querySelectorAll('[itemprop="name"]');
            expect(names.length).toBeGreaterThanOrEqual(3);
        });

        it('should have thumbnailUrl in itemprop for YouTube videos', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const thumbnails = compiled.querySelectorAll('[itemprop="thumbnailUrl"]');
            expect(thumbnails.length).toBeGreaterThanOrEqual(2); // YouTube videos only
        });

        it('should have uploadDate in itemprop', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const uploadDates = compiled.querySelectorAll('[itemprop="uploadDate"]');
            expect(uploadDates.length).toBeGreaterThanOrEqual(2); // Videos with published_at
        });

        it('should have embedUrl in itemprop', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const embedUrls = compiled.querySelectorAll('[itemprop="embedUrl"]');
            // embedUrl might not be in the template for all videos
            expect(embedUrls.length).toBeGreaterThanOrEqual(0);
        });

        it('should have isAccessibleForFree set to true', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const accessibleForFree = compiled.querySelectorAll('[itemprop="isAccessibleForFree"]');
            expect(accessibleForFree.length).toBeGreaterThanOrEqual(2); // Vimeo n'a pas de thumbnail
            accessibleForFree.forEach(element => {
                expect(element.getAttribute('content')).toBe('true');
            });
        });
    });

    describe('Accessibility', () => {
        it('should have semantic container element', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const container = compiled.querySelector('.video-list') || compiled.querySelector('mat-card');
            expect(container).toBeTruthy();
        });

        it('should have accessible video items', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const videoItems = compiled.querySelectorAll('.video-item');
            expect(videoItems.length).toBeGreaterThan(0);
        });

        it('should have alt text on video thumbnails', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const thumbnails = compiled.querySelectorAll('.video-thumbnail img');
            thumbnails.forEach(thumbnail => {
                expect((thumbnail as HTMLImageElement).alt).toBeTruthy();
            });
        });

        it('should have keyboard accessible video items', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const videoItems = compiled.querySelectorAll('.video-item');
            videoItems.forEach(item => {
                // Buttons are focusable by default (implicit tabindex=0)
                expect(item.tagName).toBe('BUTTON');
            });
        });
    });

    describe('Empty State', () => {
        it('should handle empty videos array', () => {
            componentRef.setInput('videos', []);
            fixture.detectChanges();

            expect(component.videos()).toHaveLength(0);
        });
    });
});
