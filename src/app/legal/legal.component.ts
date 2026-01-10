import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { MetadataService } from '../services/metadata.service';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-legal',
    imports: [
        TranslocoModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule
    ],
    templateUrl: './legal.component.html',
    styleUrl: './legal.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegalComponent {
    private readonly metadataService = inject(MetadataService);
    private readonly translocoService = inject(TranslocoService);

    readonly authorName = 'Christophe Saint-Julien';
    readonly authorGithub = 'https://github.com/zeffyr-000/';
    readonly projectRepo = 'https://github.com/zeffyr-000/suiviseries';

    constructor() {
        this.metadataService.updatePageMetadata({
            title: this.translocoService.translate('seo.legal.title'),
            description: this.translocoService.translate('seo.legal.description'),
            canonicalUrl: `${environment.siteUrl}/legal`,
            includeOpenGraph: true,
            includeTwitter: true
        });
    }
}