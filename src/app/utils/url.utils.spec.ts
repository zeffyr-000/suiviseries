import { describe, it, expect, vi } from 'vitest';
import { createSlug, extractIdFromParam, formatRelativeDate, getSerieCanonicalUrl, getSerieRoutePath, getSerieRouteParams, stripHtmlTags } from './url.utils';

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

    describe('getSerieRoutePath', () => {
        it('should generate route path with slug', () => {
            const path = getSerieRoutePath(123, 'Breaking Bad');
            expect(path).toBe('/serie/123/breaking-bad');
        });

        it('should handle special characters in serie name', () => {
            const path = getSerieRoutePath(456, 'Marvel\'s Agents of S.H.I.E.L.D.');
            expect(path).toBe('/serie/456/marvels-agents-of-shield');
        });

        it('should handle accented characters', () => {
            const path = getSerieRoutePath(789, 'Élite');
            expect(path).toBe('/serie/789/elite');
        });

        it('should handle unicode characters', () => {
            const path = getSerieRoutePath(999, '進撃の巨人');
            expect(path).toBe('/serie/999/進撃の巨人');
        });
    });

    describe('getSerieRouteParams', () => {
        it('should return array of route parameters', () => {
            const params = getSerieRouteParams(123, 'Breaking Bad');
            expect(params).toEqual(['/serie', 123, 'breaking-bad']);
        });

        it('should handle special characters in serie name', () => {
            const params = getSerieRouteParams(456, 'Game of Thrones');
            expect(params).toEqual(['/serie', 456, 'game-of-thrones']);
        });

        it('should handle accented characters', () => {
            const params = getSerieRouteParams(789, 'Café');
            expect(params).toEqual(['/serie', 789, 'cafe']);
        });

        it('should be compatible with router.navigate()', () => {
            const params = getSerieRouteParams(100, 'Test Serie');
            expect(Array.isArray(params)).toBe(true);
            expect(params.length).toBe(3);
            expect(params[0]).toBe('/serie');
            expect(typeof params[1]).toBe('number');
            expect(typeof params[2]).toBe('string');
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

    describe('formatRelativeDate', () => {
        it('should return "just now" for times less than 1 minute ago', () => {
            const now = new Date();
            const translate = vi.fn((key: string) => key);

            expect(formatRelativeDate(now.toISOString(), translate)).toBe('notification.date.just_now');
            expect(translate).toHaveBeenCalledWith('notification.date.just_now');
        });

        it('should return minutes ago for times between 1 and 59 minutes', () => {
            const now = new Date();
            const translate = vi.fn((key: string, params?: Record<string, unknown>) =>
                params ? `${key}:${params['count']}` : key
            );

            // 5 minutes ago
            const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
            expect(formatRelativeDate(fiveMinAgo.toISOString(), translate)).toBe('notification.date.minutes_ago:5');
            expect(translate).toHaveBeenCalledWith('notification.date.minutes_ago', { count: 5 });

            translate.mockClear();

            // 59 minutes ago
            const fiftyNineMinAgo = new Date(now.getTime() - 59 * 60 * 1000);
            expect(formatRelativeDate(fiftyNineMinAgo.toISOString(), translate)).toBe('notification.date.minutes_ago:59');
            expect(translate).toHaveBeenCalledWith('notification.date.minutes_ago', { count: 59 });
        });

        it('should return hours ago for times between 1 and 23 hours', () => {
            const now = new Date();
            const translate = vi.fn((key: string, params?: Record<string, unknown>) =>
                params ? `${key}:${params['count']}` : key
            );

            // 3 hours ago
            const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
            expect(formatRelativeDate(threeHoursAgo.toISOString(), translate)).toBe('notification.date.hours_ago:3');
            expect(translate).toHaveBeenCalledWith('notification.date.hours_ago', { count: 3 });

            translate.mockClear();

            // 23 hours ago
            const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000);
            expect(formatRelativeDate(twentyThreeHoursAgo.toISOString(), translate)).toBe('notification.date.hours_ago:23');
            expect(translate).toHaveBeenCalledWith('notification.date.hours_ago', { count: 23 });
        });

        it('should return days ago for times between 1 and 6 days', () => {
            const now = new Date();
            const translate = vi.fn((key: string, params?: Record<string, unknown>) =>
                params ? `${key}:${params['count']}` : key
            );

            // 2 days ago
            const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
            expect(formatRelativeDate(twoDaysAgo.toISOString(), translate)).toBe('notification.date.days_ago:2');
            expect(translate).toHaveBeenCalledWith('notification.date.days_ago', { count: 2 });

            translate.mockClear();

            // 6 days ago
            const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
            expect(formatRelativeDate(sixDaysAgo.toISOString(), translate)).toBe('notification.date.days_ago:6');
            expect(translate).toHaveBeenCalledWith('notification.date.days_ago', { count: 6 });
        });

        it('should return formatted date for times 7 days ago or older', () => {
            const translate = vi.fn();

            // 7 days ago
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const result7 = formatRelativeDate(sevenDaysAgo.toISOString(), translate);
            // French format: "26 nov."
            expect(result7).toMatch(/^\d{1,2}\s[\wéû]+\.$/u);
            expect(translate).not.toHaveBeenCalled();

            translate.mockClear();

            // 30 days ago
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const result30 = formatRelativeDate(thirtyDaysAgo.toISOString(), translate);
            expect(result30).toMatch(/^\d{1,2}\s[\wéû]+\.$/u);
            expect(translate).not.toHaveBeenCalled();

            translate.mockClear();

            // 1 year ago
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            const resultYear = formatRelativeDate(oneYearAgo.toISOString(), translate);
            expect(resultYear).toMatch(/^\d{1,2}\s[\wéû]+\.$/u);
            expect(translate).not.toHaveBeenCalled();
        });

        it('should handle boundary conditions correctly', () => {
            const now = new Date();
            const translate = vi.fn((key: string, params?: Record<string, unknown>) =>
                params ? `${key}:${params['count']}` : key
            );

            // 59.9 seconds (should round to "just now")
            const almostOneMin = new Date(now.getTime() - 59 * 1000 - 900);
            expect(formatRelativeDate(almostOneMin.toISOString(), translate)).toBe('notification.date.just_now');

            translate.mockClear();

            // 60 seconds (should be "1 minute ago")
            const exactlyOneMin = new Date(now.getTime() - 60 * 1000);
            expect(formatRelativeDate(exactlyOneMin.toISOString(), translate)).toBe('notification.date.minutes_ago:1');

            translate.mockClear();

            // 59.9 minutes (should be "59 minutes ago")
            const almostOneHour = new Date(now.getTime() - 59 * 60 * 1000 - 59 * 1000);
            expect(formatRelativeDate(almostOneHour.toISOString(), translate)).toBe('notification.date.minutes_ago:59');

            translate.mockClear();

            // 60 minutes (should be "1 hour ago")
            const exactlyOneHour = new Date(now.getTime() - 60 * 60 * 1000);
            expect(formatRelativeDate(exactlyOneHour.toISOString(), translate)).toBe('notification.date.hours_ago:1');

            translate.mockClear();

            // 23.9 hours (should be "23 hours ago")
            const almostOneDay = new Date(now.getTime() - 23 * 60 * 60 * 1000 - 59 * 60 * 1000);
            expect(formatRelativeDate(almostOneDay.toISOString(), translate)).toBe('notification.date.hours_ago:23');

            translate.mockClear();

            // 24 hours (should be "1 day ago")
            const exactlyOneDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            expect(formatRelativeDate(exactlyOneDay.toISOString(), translate)).toBe('notification.date.days_ago:1');

            translate.mockClear();

            // 6.9 days (should be "6 days ago")
            const almostSevenDays = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 - 23 * 60 * 60 * 1000);
            expect(formatRelativeDate(almostSevenDays.toISOString(), translate)).toBe('notification.date.days_ago:6');

            translate.mockClear();

            // 7 days (should return formatted date)
            const exactlySevenDays = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const result = formatRelativeDate(exactlySevenDays.toISOString(), translate);
            expect(result).toMatch(/^\d{1,2}\s[\wéû]+\.$/u);
            expect(translate).not.toHaveBeenCalled();
        });

        it('should handle future dates (negative time difference)', () => {
            const now = new Date();
            const translate = vi.fn((key: string) => key);

            // 1 hour in the future
            const futureDate = new Date(now.getTime() + 60 * 60 * 1000);
            const result = formatRelativeDate(futureDate.toISOString(), translate);

            // Negative diffMins will be < 1, so returns "just now"
            expect(result).toBe('notification.date.just_now');
        });

        it('should handle different date string formats', () => {
            const now = new Date();
            const translate = vi.fn((key: string) => key);

            // ISO 8601 format
            const isoDate = new Date(now.getTime() - 5 * 60 * 1000);
            expect(formatRelativeDate(isoDate.toISOString(), translate)).toBeTruthy();

            // Date object toString
            const dateString = new Date(now.getTime() - 5 * 60 * 1000).toString();
            expect(formatRelativeDate(dateString, translate)).toBeTruthy();
        });

        it('should handle very old dates correctly', () => {
            const translate = vi.fn();

            // 10 years ago
            const veryOldDate = new Date();
            veryOldDate.setFullYear(veryOldDate.getFullYear() - 10);

            const result = formatRelativeDate(veryOldDate.toISOString(), translate);
            expect(result).toMatch(/^\d{1,2}\s[\wéû]+\.$/u);
            expect(translate).not.toHaveBeenCalled();
        });

        it('should use fr-FR locale for date formatting', () => {
            const translate = vi.fn();

            // Create a specific date for consistent testing
            const oldDate = new Date('2020-01-15T12:00:00Z');
            const result = formatRelativeDate(oldDate.toISOString(), translate);

            // French date format: "15 janv."
            expect(result).toMatch(/^\d{1,2}\s[\wéû]+\.$/u);
            expect(result).toContain('janv.');
        });
    });
});
