import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Serie, SearchResponse, SerieDetailResponse, UserSeriesResponse } from '../models/serie.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SeriesService {

    private readonly apiUrl = environment.apiUrl;
    private readonly http = inject(HttpClient);

    getAllSeries(): Observable<Serie[]> {
        return this.http.get<SearchResponse>(`${this.apiUrl}/series`).pipe(
            map(response => response.success && response.results ? response.results : []),
            catchError(() => {
                return of([]);
            })
        );
    }

    getPopularSeries(limit = 6): Observable<Serie[]> {
        return this.http.get<SearchResponse>(`${this.apiUrl}/series/popular?limit=${limit}`).pipe(
            map(response => response.success && response.results ? response.results : []),
            catchError(() => {
                return of([]);
            })
        );
    }

    getSerieById(id: number): Observable<Serie | undefined> {
        return this.http.get<SerieDetailResponse>(`${this.apiUrl}/series/${id}`).pipe(
            map(response => response.success && response.serie ? response.serie : undefined),
            catchError(() => {
                return of(undefined);
            })
        );
    }

    getSerieDetails(id: number): Observable<SerieDetailResponse | null> {
        return this.http.get<SerieDetailResponse>(`${this.apiUrl}/series/${id}`).pipe(
            catchError(() => {
                return of(null);
            })
        );
    }

    searchSeries(query: string): Observable<Serie[]> {
        if (!query.trim()) return of([]);
        return this.http.get<SearchResponse>(`${this.apiUrl}/series/search?q=${encodeURIComponent(query)}`).pipe(
            map(response => response.success && response.results ? response.results : []),
            catchError(() => {
                return of([]);
            })
        );
    }

    getUserSeries(): Observable<Serie[]> {
        return this.http.get<UserSeriesResponse>(`${this.apiUrl}/users/me/series`).pipe(
            map(response => response.success && response.results ? response.results.map(item => item.serie) : []),
            catchError(() => {
                return of([]);
            })
        );
    }

    isSerieReallyFollowed(serieId: number): Observable<boolean> {
        return this.getUserSeries().pipe(
            map(series => series.some(serie => serie.id === serieId))
        );
    }

    followSerie(serieId: number): Observable<boolean> {
        return this.http.post<{ success: boolean, error?: string }>(`${this.apiUrl}/users/me/series/${serieId}/follow`, {}).pipe(
            map(response => {
                if (!response.success && response.error) {
                    throw new Error(response.error);
                }
                return response.success;
            }),
            catchError((error) => {
                throw error;
            })
        );
    }

    unfollowSerie(serieId: number): Observable<boolean> {
        return this.http.post<{ success: boolean, error?: string }>(`${this.apiUrl}/users/me/series/${serieId}/unfollow`, {}).pipe(
            map(response => {
                if (!response.success && response.error) {
                    throw new Error(response.error);
                }
                return response.success;
            }),
            catchError((error) => {
                throw error;
            })
        );
    }

    markSerieAsWatched(serieId: number): Observable<boolean> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/users/me/series/${serieId}/watched`, {}).pipe(
            map(response => response.success),
            catchError(() => {
                return of(false);
            })
        );
    }

    unmarkSerieAsWatched(serieId: number): Observable<boolean> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/users/me/series/${serieId}/unwatched`, {}).pipe(
            map(response => response.success),
            catchError(() => {
                return of(false);
            })
        );
    }

    markSeasonAsWatched(serieId: number, seasonId: number): Observable<boolean> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/users/me/series/${serieId}/seasons/${seasonId}/watched`, {}).pipe(
            map(response => response.success),
            catchError(() => {
                return of(false);
            })
        );
    }

    unmarkSeasonAsWatched(serieId: number, seasonId: number): Observable<boolean> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/users/me/series/${serieId}/seasons/${seasonId}/unwatched`, {}).pipe(
            map(response => response.success),
            catchError(() => {
                return of(false);
            })
        );
    }

    markEpisodeAsWatched(serieId: number, episodeId: number): Observable<boolean> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/users/me/series/${serieId}/episodes/${episodeId}/watched`, {}).pipe(
            map(response => response.success),
            catchError(() => {
                return of(false);
            })
        );
    }

    unmarkEpisodeAsWatched(serieId: number, episodeId: number): Observable<boolean> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/users/me/series/${serieId}/episodes/${episodeId}/unwatched`, {}).pipe(
            map(response => response.success),
            catchError(() => {
                return of(false);
            })
        );
    }
}