import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SerieStatusChipComponent } from '../../shared/serie-status-chip/serie-status-chip.component';
import { StatRingComponent } from '../../shared/stat-ring/stat-ring.component';
import { ButtonLoadingDirective } from '../../shared/directives/button-loading.directive';
import { SerieStatus } from '../../models/serie.model';

// Only the fields the header actually renders. Artwork arrives through the
// backdropUrl and posterUrl inputs, already resolved to full URLs, so the raw
// paths have no reason to be here.
export interface SerieHeaderData {
    id: number;
    name: string;
    original_name: string;
    vote_average: number;
    vote_count: number;
    number_of_seasons: number;
    number_of_episodes: number;
    first_air_date: string;
    status: SerieStatus;
}

@Component({
    selector: 'app-serie-header',
    imports: [
        DatePipe,
        TranslocoModule,
        MatButtonModule,
        MatIconModule,
        SerieStatusChipComponent,
        StatRingComponent,
        ButtonLoadingDirective,
    ],
    templateUrl: './serie-header.component.html',
    styleUrl: './serie-header.component.scss',
})
export class SerieHeaderComponent {
    serie = input.required<SerieHeaderData>();
    backdropUrl = input.required<string>();
    posterUrl = input.required<string>();
    isAuthenticated = input.required<boolean>();
    isFollowing = input.required<boolean>();
    isWatched = input.required<boolean>();
    followLoading = input.required<boolean>();
    watchedLoading = input.required<boolean>();
    watchedEpisodeCount = input<number>(0);

    goBack = output<void>();
    toggleFollow = output<void>();
    toggleWatched = output<void>();

    // Matches the name the card sets on its poster, so the artwork morphs
    // across the navigation instead of cross-fading with the rest of the page.
    protected readonly transitionName = computed(() => `serie-poster-${this.serie().id}`);

    // Shown on the TMDB 0-10 scale. The header used to print a 0-5 badge next
    // to a 0-10 line for the same number.
    protected readonly rating = computed(() => this.serie().vote_average.toFixed(1));

    protected readonly ratingRatio = computed(() => this.serie().vote_average / 10);

    protected readonly totalEpisodes = computed(() => this.serie().number_of_episodes);

    protected readonly progressRatio = computed(() => {
        const total = this.totalEpisodes();
        return total > 0 ? this.watchedEpisodeCount() / total : 0;
    });

    protected readonly progressPercent = computed(() => Math.round(this.progressRatio() * 100));

    protected onGoBack(): void {
        this.goBack.emit();
    }

    protected onToggleFollow(): void {
        this.toggleFollow.emit();
    }

    protected onToggleWatched(): void {
        this.toggleWatched.emit();
    }
}
