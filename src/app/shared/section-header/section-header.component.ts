import { Component, input } from '@angular/core';

import { TranslocoModule } from '@jsverse/transloco';

export type SectionAccent = 'gold' | 'flare' | 'ice';

@Component({
    selector: 'app-section-header',
    imports: [TranslocoModule],
    templateUrl: './section-header.component.html',
    styleUrl: './section-header.component.scss',
})
export class SectionHeaderComponent {
    // Translation keys rather than resolved strings, so the header re-renders
    // on language change like every other piece of copy.
    readonly titleKey = input.required<string>();
    readonly eyebrowKey = input<string>('');
    readonly leadKey = input<string>('');
    readonly accent = input<SectionAccent>('gold');
}
