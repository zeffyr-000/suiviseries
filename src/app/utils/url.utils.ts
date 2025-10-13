export function createSlug(text: string): string {
    if (!text || typeof text !== 'string') {
        return '';
    }

    return text
        .toLowerCase()
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
        .replace(/[^a-z0-9 -]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
        .trim();
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