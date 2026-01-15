import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { form, FormField, minLength } from '@angular/forms/signals';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { SeriesService } from '../services/series.service';
import { MetadataService } from '../services/metadata.service';
import { SerieCardComponent } from '../shared/serie-card/serie-card.component';
import { ButtonLoadingDirective } from '../shared/directives/button-loading.directive';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-search',
    imports: [
        FormField,
        RouterModule,
        TranslocoModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        SerieCardComponent,
        ButtonLoadingDirective
    ],
    templateUrl: './search.component.html',
    styleUrl: './search.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent {
    private readonly seriesService = inject(SeriesService);
    private readonly metadataService = inject(MetadataService);
    private readonly translocoService = inject(TranslocoService);

    protected readonly searchModel = signal({ query: '' });
    protected readonly searchForm = form(this.searchModel, (schemaPath) => {
        minLength(schemaPath.query, 2);
    });

    private readonly searchResource = this.seriesService.createSearchResource();
    private readonly query$ = toObservable(this.searchForm.query().value);

    protected readonly searchResults = computed(() => this.searchResource.results());
    protected readonly loading = computed(() => this.searchResource.isLoading());
    protected readonly error = computed(() => {
        const err = this.searchResource.error();
        return err ? String(err) : null;
    });
    protected readonly hasSearched = computed(
        () => this.searchResource.hasValue() || this.searchResource.error() !== undefined
    );
    protected readonly lastQuery = computed(() => {
        const query = this.searchResource.query().trim();
        return query.length >= 2 ? query : '';
    });
    protected readonly hasResults = computed(() => this.searchResults().length > 0);
    protected readonly showNoResults = computed(
        () => this.hasSearched() && !this.loading() && !this.hasResults() && !this.error()
    );

    constructor() {
        this.metadataService.updatePageMetadata({
            title: this.translocoService.translate('seo.search.title'),
            description: this.translocoService.translate('seo.search.description'),
            canonicalUrl: `${environment.siteUrl}/search`
        });

        this.query$
            .pipe(skip(1), debounceTime(400), distinctUntilChanged())
            .subscribe((query) => this.searchResource.query.set(query));
    }

    protected onSearch(): void {
        const query = this.searchForm.query().value().trim();
        if (!query || query.length < 2) {
            return;
        }
        this.searchResource.query.set(query);
    }

    protected clearSearch(): void {
        this.searchForm.query().value.set('');
        this.searchResource.query.set('');
    }
}