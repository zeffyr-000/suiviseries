import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Serie, SearchResponse, SerieDetailResponse, UserSeriesResponse } from '../models/serie.model';
import { SearchResource } from '../models/search-resource.model';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root'
})
export class SeriesService {

    private readonly apiUrl = environment.apiUrl;
    private readonly http = inject(HttpClient);
    private readonly notificationService = inject(NotificationService);
    private readonly userSeriesCache = signal<Serie[] | null>(null);

    createSearchResource(): SearchResource {
        const query = signal('');
        const resource = rxResource<Serie[], string | undefined>({
            params: () => {
                const q = query().trim();
                return q.length >= 2 ? q : undefined;
            },
            stream: ({ params: q }) => q ? this.searchSeries(q) : of([])
        });

        return {
            results: computed(() => resource.value() ?? []),
            isLoading: resource.isLoading,
            error: resource.error,
            hasValue: computed(() => resource.hasValue()),
            query
        };
    }

    getAllSeries(): Observable<Serie[]> {
        return this.http.get<SearchResponse>(`${this.apiUrl}/series`).pipe(
            map(response => response.success && response.results ? response.results : []),
            catchError(() => {
                this.notificationService.error('notifications.errors.load_series');
                return of([]);
            })
        );
    }

    getPopularSeries(limit = 6, page = 1): Observable<Serie[]> {
        return this.http.get<SearchResponse>(`${this.apiUrl}/series/popular?limit=${limit}&page=${page}`).pipe(
            map(response => response.success && response.results ? response.results : []),
            catchError(() => {
                this.notificationService.error('notifications.errors.load_popular');
                return of([]);
            })
        );
    }

    getTopRatedSeries(limit = 6, page = 1): Observable<Serie[]> {
        return this.http.get<SearchResponse>(`${this.apiUrl}/series/top-rated?limit=${limit}&page=${page}`).pipe(
            map(response => response.success && response.results ? response.results : []),
            catchError(() => {
                this.notificationService.error('notifications.errors.load_top_rated');
                return of([]);
            })
        );
    }

    getSerieById(id: number): Observable<Serie | undefined> {
        return this.http.get<SerieDetailResponse>(`${this.apiUrl}/series/${id}`).pipe(
            map(response => response.success && response.serie ? response.serie : undefined),
            catchError(() => {
                this.notificationService.error('notifications.errors.load_serie');
                return of(undefined);
            })
        );
    }

    getSerieDetails(id: number): Observable<SerieDetailResponse | null> {
        return this.http.get<SerieDetailResponse>(`${this.apiUrl}/series/${id}`).pipe(
            catchError(() => {
                this.notificationService.error('notifications.errors.load_details');
                return of(null);
            })
        );
    }

    searchSeries(query: string): Observable<Serie[]> {
        if (!query.trim()) return of([]);
        return this.http.get<SearchResponse>(`${this.apiUrl}/series/search?q=${encodeURIComponent(query)}`).pipe(
            map(response => response.success && response.results ? response.results : []),
            catchError(() => {
                this.notificationService.error('notifications.errors.search');
                return of([]);
            })
        );
    }

    getUserSeries(forceRefresh = false): Observable<Serie[]> {
        // Use cached data if available and not forcing refresh
        const cachedData = this.userSeriesCache();
        if (!forceRefresh && cachedData !== null) {
            return of(cachedData);
        }

        return this.http.get<UserSeriesResponse>(`${this.apiUrl}/users/me/series`).pipe(
            map(response => response.success && response.results ? response.results.map(item => item.serie) : []),
            tap(series => this.userSeriesCache.set(series)),
            catchError(() => {
                this.notificationService.error('notifications.errors.load_user_series');
                return of([]);
            })
        );
    }

    isSerieReallyFollowed(serieId: number): Observable<boolean> {
        return this.getUserSeries().pipe(
            map(series => series.some(serie => serie.id === serieId))
        );
    }

    private invalidateCache(): void {
        this.userSeriesCache.set(null);
    }

    followSerie(serieId: number): Observable<boolean> {
        return this.http.post<{ success: boolean, error?: string }>(`${this.apiUrl}/users/me/series/${serieId}/follow`, {}).pipe(
            map(response => {
                if (!response.success && response.error) {
                    throw new Error(response.error);
                }
                return response.success;
            }),
            tap(success => {
                if (success) {
                    this.invalidateCache();
                    this.notificationService.success('notifications.success.serie_added');
                }
            }),
            catchError((error) => {
                this.notificationService.error('notifications.errors.add_serie');
                return throwError(() => error);
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
            tap(success => {
                if (success) {
                    this.invalidateCache();
                    this.notificationService.success('notifications.success.serie_removed');
                }
            }),
            catchError((error) => {
                this.notificationService.error('notifications.errors.remove_serie');
                return throwError(() => error);
            })
        );
    }

    markSerieAsWatched(serieId: number): Observable<boolean> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/users/me/series/${serieId}/watched`, {}).pipe(
            map(response => response.success),
            catchError(() => {
                this.notificationService.error('notifications.errors.mark_serie');
                return of(false);
            })
        );
    }

    unmarkSerieAsWatched(serieId: number): Observable<boolean> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/users/me/series/${serieId}/unwatched`, {}).pipe(
            map(response => response.success),
            catchError(() => {
                this.notificationService.error('notifications.errors.mark_serie');
                return of(false);
            })
        );
    }

    markSeasonAsWatched(serieId: number, seasonId: number): Observable<boolean> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/users/me/series/${serieId}/seasons/${seasonId}/watched`, {}).pipe(
            map(response => response.success),
            catchError(() => {
                this.notificationService.error('notifications.errors.mark_season');
                return of(false);
            })
        );
    }

    unmarkSeasonAsWatched(serieId: number, seasonId: number): Observable<boolean> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/users/me/series/${serieId}/seasons/${seasonId}/unwatched`, {}).pipe(
            map(response => response.success),
            catchError(() => {
                this.notificationService.error('notifications.errors.mark_season');
                return of(false);
            })
        );
    }

    markEpisodeAsWatched(serieId: number, episodeId: number): Observable<boolean> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/users/me/series/${serieId}/episodes/${episodeId}/watched`, {}).pipe(
            map(response => response.success),
            catchError(() => {
                this.notificationService.error('notifications.errors.mark_episode');
                return of(false);
            })
        );
    }

    unmarkEpisodeAsWatched(serieId: number, episodeId: number): Observable<boolean> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/users/me/series/${serieId}/episodes/${episodeId}/unwatched`, {}).pipe(
            map(response => response.success),
            catchError(() => {
                this.notificationService.error('notifications.errors.mark_episode');
                return of(false);
            })
        );
    }
}