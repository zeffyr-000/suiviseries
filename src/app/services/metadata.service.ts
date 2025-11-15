import { Injectable, inject, RendererFactory2, DOCUMENT } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
    providedIn: 'root'
})
export class MetadataService {
    private readonly titleService = inject(Title);
    private readonly metaService = inject(Meta);
    private readonly googleAnalytics = inject(GoogleAnalyticsService);
    private readonly router = inject(Router);
    private readonly document = inject(DOCUMENT);
    private readonly renderer = inject(RendererFactory2).createRenderer(null, null);
    private readonly transloco = inject(TranslocoService);

    private get defaultTitle(): string {
        return this.transloco.translate('app.title');
    }

    private get defaultDescription(): string {
        return this.transloco.translate('app.description');
    }

    setTitle(title: string): void {
        const fullTitle = title ? `${title} - ${this.defaultTitle}` : this.defaultTitle;
        this.titleService.setTitle(fullTitle);
    }

    setDescription(description: string): void {
        this.metaService.updateTag({
            name: 'description',
            content: description || this.defaultDescription
        });
    }

    setOpenGraphData(title: string, description: string, image?: string, url?: string): void {
        const fullTitle = title ? `${title} - ${this.defaultTitle}` : this.defaultTitle;

        this.metaService.updateTag({ property: 'og:title', content: fullTitle });
        this.metaService.updateTag({ property: 'og:description', content: description || this.defaultDescription });
        this.metaService.updateTag({ property: 'og:type', content: 'website' });

        if (url) {
            this.metaService.updateTag({ property: 'og:url', content: url });
        }

        if (image) {
            this.metaService.updateTag({ property: 'og:image', content: image });
        }
    }

    setTwitterCard(title: string, description: string, image?: string): void {
        const fullTitle = title ? `${title} - ${this.defaultTitle}` : this.defaultTitle;

        this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
        this.metaService.updateTag({ name: 'twitter:description', content: description || this.defaultDescription });

        if (image) {
            this.metaService.updateTag({ name: 'twitter:image', content: image });
        }
    }

    setCanonicalUrl(url: string): void {
        const head = this.document.head;
        const existingCanonical = this.document.querySelector('link[rel="canonical"]');

        if (existingCanonical) {
            this.renderer.removeChild(head, existingCanonical);
        }

        const canonical = this.renderer.createElement('link');
        this.renderer.setAttribute(canonical, 'rel', 'canonical');
        this.renderer.setAttribute(canonical, 'href', url);
        this.renderer.appendChild(head, canonical);
    }

    updatePageMetadata(options: {
        title: string;
        description: string;
        image?: string;
        canonicalUrl?: string;
        includeOpenGraph?: boolean;
        includeTwitter?: boolean;
    }): void {
        const {
            title,
            description,
            image,
            canonicalUrl,
            includeOpenGraph = true,
            includeTwitter = true
        } = options;

        this.setTitle(title);
        this.setDescription(description);

        if (canonicalUrl) {
            this.setCanonicalUrl(canonicalUrl);
        }

        if (includeOpenGraph) {
            this.setOpenGraphData(title, description, image, canonicalUrl);
        }

        if (includeTwitter) {
            this.setTwitterCard(title, description, image);
        }
    }

    trackCurrentPage(): void {
        try {
            const currentPath = this.router.url;
            const currentTitle = this.titleService.getTitle();

            this.googleAnalytics.pageView(currentPath, currentTitle);
        } catch (error) {
            // Fail silently - analytics should never break the application
            if (error instanceof Error) {
                console.warn('Google Analytics tracking failed:', {
                    message: error.message,
                    name: error.name,
                    path: this.router.url
                });
            } else {
                console.warn('Google Analytics tracking failed with non-Error:', error);
            }
        }
    }

    resetToDefaults(): void {
        this.setTitle('');
        this.setDescription('');
        this.setOpenGraphData('', '');
        this.setTwitterCard('', '');
    }
}