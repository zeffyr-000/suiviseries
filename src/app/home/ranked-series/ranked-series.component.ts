import { Component, input } from '@angular/core';

import { Serie } from '../../models/serie.model';
import { SerieCardComponent } from '../../shared/serie-card/serie-card.component';

@Component({
    selector: 'app-ranked-series',
    imports: [SerieCardComponent],
    templateUrl: './ranked-series.component.html',
    styleUrl: './ranked-series.component.scss',
})
export class RankedSeriesComponent {
    readonly series = input.required<Serie[]>();

    // The numbering is not decoration: this list is ordered by rating, so the
    // position carries information the visitor would otherwise have to infer.
    protected rankLabel(index: number): string {
        return String(index + 1).padStart(2, '0');
    }
}
