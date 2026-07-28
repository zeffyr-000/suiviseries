import { Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslocoModule } from '@jsverse/transloco';

import { Serie, getTmdbImageUrl } from '../../models/serie.model';
import { createSlug } from '../../utils/url.utils';
import { SerieStatusChipComponent } from '../serie-status-chip/serie-status-chip.component';
import { SpotlightDirective } from '../directives/spotlight.directive';

const RING_RADIUS = 20;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

@Component({
    selector: 'app-serie-card',
    imports: [RouterModule, TranslocoModule, SerieStatusChipComponent, SpotlightDirective],
    templateUrl: './serie-card.component.html',
    styleUrl: './serie-card.component.scss',
})
export class SerieCardComponent {
    readonly serie = input.required<Serie>();
    readonly priority = input<boolean>(false);

    protected readonly ringCircumference = RING_CIRCUMFERENCE;
    protected readonly ringRadius = RING_RADIUS;

    protected readonly posterUrl = computed(() =>
        getTmdbImageUrl(this.serie().poster_path, 'w500'),
    );

    // Consumed by the poster-bloom mixin, which blurs a copy of the artwork
    // behind the card so the poster casts its own colour onto the page.
    protected readonly posterCssUrl = computed(() => `url("${this.posterUrl()}")`);

    // Shown on the TMDB 0-10 scale, matching the detail page and the ring arc.
    protected readonly rating = computed(() => this.serie().vote_average.toFixed(1));

    protected readonly ringOffset = computed(() => {
        const ratio = Math.min(Math.max(this.serie().vote_average / 10, 0), 1);
        return RING_CIRCUMFERENCE * (1 - ratio);
    });

    // Paired with the same name on the detail hero so the poster morphs across
    // the navigation. Keyed by id, so a page must not list a serie twice.
    protected readonly transitionName = computed(() => `serie-poster-${this.serie().id}`);

    protected readonly overview = computed(() => {
        const text = this.serie().overview ?? '';
        return text.length > 100 ? `${text.substring(0, 100)}...` : text;
    });

    protected readonly serieRoute = computed(() => {
        const slug = createSlug(this.serie().name || this.serie().original_name || '');
        return ['/serie', this.serie().id.toString(), slug];
    });
}
