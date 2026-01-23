import { Component, input, signal, ChangeDetectionStrategy, viewChild, ElementRef, effect, computed, DestroyRef, inject } from '@angular/core';
import { DecimalPipe, UpperCasePipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SerieImage, SerieImages } from '../../models/serie.model';

interface SwipeState {
    startX: number;
    startY: number;
    startTime: number;
    pointerId: number;
}

@Component({
    selector: 'app-serie-images',
    imports: [
        DecimalPipe,
        UpperCasePipe,
        TranslocoModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTabsModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './serie-images.component.html',
    styleUrl: './serie-images.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:visibilitychange)': 'onVisibilityChange()'
    }
})
export class SerieImagesComponent {
    private readonly destroyRef = inject(DestroyRef);

    images = input.required<SerieImages>();

    protected selectedTab = signal<number>(0);
    protected selectedImage = signal<SerieImage | null>(null);
    protected selectedImageType = signal<'backdrop' | 'poster' | 'logo' | null>(null);
    protected isFullscreen = signal<boolean>(false);
    protected showAllView = signal<boolean>(false);
    protected imageLoading = signal<boolean>(false);
    protected showSwipeHint = signal<boolean>(false);

    // Swipe configuration
    private readonly SWIPE_THRESHOLD = 50; // minimum distance in pixels
    private readonly SWIPE_MAX_VERTICAL = 100; // max vertical movement to still count as horizontal swipe
    private readonly SWIPE_MAX_TIME = 500; // max time in ms for a swipe gesture
    private swipeState: SwipeState | null = null;
    private swipeHintTimeoutId: ReturnType<typeof setTimeout> | null = null;

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
        this.imageLoading.set(true);
        this.selectedImage.set(image);
        this.selectedImageType.set(type);
        this.showSwipeHintOnMobile();
    }

    private showSwipeHintOnMobile(): void {
        // Show swipe hint only on touch devices and only once per session
        const hasSeenHint = sessionStorage.getItem('swipeHintSeen');
        if (!hasSeenHint && 'ontouchstart' in globalThis) {
            this.showSwipeHint.set(true);
            sessionStorage.setItem('swipeHintSeen', 'true');

            this.swipeHintTimeoutId = setTimeout(() => this.showSwipeHint.set(false), 2500);

            // Clean up timeout if component is destroyed
            this.destroyRef.onDestroy(() => {
                if (this.swipeHintTimeoutId) {
                    clearTimeout(this.swipeHintTimeoutId);
                }
            });
        }
    }

    protected onImageLoad(): void {
        this.imageLoading.set(false);
    }

    protected closePreview(event?: MouseEvent): void {
        // Only close if clicking on the backdrop (dialog element itself), not its content
        if (event && event.target !== event.currentTarget) {
            return;
        }

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
            this.imageLoading.set(true);
            this.selectedImage.set(images[newIndex]);
        }
    }

    private navigateToNext(): void {
        if (!this.hasNext()) return;

        const currentIdx = this.currentImageIndex() - 1;
        const newIndex = currentIdx + 1;
        const images = this.currentImages();

        if (newIndex >= 0 && newIndex < images.length) {
            this.imageLoading.set(true);
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

    // Swipe gesture handlers
    protected onPointerDown(event: PointerEvent): void {
        // Only track touch and pen for swipe (not mouse - mouse users have buttons)
        if (event.pointerType === 'mouse') return;

        // Ignore swipes that start on interactive elements
        const target = event.target as HTMLElement | null;
        if (target?.closest('button, [role="button"], a, input, textarea, select')) return;

        this.swipeState = {
            startX: event.clientX,
            startY: event.clientY,
            startTime: Date.now(),
            pointerId: event.pointerId
        };
    }

    protected onPointerUp(event: PointerEvent): void {
        if (!this.swipeState || event.pointerId !== this.swipeState.pointerId) return;

        const deltaX = event.clientX - this.swipeState.startX;
        const deltaY = Math.abs(event.clientY - this.swipeState.startY);
        const deltaTime = Date.now() - this.swipeState.startTime;

        // Check if it's a valid horizontal swipe
        const isHorizontalSwipe = Math.abs(deltaX) > this.SWIPE_THRESHOLD &&
            deltaY < this.SWIPE_MAX_VERTICAL &&
            deltaTime < this.SWIPE_MAX_TIME;

        if (isHorizontalSwipe) {
            event.preventDefault();
            event.stopPropagation();

            if (deltaX > 0) {
                this.navigateToPrevious(); // Swipe right = previous image
            } else {
                this.navigateToNext(); // Swipe left = next image
            }
        }

        this.swipeState = null;
    }

    protected onPointerCancel(): void {
        this.swipeState = null;
    }

    protected onVisibilityChange(): void {
        // Reset swipe state if user switches tabs
        this.swipeState = null;
    }

    protected onTabChange(index: number): void {
        this.selectedTab.set(index);
    }

    protected showAllImages(): void {
        this.showAllView.set(true);
    }

    protected closeAllView(event?: MouseEvent): void {
        // Only close if clicking on the backdrop (dialog element itself), not its content
        if (event && event.target !== event.currentTarget) {
            return;
        }

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

        // Extract filename from path
        const pathSegments = image.file_path.split('/');
        const originalFilename = pathSegments[pathSegments.length - 1]?.split('?')[0] || 'image.jpg';

        try {
            // Try fetch + blob for cross-origin download
            const response = await fetch(image.file_path);
            if (!response.ok) throw new Error('Fetch failed');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = originalFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        } catch {
            // Fallback: open in new tab if CORS blocks fetch
            window.open(image.file_path, '_blank', 'noopener,noreferrer');
        }
    }

    protected getImageTypeLabel(): string {
        const type = this.selectedImageType();
        if (!type) return '';
        return `serie_detail.image_type_${type}`;
    }
}
