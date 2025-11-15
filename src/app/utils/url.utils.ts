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

export function sanitizeText(text: string): string {
    return text
        .replaceAll(/<[^>]*>/g, '') // Remove HTML tags
        .replaceAll(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

export function getSerieCanonicalUrl(serieId: number, serieName: string, baseUrl?: string): string {
    const slug = createSlug(serieName);
    const base = baseUrl || (globalThis.window === undefined ? '' : globalThis.window.location.origin);
    return `${base}/serie/${serieId}/${slug}`;
}