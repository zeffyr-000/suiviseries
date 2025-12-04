import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';

import { SerieHeaderComponent, SerieHeaderData } from './serie-header.component';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';
import { SerieStatus } from '../../models/serie.model';

describe('SerieHeaderComponent', () => {
    let fixture: ComponentFixture<SerieHeaderComponent>;
    let component: SerieHeaderComponent;
    let componentRef: ComponentRef<SerieHeaderComponent>;

    const mockSerieData: SerieHeaderData = {
        name: 'Breaking Bad',
        original_name: 'Breaking Bad',
        backdrop_path: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
        poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
        vote_average: 9.3,
        vote_count: 12000,
        number_of_seasons: 5,
        number_of_episodes: 62,
        first_air_date: '2008-01-20',
        status: SerieStatus.ENDED,
        overview: 'A high school chemistry teacher turned methamphetamine producer.'
    };

    const mockFormatRating = (rating: number): string => {
        return rating.toFixed(1);
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                SerieHeaderComponent,
                getTranslocoTestingModule()
            ]
        });

        fixture = TestBed.createComponent(SerieHeaderComponent);
        component = fixture.componentInstance;
        componentRef = fixture.componentRef;

        // Set required inputs
        componentRef.setInput('serie', mockSerieData);
        componentRef.setInput('backdropUrl', 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg');
        componentRef.setInput('posterUrl', 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg');
        componentRef.setInput('isAuthenticated', false);
        componentRef.setInput('isFollowing', false);
        componentRef.setInput('isWatched', false);
        componentRef.setInput('followLoading', false);
        componentRef.setInput('watchedLoading', false);
        componentRef.setInput('formatRating', mockFormatRating);

        fixture.detectChanges();
    });

    describe('Component Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should have required inputs', () => {
            expect(component.serie()).toEqual(mockSerieData);
            expect(component.backdropUrl()).toContain('image.tmdb.org');
            expect(component.posterUrl()).toContain('image.tmdb.org');
            expect(component.isAuthenticated()).toBe(false);
            expect(component.isFollowing()).toBe(false);
            expect(component.isWatched()).toBe(false);
            expect(component.followLoading()).toBe(false);
            expect(component.watchedLoading()).toBe(false);
            expect(component.formatRating()).toBeDefined();
        });
    });

    describe('Template Rendering', () => {
        it('should render serie title', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const title = compiled.querySelector('.serie-title');
            expect(title?.textContent?.trim()).toBe('Breaking Bad');
        });

        it('should render poster image', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const poster = compiled.querySelector('.serie-poster') as HTMLImageElement;
            expect(poster).toBeTruthy();
            expect(poster.src).toContain('image.tmdb.org');
        });

        it('should render backdrop with overlay', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const backdrop = compiled.querySelector('.hero-backdrop') as HTMLElement;
            expect(backdrop).toBeTruthy();
            expect(backdrop.style.backgroundImage || backdrop.getAttribute('style')).toBeTruthy();
        });

        it('should render back button', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const backButton = compiled.querySelector('.back-button');
            expect(backButton).toBeTruthy();
        });

        it('should render vote average with formatRating', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const rating = compiled.querySelector('.rating-badge');
            expect(rating?.textContent).toContain('9.3');
        });
    });

    describe('Output Events', () => {
        it('should emit goBack when back button is clicked', () => {
            const goBackSpy = vi.fn();
            component.goBack.subscribe(goBackSpy);

            component['onGoBack']();

            expect(goBackSpy).toHaveBeenCalledOnce();
        });

        it('should emit toggleFollow when follow button is clicked', () => {
            const toggleFollowSpy = vi.fn();
            component.toggleFollow.subscribe(toggleFollowSpy);

            component['onToggleFollow']();

            expect(toggleFollowSpy).toHaveBeenCalledOnce();
        });

        it('should emit toggleWatched when watched button is clicked', () => {
            const toggleWatchedSpy = vi.fn();
            component.toggleWatched.subscribe(toggleWatchedSpy);

            component['onToggleWatched']();

            expect(toggleWatchedSpy).toHaveBeenCalledOnce();
        });
    });

    describe('Authentication State', () => {
        it('should show action buttons when authenticated', () => {
            componentRef.setInput('isAuthenticated', true);
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            const actionButtons = compiled.querySelector('.action-buttons');
            expect(actionButtons).toBeTruthy();
        });

        it('should update follow button state', () => {
            componentRef.setInput('isAuthenticated', true);
            componentRef.setInput('isFollowing', true);
            fixture.detectChanges();

            expect(component.isFollowing()).toBe(true);
        });

        it('should update watched button state', () => {
            componentRef.setInput('isAuthenticated', true);
            componentRef.setInput('isWatched', true);
            fixture.detectChanges();

            expect(component.isWatched()).toBe(true);
        });
    });

    describe('Loading States', () => {
        it('should reflect follow loading state', () => {
            componentRef.setInput('followLoading', true);
            fixture.detectChanges();

            expect(component.followLoading()).toBe(true);
        });

        it('should reflect watched loading state', () => {
            componentRef.setInput('watchedLoading', true);
            fixture.detectChanges();

            expect(component.watchedLoading()).toBe(true);
        });
    });

    describe('Serie Status', () => {
        it('should display serie status chip', () => {
            const compiled = fixture.nativeElement as HTMLElement;
            const statusChip = compiled.querySelector('app-serie-status-chip');
            expect(statusChip).toBeTruthy();
        });

        it('should handle different status values', () => {
            const endedSerie = { ...mockSerieData, status: SerieStatus.ENDED };
            componentRef.setInput('serie', endedSerie);
            fixture.detectChanges();

            expect(component.serie().status).toBe(SerieStatus.ENDED);
        });
    });
});
