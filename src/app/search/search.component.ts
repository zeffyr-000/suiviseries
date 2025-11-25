import { Component, OnInit, signal, computed, inject, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { SeriesService } from '../services/series.service';
import { MetadataService } from '../services/metadata.service';
import { Serie } from '../models/serie.model';
import { SerieCardComponent } from '../shared/serie-card/serie-card.component';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-search',
    imports: [
        ReactiveFormsModule,
        RouterModule,
        TranslocoModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        SerieCardComponent
    ],
    templateUrl: './search.component.html',
    styleUrl: './search.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit {
    private readonly seriesService = inject(SeriesService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly metadataService = inject(MetadataService);
    private readonly translocoService = inject(TranslocoService);

    protected readonly searchControl = new FormControl('', [
        Validators.minLength(2)
    ]);

    protected readonly searchResults = signal<Serie[]>([]);
    protected readonly loading = signal(false);
    protected readonly hasSearched = signal(false);
    protected readonly error = signal<string | null>(null);
    protected readonly lastQuery = signal<string>('');

    protected readonly hasResults = computed(() => this.searchResults().length > 0);
    protected readonly showNoResults = computed(() =>
        this.hasSearched() && !this.loading() && !this.hasResults() && !this.error()
    );

    ngOnInit() {
        this.updateMetadata();
        this.setupSearchSubscription();
    }

    private updateMetadata(): void {
        this.metadataService.updatePageMetadata({
            title: this.translocoService.translate('seo.search.title'),
            description: this.translocoService.translate('seo.search.description'),
            canonicalUrl: `${environment.siteUrl}/search`
        });
    }

    private setupSearchSubscription(): void {
        this.searchControl.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(query => {
                if (!query || query.trim().length < 2) {
                    this.clearResults();
                    return of([]);
                }

                this.loading.set(true);
                this.error.set(null);
                this.lastQuery.set(query.trim());
                return this.seriesService.searchSeries(query.trim());
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe({
            next: (results) => {
                this.searchResults.set(results);
                this.loading.set(false);
                this.hasSearched.set(true);
            },
            error: () => {
                this.loading.set(false);
                this.hasSearched.set(true);
            }
        });
    }

    protected onSearch(): void {
        const query = this.searchControl.value?.trim();
        if (!query || query.length < 2) {
            return;
        }

        this.searchControl.setValue('', { emitEvent: false });
        this.searchControl.setValue(query);
    }

    protected clearSearch(): void {
        this.searchControl.reset();
        this.clearResults();
    }

    private clearResults(): void {
        this.searchResults.set([]);
        this.loading.set(false);
        this.hasSearched.set(false);
        this.error.set(null);
        this.lastQuery.set('');
    }
}