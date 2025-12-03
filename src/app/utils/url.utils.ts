export function createSlug(text: string): string {
    if (!text || typeof text !== 'string') {
        return '';
    }

    // Try to create Latin slug first
    const latinSlug = text
        .toLowerCase()
        .trim()
        .normalize('NFD') // Decompose accented characters
        .replaceAll(/[\u0300-\u036f]/g, '') // Remove accent marks
        .replaceAll(/[^a-z0-9\s-]/g, '') // Remove special characters except whitespace and hyphens
        .replaceAll(/\s+/g, '-') // Replace whitespace with hyphens
        .replaceAll(/-+/g, '-') // Replace multiple hyphens with single
        .replaceAll(/^-+/g, '') // Remove leading hyphens
        .replaceAll(/-+$/g, ''); // Remove trailing hyphens

    // If Latin slug is empty (e.g., Asian characters), use Unicode-safe approach
    if (latinSlug) {
        return latinSlug;
    }

    return text
        .toLowerCase()
        .trim()
        .replaceAll(/[^\p{L}\p{N}\s-]/gu, '') // Keep letters, numbers, whitespace, and hyphens (Unicode-aware)
        .replaceAll(/\s+/g, '-') // Replace whitespace with hyphens
        .replaceAll(/-+/g, '-') // Replace multiple hyphens with single
        .replaceAll(/^-+/g, '') // Remove leading hyphens
        .replaceAll(/-+$/g, ''); // Remove trailing hyphens
}

export function extractIdFromParam(param: string): number {
    const id = Number.parseInt(param, 10);
    return Number.isNaN(id) ? 0 : id;
}

// Strip HTML tags from text for display purposes only
// WARNING: This is NOT a security sanitizer - does not protect against XSS attacks
// Only use with trusted API data (TMDB) - never with user-generated content
// For security-critical sanitization, use Angular's DOMSanitizer or DOMPurify
export function stripHtmlTags(text: string): string {
    // Limit input length to prevent ReDoS on extremely long strings
    const maxLength = 10000;
    const safeText = text.length > maxLength ? text.substring(0, maxLength) : text;

    return safeText
        .replaceAll(/<[^>]{0,100}>/g, '') // Remove HTML tags with max 100 chars (prevents ReDoS)
        .replaceAll(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

export function getSerieCanonicalUrl(serieId: number, serieName: string, baseUrl?: string): string {
    const slug = createSlug(serieName);
    const base = baseUrl || (globalThis.window === undefined ? '' : globalThis.window.location.origin);
    return `${base}/serie/${serieId}/${slug}`;
}
export function formatRelativeDate(dateString: string, translateFn: (key: string, params?: Record<string, number>) => string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return translateFn('notification.date.just_now');
    if (diffMins < 60) return translateFn('notification.date.minutes_ago', { count: diffMins });
    if (diffHours < 24) return translateFn('notification.date.hours_ago', { count: diffHours });
    if (diffDays < 7) return translateFn('notification.date.days_ago', { count: diffDays });

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
