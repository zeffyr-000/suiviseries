import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'search',
        loadComponent: () => import('./search/search.component').then(m => m.SearchComponent)
    },
    {
        path: 'mes-series',
        loadComponent: () => import('./my-series/my-series.component').then(m => m.MySeriesComponent),
        canActivate: [authGuard]
    },
    {
        path: 'serie/:id/:nom',
        loadComponent: () => import('./serie-detail/serie-detail.component').then(m => m.SerieDetailComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
