import { Component } from '@angular/core';

import { TranslocoModule } from '@jsverse/transloco';

import { MatIconModule } from '@angular/material/icon';

interface ValueProp {
    icon: string;
    titleKey: string;
    descriptionKey: string;
    accent: 'gold' | 'flare' | 'ice' | 'violet';
}

@Component({
    selector: 'app-home-value-props',
    imports: [TranslocoModule, MatIconModule],
    templateUrl: './home-value-props.component.html',
    styleUrl: './home-value-props.component.scss',
})
export class HomeValuePropsComponent {
    // These four are the capabilities already claimed in the structured data in
    // index.html and in the seo.* copy, which until now were never shown on
    // screen. Nothing here promises more than the application actually does.
    protected readonly props: readonly ValueProp[] = [
        {
            icon: 'checklist',
            titleKey: 'value_props.tracking_title',
            descriptionKey: 'value_props.tracking_desc',
            accent: 'gold',
        },
        {
            icon: 'notifications_active',
            titleKey: 'value_props.alerts_title',
            descriptionKey: 'value_props.alerts_desc',
            accent: 'flare',
        },
        {
            icon: 'photo_library',
            titleKey: 'value_props.gallery_title',
            descriptionKey: 'value_props.gallery_desc',
            accent: 'ice',
        },
        {
            icon: 'offline_bolt',
            titleKey: 'value_props.offline_title',
            descriptionKey: 'value_props.offline_desc',
            accent: 'violet',
        },
    ];
}
