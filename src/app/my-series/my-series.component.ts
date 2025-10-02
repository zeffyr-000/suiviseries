import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { SeriesService } from '../services/series.service';
import { AuthService } from '../services/auth.service';
import { Serie } from '../models/serie.model';
import { SerieCardComponent } from '../shared/serie-card/serie-card.component';

@Component({
    selector: 'app-my-series',
    standalone: true,
    imports: [
        CommonModule,
        TranslocoModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        SerieCardComponent
    ],
    templateUrl: './my-series.component.html',
    styleUrl: './my-series.component.scss'
})
export class MySeriesComponent implements OnInit {
    private readonly seriesService = inject(SeriesService);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    protected mySeries = signal<Serie[]>([]);
    protected loading = signal<boolean>(true);
    protected error = signal<string | null>(null);

    ngOnInit(): void {
        this.loadMySeries();
    }

    private loadMySeries(): void {
        this.loading.set(true);
        this.error.set(null);

        this.seriesService.getUserSeries().subscribe({
            next: (series: Serie[]) => {
                this.mySeries.set(series);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
            }
        });
    }

    protected onRefresh(): void {
        this.loadMySeries();
    }

    protected goToSearch(): void {
        this.router.navigate(['/search']);
    }
}