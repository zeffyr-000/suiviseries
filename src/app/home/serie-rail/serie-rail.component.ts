import { Component, input } from '@angular/core';

import { TranslocoModule } from '@jsverse/transloco';

import { Serie } from '../../models/serie.model';
import { SerieCardComponent } from '../../shared/serie-card/serie-card.component';

@Component({
    selector: 'app-serie-rail',
    imports: [TranslocoModule, SerieCardComponent],
    templateUrl: './serie-rail.component.html',
    styleUrl: './serie-rail.component.scss',
})
export class SerieRailComponent {
    readonly series = input.required<Serie[]>();
    readonly labelKey = input<string>('sections.rail_label');

    // How many leading posters to load eagerly. Defaults to none because a rail
    // is not necessarily above the fold; the page placing it decides, rather
    // than the rail assuming where it sits.
    readonly eagerCount = input<number>(0);
}
