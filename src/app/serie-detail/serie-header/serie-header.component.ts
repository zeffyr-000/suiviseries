import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SerieStatusChipComponent } from '../../shared/serie-status-chip/serie-status-chip.component';
import { ButtonLoadingDirective } from '../../shared/directives/button-loading.directive';
import { SerieStatus } from '../../models/serie.model';

export interface SerieHeaderData {
    name: string;
    original_name: string;
    backdrop_path: string;
    poster_path: string;
    vote_average: number;
    vote_count: number;
    number_of_seasons: number;
    number_of_episodes: number;
    first_air_date: string;
    status: SerieStatus;
    overview: string;
}

@Component({
    selector: 'app-serie-header',
    imports: [
        DatePipe,
        TranslocoModule,
        MatButtonModule,
        MatIconModule,
        SerieStatusChipComponent,
        ButtonLoadingDirective
    ],
    templateUrl: './serie-header.component.html',
    styleUrl: './serie-header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
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
    formatRating = input.required<(rating: number) => string>();

    goBack = output<void>();
    toggleFollow = output<void>();
    toggleWatched = output<void>();

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
