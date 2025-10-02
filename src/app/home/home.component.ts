import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';

import { SeriesService } from '../services/series.service';
import { AuthService } from '../services/auth.service';
import { Serie } from '../models/serie.model';
import { LoginComponent } from '../login/login.component';
import { SerieCardComponent } from '../shared/serie-card/serie-card.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        TranslocoModule,
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatChipsModule,
        MatBadgeModule,
        SerieCardComponent
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
    protected popularSeries = signal<Serie[]>([]);
    protected loading = signal(true);

    private readonly seriesService = inject(SeriesService);
    private readonly translocoService = inject(TranslocoService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly dialog = inject(MatDialog);
    protected readonly authService = inject(AuthService);

    ngOnInit() {
        this.loadSeriesData();
        this.checkForAutoLogin();
    }

    private loadSeriesData() {
        this.loading.set(true);

        this.seriesService.getPopularSeries(12).pipe(
            catchError(() => {
                return of([]);
            })
        ).subscribe(series => {
            this.popularSeries.set(series);
            this.loading.set(false);
        });
    }

    private checkForAutoLogin() {
        this.route.queryParams.subscribe(params => {
            if (params['login'] === 'true' && !this.authService.isAuthenticated()) {
                const returnUrl = params['returnUrl'];
                this.goToLogin(returnUrl);
            }
        });
    }

    protected goToLogin(returnUrl?: string) {
        const dialogRef = this.dialog.open(LoginComponent, {
            width: '400px',
            disableClose: false,
            autoFocus: true,
            data: { returnUrl: returnUrl }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && returnUrl) {
                this.router.navigate([returnUrl]);
            }
        });
    }
}