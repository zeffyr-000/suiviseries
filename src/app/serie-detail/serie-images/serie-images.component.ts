import { Component, input, signal, ChangeDetectionStrategy, viewChild, ElementRef, effect, computed } from '@angular/core';
import { DecimalPipe, UpperCasePipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { SerieImage, SerieImages } from '../../models/serie.model';

@Component({
    selector: 'app-serie-images',
    imports: [
        DecimalPipe,
        UpperCasePipe,
        TranslocoModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTabsModule
    ],
    templateUrl: './serie-images.component.html',
    styleUrl: './serie-images.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SerieImagesComponent {
    images = input.required<SerieImages>();

    protected selectedTab = signal<number>(0);
    protected selectedImage = signal<SerieImage | null>(null);
    protected selectedImageType = signal<'backdrop' | 'poster' | 'logo' | null>(null);
    protected isFullscreen = signal<boolean>(false);
    protected showAllView = signal<boolean>(false);

    protected dialogOverlay = viewChild<ElementRef<HTMLDialogElement>>('dialogOverlay');
    protected imageContainer = viewChild<ElementRef<HTMLDivElement>>('imageContainer');
    protected allImagesDialog = viewChild<ElementRef<HTMLDialogElement>>('allImagesDialog');

    constructor() {
        effect(() => {
            const overlay = this.dialogOverlay();
            const allDialog = this.allImagesDialog();

            if (overlay) {
                if (this.selectedImage()) {
                    if (!overlay.nativeElement.open) {
                        overlay.nativeElement.showModal();
                    }
                } else if (overlay.nativeElement.open) {
                    overlay.nativeElement.close();
                }
            }

            if (allDialog) {
                if (this.showAllView()) {
                    if (!allDialog.nativeElement.open) {
                        allDialog.nativeElement.showModal();
                    }
                } else if (allDialog.nativeElement.open) {
                    allDialog.nativeElement.close();
                }
            }
        });
    }

    protected backdrops = computed<SerieImage[]>(() => this.images()?.backdrops || []);

    protected posters = computed<SerieImage[]>(() => this.images()?.posters || []);

    protected logos = computed<SerieImage[]>(() => this.images()?.logos || []);

    protected hasBackdrops = computed<boolean>(() => this.backdrops().length > 0);

    protected hasPosters = computed<boolean>(() => this.posters().length > 0);

    protected hasLogos = computed<boolean>(() => this.logos().length > 0);

    protected currentImages = computed<SerieImage[]>(() => {
        const imageType = this.selectedImageType();

        // Return images of the selected type when an image is being previewed
        if (imageType === 'backdrop') return this.backdrops();
        if (imageType === 'poster') return this.posters();
        if (imageType === 'logo') return this.logos();

        // When no image is selected, use the active tab to determine which collection to show
        const tab = this.selectedTab();
        const tabImages = [this.backdrops(), this.posters(), this.logos()][tab];
        if (tabImages && tabImages.length > 0) return tabImages;

        // Fallback to first available collection
        if (this.backdrops().length > 0) return this.backdrops();
        if (this.posters().length > 0) return this.posters();
        if (this.logos().length > 0) return this.logos();
        return [];
    });

    protected totalImages = computed<number>(() => this.currentImages().length);

    protected currentImageIndex = computed<number>(() => {
        const current = this.selectedImage();
        if (!current) return 0;
        return this.currentImages().findIndex(img => img.file_path === current.file_path) + 1;
    });

    protected hasPrevious = computed<boolean>(() => this.currentImageIndex() > 1);

    protected hasNext = computed<boolean>(() => this.currentImageIndex() < this.totalImages());

    protected currentTabType = computed<'backdrop' | 'poster' | 'logo'>(() => {
        const tab = this.selectedTab();
        return ['backdrop', 'poster', 'logo'][tab] as 'backdrop' | 'poster' | 'logo';
    });

    protected onImageClick(image: SerieImage, type: 'backdrop' | 'poster' | 'logo'): void {
        this.selectedImage.set(image);
        this.selectedImageType.set(type);
    }

    protected closePreview(): void {
        const overlay = this.dialogOverlay();

        if (document.fullscreenElement) {
            document.exitFullscreen()
                .then(() => this.isFullscreen.set(false))
                .catch((err) => {
                    console.error('Exit fullscreen failed:', err);
                    this.isFullscreen.set(false);
                });
        } else {
            this.isFullscreen.set(false);
        }

        if (overlay?.nativeElement.open) {
            overlay.nativeElement.close();
        }
        this.selectedImage.set(null);
        this.selectedImageType.set(null);
    }

    protected previousImage(event: Event): void {
        event.stopPropagation();
        this.navigateToPrevious();
    }

    protected nextImage(event: Event): void {
        event.stopPropagation();
        this.navigateToNext();
    }

    private navigateToPrevious(): void {
        if (!this.hasPrevious()) return;

        const currentIdx = this.currentImageIndex() - 1;
        const newIndex = currentIdx - 1;
        const images = this.currentImages();

        if (newIndex >= 0 && newIndex < images.length) {
            this.selectedImage.set(images[newIndex]);
        }
    }

    private navigateToNext(): void {
        if (!this.hasNext()) return;

        const currentIdx = this.currentImageIndex() - 1;
        const newIndex = currentIdx + 1;
        const images = this.currentImages();

        if (newIndex >= 0 && newIndex < images.length) {
            this.selectedImage.set(images[newIndex]);
        }
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            this.navigateToPrevious();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            this.navigateToNext();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            if (this.selectedImage()) {
                this.closePreview();
            } else if (this.showAllView()) {
                this.closeAllView();
            }
        }
    }

    protected onTabChange(index: number): void {
        this.selectedTab.set(index);
    }

    protected showAllImages(): void {
        this.showAllView.set(true);
    }

    protected closeAllView(): void {
        const allDialog = this.allImagesDialog();
        if (allDialog?.nativeElement.open) {
            allDialog.nativeElement.close();
        }
        this.showAllView.set(false);
    }

    protected toggleFullscreen(): void {
        const container = this.imageContainer();
        if (!container) return;

        if (document.fullscreenElement) {
            document.exitFullscreen().then(() => {
                this.isFullscreen.set(false);
            }).catch((err) => {
                console.error('Exit fullscreen failed:', err);
                this.isFullscreen.set(false);
            });
        } else {
            container.nativeElement.requestFullscreen().then(() => {
                this.isFullscreen.set(true);
            }).catch((err) => {
                console.error('Fullscreen request failed:', err);
                this.isFullscreen.set(false);
            });
        }
    }

    protected async downloadImage(): Promise<void> {
        const image = this.selectedImage();
        if (!image) return;

        try {
            const response = await fetch(image.file_path);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Extract file extension from path or content-type
            let extension = '.jpg';
            const pathMatch = image.file_path.match(/\.([a-z0-9]+)(?:\?|$)/i);
            if (pathMatch) {
                extension = `.${pathMatch[1]}`;
            } else {
                const contentType = response.headers.get('Content-Type');
                if (contentType?.includes('png')) {
                    extension = '.png';
                } else if (contentType?.includes('webp')) {
                    extension = '.webp';
                }
            }

            // Generate descriptive filename with dimensions
            const filename = `image-${image.width}x${image.height}${extension}`;

            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
        }
    }

    protected getImageTypeLabel(): string {
        const type = this.selectedImageType();
        if (!type) return '';
        return `serie_detail.image_type_${type}`;
    }
}
