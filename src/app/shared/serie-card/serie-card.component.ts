import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslocoModule } from '@jsverse/transloco';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Serie, getTmdbImageUrl, formatRating } from '../../models/serie.model';
import { createSlug } from '../../utils/url.utils';
import { SerieStatusChipComponent } from '../serie-status-chip/serie-status-chip.component';

@Component({
    selector: 'app-serie-card',
    imports: [
        RouterModule,
        TranslocoModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        SerieStatusChipComponent
    ],
    templateUrl: './serie-card.component.html',
    styleUrl: './serie-card.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SerieCardComponent {
    readonly serie = input.required<Serie>();
    readonly priority = input<boolean>(false);

    protected getTmdbImageUrl = getTmdbImageUrl;
    protected formatRating = formatRating;

    protected readonly serieRoute = computed(() => {
        const slug = createSlug(this.serie().name || this.serie().original_name || '');
        return ['/serie', this.serie().id.toString(), slug];
    });
}