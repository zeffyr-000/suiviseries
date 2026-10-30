import { Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslocoModule } from '@jsverse/transloco';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Serie, getTmdbImageUrl, getTmdbSrcset } from '../../models/serie.model';
import { createSlug } from '../../utils/url.utils';

@Component({
    selector: 'app-home-hero',
    imports: [RouterModule, TranslocoModule, MatButtonModule, MatIconModule],
    templateUrl: './home-hero.component.html',
    styleUrl: './home-hero.component.scss',
})
export class HomeHeroComponent {
    // The serie whose artwork fills the hero. Null until both lists resolve;
    // the gradient stands in for it so the hero never collapses while loading.
    // Naming it in the credit turns the artwork from decoration into a real
    // entry point, and tells the visitor what they are looking at.
    readonly spotlight = input<Serie | null>(null);

    // The fallback src for browsers that ignore srcset.
    protected readonly backdropSrc = computed(() =>
        getTmdbImageUrl(this.spotlight()?.backdrop_path, 'w1280'),
    );

    // The artwork runs edge to edge, so a single w780 was stretched to twice
    // its width on a desktop and four times on a high-density screen.
    protected readonly backdropSrcset = computed(() =>
        getTmdbSrcset(this.spotlight()?.backdrop_path, ['w780', 'w1280', 'original']),
    );

    protected readonly spotlightRoute = computed(() => {
        const serie = this.spotlight();
        if (!serie) {
            return null;
        }

        const slug = createSlug(serie.name || serie.original_name || '');
        return ['/serie', serie.id.toString(), slug];
    });
}
