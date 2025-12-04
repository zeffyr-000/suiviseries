import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface WatchProvider {
    provider_id: number;
    provider_name: string;
    logo_path: string | null;
    type: 'flatrate' | 'buy' | 'rent';
}

@Component({
    selector: 'app-serie-watch-providers',
    imports: [
        TranslocoModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './serie-watch-providers.component.html',
    styleUrl: './serie-watch-providers.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SerieWatchProvidersComponent {
    providers = input.required<WatchProvider[]>();
}
