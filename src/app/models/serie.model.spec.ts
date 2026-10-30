import { describe, it, expect } from 'vitest';

import { getTmdbImageUrl, getTmdbSrcset } from './serie.model';

describe('getTmdbImageUrl', () => {
    describe('bare paths, as the detail endpoint returns them', () => {
        it('should prefix the host and the requested size', () => {
            expect(getTmdbImageUrl('/abc.jpg', 'w500')).toBe(
                'https://image.tmdb.org/t/p/w500/abc.jpg',
            );
        });

        it('should default to w500', () => {
            expect(getTmdbImageUrl('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w500/abc.jpg');
        });
    });

    describe('full URLs, as the list endpoints return them', () => {
        it('should rewrite the size instead of prefixing a second host', () => {
            expect(getTmdbImageUrl('https://image.tmdb.org/t/p/w500/abc.jpg', 'w780')).toBe(
                'https://image.tmdb.org/t/p/w780/abc.jpg',
            );
        });

        it('should honour the requested size even when the response carried another', () => {
            expect(getTmdbImageUrl('https://image.tmdb.org/t/p/w1280/abc.jpg', 'w300')).toBe(
                'https://image.tmdb.org/t/p/w300/abc.jpg',
            );
        });

        it('should keep nested file segments intact', () => {
            expect(getTmdbImageUrl('https://image.tmdb.org/t/p/original/x/y.jpg', 'w500')).toBe(
                'https://image.tmdb.org/t/p/w500/x/y.jpg',
            );
        });
    });

    describe('missing artwork', () => {
        it('should return an empty string rather than throw on null', () => {
            expect(getTmdbImageUrl(null)).toBe('');
        });

        it('should return an empty string on undefined', () => {
            expect(getTmdbImageUrl(undefined)).toBe('');
        });

        it('should return an empty string on an empty path', () => {
            expect(getTmdbImageUrl('')).toBe('');
        });

        it('should never build a URL that points at the host with no file', () => {
            expect(getTmdbImageUrl(null)).not.toContain('image.tmdb.org');
        });
    });
});

describe('getTmdbSrcset', () => {
    it('should list each rendition with its pixel width', () => {
        expect(getTmdbSrcset('/abc.jpg', ['w780', 'w1280'])).toBe(
            'https://image.tmdb.org/t/p/w780/abc.jpg 780w, https://image.tmdb.org/t/p/w1280/abc.jpg 1280w',
        );
    });

    it('should rewrite the size baked into a full URL from a list endpoint', () => {
        expect(getTmdbSrcset('https://image.tmdb.org/t/p/w500/abc.jpg', ['w300'])).toBe(
            'https://image.tmdb.org/t/p/w300/abc.jpg 300w',
        );
    });

    it('should declare the original at the low end of its real range', () => {
        expect(getTmdbSrcset('/abc.jpg', ['original'])).toBe(
            'https://image.tmdb.org/t/p/original/abc.jpg 1920w',
        );
    });

    it('should return an empty string when there is no artwork', () => {
        expect(getTmdbSrcset(null, ['w780'])).toBe('');
        expect(getTmdbSrcset('', ['w780'])).toBe('');
    });
});
