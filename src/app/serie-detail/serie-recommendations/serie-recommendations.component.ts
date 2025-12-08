import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { getSerieRouteParams } from '../../utils/url.utils';
import { formatRating, Recommendation } from '../../models/serie.model';

@Component({
    selector: 'app-serie-recommendations',
    imports: [
        RouterLink,
        TranslocoModule,
        MatCardModule,
        MatIconModule,
        DatePipe
    ],
    templateUrl: './serie-recommendations.component.html',
    styleUrl: './serie-recommendations.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SerieRecommendationsComponent {
    recommendations = input.required<Recommendation[]>();

    getSerieRoute(serie: Recommendation): [string, number, string] {
        return getSerieRouteParams(serie.id, serie.name);
    }

    protected formatRating = formatRating;
}
