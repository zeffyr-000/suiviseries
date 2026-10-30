import { Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslocoModule } from '@jsverse/transloco';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Serie, SerieStatus, getTmdbImageUrl, getTmdbSrcset } from '../../models/serie.model';
import { createSlug } from '../../utils/url.utils';

@Component({
    selector: 'app-featured-serie',
    imports: [RouterModule, TranslocoModule, MatButtonModule, MatIconModule],
    templateUrl: './featured-serie.component.html',
    styleUrl: './featured-serie.component.scss',
})
export class FeaturedSerieComponent {
    readonly serie = input.required<Serie>();

    // 16:9 artwork, against the 2:3 posters everywhere else. The change of
    // aspect ratio is what breaks the page out of a single repeated rhythm.
    protected readonly backdropUrl = computed(() =>
        getTmdbImageUrl(this.serie().backdrop_path, 'w780'),
    );

    // The card spans most of a phone and nearly half a desktop, which a
    // single w780 only covers at 1x.
    protected readonly backdropSrcset = computed(() =>
        getTmdbSrcset(this.serie().backdrop_path, ['w780', 'w1280']),
    );

    protected readonly rating = computed(() => this.serie().vote_average.toFixed(1));

    protected readonly isAiring = computed(() => this.serie().status === SerieStatus.RETURNING);

    protected readonly serieRoute = computed(() => {
        const slug = createSlug(this.serie().name || this.serie().original_name || '');
        return ['/serie', this.serie().id.toString(), slug];
    });
}
