import { Component, Input, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Serie, getTmdbImageUrl, formatRating } from '../../models/serie.model';
import { createSlug } from '../../utils/url.utils';
import { SerieStatusChipComponent } from '../serie-status-chip/serie-status-chip.component';

@Component({
    selector: 'app-serie-card',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        TranslocoModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        SerieStatusChipComponent
    ],
    templateUrl: './serie-card.component.html',
    styleUrl: './serie-card.component.scss'
})
export class SerieCardComponent {
    @Input() serie!: Serie;

    private readonly translocoService = inject(TranslocoService);

    protected getTmdbImageUrl = getTmdbImageUrl;
    protected formatRating = formatRating;

    protected get serieRoute(): string[] {
        const slug = createSlug(this.serie.name || this.serie.original_name || '');
        return ['/serie', this.serie.id.toString(), slug];
    }
}