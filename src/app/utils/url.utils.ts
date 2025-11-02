export function createSlug(text: string): string {
    if (!text || typeof text !== 'string') {
        return '';
    }

    // Try to create Latin slug first
    const latinSlug = text
        .toLowerCase()
        .trim()
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except whitespace and hyphens
        .replace(/\s+/g, '-') // Replace whitespace with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    // If Latin slug is empty (e.g., Asian characters), use Unicode-safe approach
    if (!latinSlug) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\p{L}\p{N}\s-]/gu, '') // Keep letters, numbers, whitespace, and hyphens (Unicode-aware)
            .replace(/\s+/g, '-') // Replace whitespace with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }

    return latinSlug;
}

export function extractIdFromParam(param: string): number {
    const id = parseInt(param, 10);
    return isNaN(id) ? 0 : id;
}

export function sanitizeText(text: string): string {
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

export function getSerieCanonicalUrl(serieId: number, serieName: string, baseUrl?: string): string {
    const slug = createSlug(serieName);
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${base}/serie/${serieId}/${slug}`;
}