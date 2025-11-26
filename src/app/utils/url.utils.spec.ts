import { describe, it, expect } from 'vitest';
import { createSlug, extractIdFromParam, getSerieCanonicalUrl, stripHtmlTags } from './url.utils';

describe('url.utils', () => {
    describe('createSlug', () => {
        it('should convert text to lowercase slug', () => {
            expect(createSlug('Breaking Bad')).toBe('breaking-bad');
        });

        it('should remove accents from French characters', () => {
            expect(createSlug('Café')).toBe('cafe');
            expect(createSlug('Élite')).toBe('elite');
            expect(createSlug('Être ou ne pas être')).toBe('etre-ou-ne-pas-etre');
        });

        it('should replace spaces with hyphens', () => {
            expect(createSlug('Game of Thrones')).toBe('game-of-thrones');
            expect(createSlug('The   Walking   Dead')).toBe('the-walking-dead');
        });

        it('should remove special characters', () => {
            expect(createSlug('Marvel\'s Agents of S.H.I.E.L.D.')).toBe('marvels-agents-of-shield');
            expect(createSlug('Tom & Jerry')).toBe('tom-jerry');
            expect(createSlug('Rick and Morty!!!')).toBe('rick-and-morty');
        });

        it('should handle leading and trailing spaces', () => {
            expect(createSlug('  Breaking Bad  ')).toBe('breaking-bad');
        });

        it('should handle multiple consecutive hyphens', () => {
            expect(createSlug('The---Walking---Dead')).toBe('the-walking-dead');
        });

        it('should handle leading and trailing hyphens', () => {
            expect(createSlug('---Breaking-Bad---')).toBe('breaking-bad');
        });

        it('should return empty string for null or undefined', () => {
            expect(createSlug(null as unknown as string)).toBe('');
            expect(createSlug(undefined as unknown as string)).toBe('');
        });

        it('should return empty string for non-string input', () => {
            expect(createSlug(123 as unknown as string)).toBe('');
            expect(createSlug({} as unknown as string)).toBe('');
        });

        it('should return empty string for empty string', () => {
            expect(createSlug('')).toBe('');
            expect(createSlug('   ')).toBe('');
        });

        it('should handle Unicode characters (Asian, Arabic, etc.)', () => {
            // Japanese
            expect(createSlug('進撃の巨人')).toBe('進撃の巨人');
            // Korean
            expect(createSlug('오징어 게임')).toBe('오징어-게임');
            // Arabic
            expect(createSlug('مسلسل عربي')).toBe('مسلسل-عربي');
        });

        it('should handle mixed Latin and Unicode characters', () => {
            const result = createSlug('Attack on Titan 進撃の巨人');
            // Should keep Unicode when Latin normalization fails
            expect(result).toMatch(/attack-on-titan/);
        });
    });

    describe('extractIdFromParam', () => {
        it('should extract valid numeric ID', () => {
            expect(extractIdFromParam('123')).toBe(123);
            expect(extractIdFromParam('456789')).toBe(456789);
        });

        it('should extract ID from string with leading zeros', () => {
            expect(extractIdFromParam('00123')).toBe(123);
        });

        it('should return 0 for invalid numeric strings', () => {
            expect(extractIdFromParam('abc')).toBe(0);
            expect(extractIdFromParam('12abc')).toBe(12); // parseInt stops at first non-digit
            expect(extractIdFromParam('abc123')).toBe(0);
        });

        it('should return 0 for empty string', () => {
            expect(extractIdFromParam('')).toBe(0);
        });

        it('should handle negative numbers', () => {
            expect(extractIdFromParam('-123')).toBe(-123);
        });

        it('should handle floating point numbers (truncate)', () => {
            expect(extractIdFromParam('123.456')).toBe(123);
        });
    });

    describe('getSerieCanonicalUrl', () => {
        it('should generate canonical URL with slug', () => {
            const url = getSerieCanonicalUrl(123, 'Breaking Bad', 'https://example.com');
            expect(url).toBe('https://example.com/serie/123/breaking-bad');
        });

        it('should handle series names with special characters', () => {
            const url = getSerieCanonicalUrl(456, 'Marvel\'s Agents of S.H.I.E.L.D.', 'https://example.com');
            expect(url).toBe('https://example.com/serie/456/marvels-agents-of-shield');
        });

        it('should handle series names with accents', () => {
            const url = getSerieCanonicalUrl(789, 'Élite', 'https://example.com');
            expect(url).toBe('https://example.com/serie/789/elite');
        });

        it('should use window.location.origin when baseUrl is not provided', () => {
            // Mock globalThis.window.location.origin
            const originalWindow = globalThis.window;
            (globalThis as { window: { location: { origin: string } } }).window = {
                location: { origin: 'https://suivi-series.zeffyr.com' }
            };

            const url = getSerieCanonicalUrl(123, 'Breaking Bad');
            expect(url).toBe('https://suivi-series.zeffyr.com/serie/123/breaking-bad');

            // Restore original window
            (globalThis as { window: typeof originalWindow }).window = originalWindow;
        });

        it('should use empty string when window is undefined and no baseUrl provided', () => {
            // Mock globalThis.window as undefined
            const originalWindow = globalThis.window;
            (globalThis as unknown as { window: undefined }).window = undefined;

            const url = getSerieCanonicalUrl(123, 'Breaking Bad');
            expect(url).toBe('/serie/123/breaking-bad');

            // Restore original window
            (globalThis as { window: typeof originalWindow }).window = originalWindow;
        });

        it('should handle Unicode series names', () => {
            const url = getSerieCanonicalUrl(999, '進撃の巨人', 'https://example.com');
            expect(url).toBe('https://example.com/serie/999/進撃の巨人');
        });

        it('should handle series with numeric IDs', () => {
            expect(getSerieCanonicalUrl(1, 'Test', 'https://example.com')).toBe('https://example.com/serie/1/test');
            expect(getSerieCanonicalUrl(999999, 'Test', 'https://example.com')).toBe('https://example.com/serie/999999/test');
        });
    });

    describe('stripHtmlTags', () => {
        it('should remove simple HTML tags', () => {
            expect(stripHtmlTags('<p>Hello World</p>')).toBe('Hello World');
            expect(stripHtmlTags('<div>Test</div>')).toBe('Test');
            expect(stripHtmlTags('<span>Text</span>')).toBe('Text');
        });

        it('should remove multiple HTML tags', () => {
            expect(stripHtmlTags('<p>Hello <strong>World</strong></p>')).toBe('Hello World');
            expect(stripHtmlTags('<div><span>Nested</span> <em>tags</em></div>')).toBe('Nested tags');
        });

        it('should remove HTML tags with attributes', () => {
            expect(stripHtmlTags('<p class="test" id="para">Text</p>')).toBe('Text');
            expect(stripHtmlTags('<a href="https://example.com">Link</a>')).toBe('Link');
            expect(stripHtmlTags('<img src="image.jpg" alt="test" />')).toBe('');
        });

        it('should normalize whitespace', () => {
            expect(stripHtmlTags('Hello    World')).toBe('Hello World');
            expect(stripHtmlTags('Multiple   spaces   here')).toBe('Multiple spaces here');
            expect(stripHtmlTags('  Leading and trailing  ')).toBe('Leading and trailing');
            expect(stripHtmlTags('Line\nbreaks\nhere')).toBe('Line breaks here');
            expect(stripHtmlTags('Tab\t\tcharacters')).toBe('Tab characters');
        });

        it('should handle empty string', () => {
            expect(stripHtmlTags('')).toBe('');
            expect(stripHtmlTags('   ')).toBe('');
        });

        it('should handle text without HTML tags', () => {
            expect(stripHtmlTags('Plain text')).toBe('Plain text');
            expect(stripHtmlTags('No tags here')).toBe('No tags here');
        });

        it('should handle malformed HTML tags', () => {
            expect(stripHtmlTags('<p>Unclosed tag')).toBe('Unclosed tag');
            expect(stripHtmlTags('Closing only</p>')).toBe('Closing only');
            expect(stripHtmlTags('<>Empty brackets<>')).toBe('Empty brackets');
        });

        it('should limit input length to 10000 characters (ReDoS protection)', () => {
            const longText = 'a'.repeat(15000);
            const result = stripHtmlTags(longText);
            expect(result.length).toBe(10000);
            expect(result).toBe('a'.repeat(10000));
        });

        it('should not remove tags where content between < > exceeds 100 characters (ReDoS protection)', () => {
            const longTag = '<div class="' + 'x'.repeat(150) + '">Content</div>';
            const result = stripHtmlTags(longTag);
            // Regex only matches tags where the content between < and > is 0-100 chars
            // This tag has >100 chars between < and >, so it won't match (by design)
            // This prevents catastrophic backtracking on malicious inputs
            expect(result).toContain('x'.repeat(150));
        });

        it('should handle mixed content with tags and whitespace', () => {
            expect(stripHtmlTags('<p>  Hello  </p>  <span>  World  </span>')).toBe('Hello World');
            expect(stripHtmlTags('  <div>Text</div>  ')).toBe('Text');
        });

        it('should handle self-closing tags', () => {
            expect(stripHtmlTags('Before <br/> After')).toBe('Before After');
            expect(stripHtmlTags('Image <img src="test.jpg"/> here')).toBe('Image here');
        });

        it('should preserve text between tags', () => {
            expect(stripHtmlTags('Start <b>bold</b> middle <i>italic</i> end')).toBe('Start bold middle italic end');
        });

        it('should handle Unicode characters', () => {
            expect(stripHtmlTags('<p>Café élite</p>')).toBe('Café élite');
            expect(stripHtmlTags('<div>日本語テキスト</div>')).toBe('日本語テキスト');
            expect(stripHtmlTags('<span>🚀 Emoji test 🎉</span>')).toBe('🚀 Emoji test 🎉');
        });

        it('should handle special characters in text', () => {
            expect(stripHtmlTags('<p>Price: $100 & €50</p>')).toBe('Price: $100 & €50');
            // Known limitation: "< 5 >" is matched as a tag (basic regex tradeoff for performance)
            // Acceptable for TMDB API metadata which doesn't contain mathematical notation
            expect(stripHtmlTags('<div>Math: 2 < 5 > 1</div>')).toBe('Math: 2 1');
        });
    });
});
