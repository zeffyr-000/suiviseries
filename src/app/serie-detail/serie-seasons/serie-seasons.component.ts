import { Component, input, output } from '@angular/core';
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
        MatTooltipModule,
    ],
    templateUrl: './serie-seasons.component.html',
    styleUrl: './serie-seasons.component.scss',
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

    // Counted from the episodes themselves rather than from the season flag, so
    // a partially watched season still shows how far along it is.
    protected seasonWatchedCount(season: Season): number {
        const watched = this.watchedEpisodes();
        return (season.episodes ?? []).filter((episode) => watched.includes(episode.id)).length;
    }

    protected seasonEpisodeCount(season: Season): number {
        return season.episodes?.length || season.episode_count || 0;
    }

    protected seasonProgress(season: Season): number {
        const total = this.seasonEpisodeCount(season);
        return total > 0 ? Math.round((this.seasonWatchedCount(season) / total) * 100) : 0;
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
