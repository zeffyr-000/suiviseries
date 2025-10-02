import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { SeriesService } from '../services/series.service';
import { Serie } from '../models/serie.model';
import { SerieCardComponent } from '../shared/serie-card/serie-card.component';

@Component({
    selector: 'app-search',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        TranslocoModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatChipsModule,
        SerieCardComponent
    ],
    templateUrl: './search.component.html',
    styleUrl: './search.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit {
    private readonly seriesService = inject(SeriesService);
    private readonly router = inject(Router);

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
        this.setupSearchSubscription();
    } private setupSearchSubscription(): void {
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
            })
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
    } protected onSearch(): void {
        const query = this.searchControl.value?.trim();
        if (!query || query.length < 2) {
            return;
        }

        this.loading.set(true);
        this.error.set(null);
        this.hasSearched.set(true);
        this.lastQuery.set(query);

        this.seriesService.searchSeries(query).subscribe({
            next: (results) => {
                this.searchResults.set(results);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    } protected clearSearch(): void {
        this.searchControl.reset();
        this.clearResults();
    } private clearResults(): void {
        this.searchResults.set([]);
        this.loading.set(false);
        this.hasSearched.set(false);
        this.error.set(null);
        this.lastQuery.set('');
    }
}