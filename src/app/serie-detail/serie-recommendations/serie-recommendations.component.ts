import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { getSerieRouteParams } from '../../utils/url.utils';
import { Recommendation } from '../../models/serie.model';

@Component({
    selector: 'app-serie-recommendations',
    imports: [RouterLink, TranslocoModule, MatCardModule, MatIconModule, DatePipe],
    templateUrl: './serie-recommendations.component.html',
    styleUrl: './serie-recommendations.component.scss',
})
export class SerieRecommendationsComponent {
    recommendations = input.required<Recommendation[]>();

    getSerieRoute(serie: Recommendation): [string, number, string] {
        return getSerieRouteParams(serie.id, serie.name);
    }

    // Same TMDB 0-10 scale as the header and the cards on this page. The badge
    // used to halve it onto a five-star scale, so a serie rated 8.0 in the
    // header was recommended as 4.0 a few cards below.
    protected rating(serie: Recommendation): string {
        return serie.vote_average.toFixed(1);
    }
}
