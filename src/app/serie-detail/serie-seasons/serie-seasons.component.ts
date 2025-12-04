import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Season } from '../../models/serie.model';

@Component({
    selector: 'app-serie-seasons',
    imports: [
        DatePipe,
        TranslocoModule,
        MatExpansionModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatDividerModule,
        MatTooltipModule
    ],
    templateUrl: './serie-seasons.component.html',
    styleUrl: './serie-seasons.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SerieSeasonsComponent {
    seasons = input.required<Season[]>();
    isAuthenticated = input.required<boolean>();
    watchedSeasons = input.required<number[]>();
    watchedEpisodes = input.required<number[]>();
    seasonLoadingStates = input.required<Map<number, boolean>>();
    episodeLoadingStates = input.required<Map<number, boolean>>();

    toggleSeasonWatched = output<number>();
    toggleEpisodeWatched = output<number>();

    protected isSeasonWatched(seasonId: number): boolean {
        return this.watchedSeasons().includes(seasonId);
    }

    protected isSeasonLoading(seasonId: number): boolean {
        return this.seasonLoadingStates().get(seasonId) || false;
    }

    protected isEpisodeWatched(episodeId: number): boolean {
        return this.watchedEpisodes().includes(episodeId);
    }

    protected isEpisodeLoading(episodeId: number): boolean {
        return this.episodeLoadingStates().get(episodeId) || false;
    }

    protected onToggleSeasonWatched(seasonId: number, event: Event): void {
        event.stopPropagation();
        this.toggleSeasonWatched.emit(seasonId);
    }

    protected onToggleEpisodeWatched(episodeId: number, event: Event): void {
        event.stopPropagation();
        this.toggleEpisodeWatched.emit(episodeId);
    }
}
