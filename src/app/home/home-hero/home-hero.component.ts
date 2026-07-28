import { Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslocoModule } from '@jsverse/transloco';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Serie } from '../../models/serie.model';
import { createSlug } from '../../utils/url.utils';

@Component({
    selector: 'app-home-hero',
    imports: [RouterModule, TranslocoModule, MatButtonModule, MatIconModule],
    templateUrl: './home-hero.component.html',
    styleUrl: './home-hero.component.scss',
})
export class HomeHeroComponent {
    // Null until the popular list resolves; the gradient below stands in for it
    // so the hero never collapses while loading.
    readonly backdrop = input<string | null>(null);

    // The serie the backdrop belongs to. Naming it turns the artwork from
    // decoration into a real entry point, and tells the visitor what they are
    // looking at.
    readonly featured = input<Serie | null>(null);

    protected readonly featuredRoute = computed(() => {
        const serie = this.featured();
        if (!serie) {
            return null;
        }

        const slug = createSlug(serie.name || serie.original_name || '');
        return ['/serie', serie.id.toString(), slug];
    });
}
