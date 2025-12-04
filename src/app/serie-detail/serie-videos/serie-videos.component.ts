import { Component, input, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslocoModule } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface Video {
    key: string;
    name: string;
    site: string;
    type: string;
    official: boolean;
    published_at: string | null;
}

@Component({
    selector: 'app-serie-videos',
    imports: [
        TranslocoModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './serie-videos.component.html',
    styleUrl: './serie-videos.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SerieVideosComponent {
    videos = input.required<Video[]>();

    protected selectedVideo = signal<string | null>(null);
    private readonly sanitizer = inject(DomSanitizer);

    protected getVideoEmbedUrl(video: Video): SafeResourceUrl | null {
        // Validate video.key format to prevent XSS attacks
        // YouTube keys: alphanumeric, dash, underscore (11 chars typically)
        // Vimeo keys: numeric only
        const isValidYouTubeKey = /^[\w-]{10,20}$/.test(video.key);
        const isValidVimeoKey = /^\d{8,12}$/.test(video.key);

        let url: string | null = null;

        if (video.site === 'YouTube' && isValidYouTubeKey) {
            // Safe: hardcoded domain + validated key
            url = `https://www.youtube.com/embed/${video.key}?autoplay=1&rel=0&loop=0`;
        } else if (video.site === 'Vimeo' && isValidVimeoKey) {
            // Safe: hardcoded domain + validated key
            url = `https://player.vimeo.com/video/${video.key}?autoplay=1&loop=0`;
        }

        return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
    }

    protected getVideoThumbnail(video: Video): string | null {
        if (video.site === 'YouTube') {
            return `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;
        }
        return null;
    }

    protected selectVideo(videoKey: string) {
        this.selectedVideo.set(videoKey);
    }
}
