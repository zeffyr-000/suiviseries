import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { SeriesService } from './series.service';
import { NotificationService } from './notification.service';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';
import { createMockSerie } from '../testing/mocks';

describe('SeriesService', () => {
    let service: SeriesService;
    let httpMock: HttpTestingController;
    let notificationService: NotificationService;

    const mockSerie = createMockSerie({
        tmdb_id: 12345,
        original_name: 'Test Serie Original',
        overview: 'Test overview',
        number_of_seasons: 3,
        number_of_episodes: 30
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [getTranslocoTestingModule()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                SeriesService,
                NotificationService
            ]
        });
        service = TestBed.inject(SeriesService);
        httpMock = TestBed.inject(HttpTestingController);
        notificationService = TestBed.inject(NotificationService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getAllSeries', () => {
        it('should return series array on success', () => {
            service.getAllSeries().subscribe(series => {
                expect(series.length).toBe(1);
                expect(series[0].name).toBe('Test Serie');
            });

            const req = httpMock.expectOne('/api/series');
            expect(req.request.method).toBe('GET');
            req.flush({ success: true, results: [mockSerie] });
        });

        it('should return empty array on error', () => {
            const spy = vi.spyOn(notificationService, 'error');

            service.getAllSeries().subscribe(series => {
                expect(series).toEqual([]);
            });

            const req = httpMock.expectOne('/api/series');
            req.error(new ProgressEvent('error'));

            expect(spy).toHaveBeenCalledWith('notifications.errors.load_series');
        });
    });

    describe('getPopularSeries', () => {
        it('should return popular series with pagination', () => {
            service.getPopularSeries(10, 2).subscribe(series => {
                expect(series.length).toBe(1);
            });

            const req = httpMock.expectOne('/api/series/popular?limit=10&page=2');
            expect(req.request.method).toBe('GET');
            req.flush({ success: true, results: [mockSerie] });
        });

        it('should return empty array on failure', () => {
            service.getPopularSeries().subscribe(series => {
                expect(series).toEqual([]);
            });

            const req = httpMock.expectOne('/api/series/popular?limit=6&page=1');
            req.flush({ success: false, results: null });
        });
    });

    describe('getTopRatedSeries', () => {
        it('should return top rated series', () => {
            service.getTopRatedSeries().subscribe(series => {
                expect(series.length).toBe(1);
            });

            const req = httpMock.expectOne('/api/series/top-rated?limit=6&page=1');
            req.flush({ success: true, results: [mockSerie] });
        });
    });

    describe('getSerieById', () => {
        it('should return serie by id', () => {
            service.getSerieById(1).subscribe(serie => {
                expect(serie?.name).toBe('Test Serie');
            });

            const req = httpMock.expectOne('/api/series/1');
            req.flush({ success: true, serie: mockSerie });
        });

        it('should return undefined on failure', () => {
            service.getSerieById(999).subscribe(serie => {
                expect(serie).toBeUndefined();
            });

            const req = httpMock.expectOne('/api/series/999');
            req.flush({ success: false, serie: null });
        });
    });

    describe('getSerieDetails', () => {
        it('should return serie details', () => {
            service.getSerieDetails(1).subscribe(response => {
                expect(response?.success).toBe(true);
                expect(response?.serie.name).toBe('Test Serie');
            });

            const req = httpMock.expectOne('/api/series/1');
            req.flush({ success: true, serie: mockSerie });
        });

        it('should return null on error', () => {
            service.getSerieDetails(1).subscribe(response => {
                expect(response).toBeNull();
            });

            const req = httpMock.expectOne('/api/series/1');
            req.error(new ProgressEvent('error'));
        });
    });

    describe('searchSeries', () => {
        it('should return empty array for empty query', () => {
            service.searchSeries('').subscribe(series => {
                expect(series).toEqual([]);
            });

            httpMock.expectNone('/api/series/search');
        });

        it('should return search results', () => {
            service.searchSeries('test').subscribe(series => {
                expect(series.length).toBe(1);
            });

            const req = httpMock.expectOne('/api/series/search?q=test');
            req.flush({ success: true, results: [mockSerie] });
        });

        it('should encode search query', () => {
            service.searchSeries('test query').subscribe();

            const req = httpMock.expectOne('/api/series/search?q=test%20query');
            req.flush({ success: true, results: [] });
        });
    });

    describe('getUserSeries', () => {
        it('should return user series', () => {
            service.getUserSeries().subscribe(series => {
                expect(series.length).toBe(1);
            });

            const req = httpMock.expectOne('/api/users/me/series');
            req.flush({
                success: true,
                results: [{ user_serie_id: 1, followed_at: '', updated_at: '', serie: mockSerie }]
            });
        });

        it('should use cached data on second call', () => {
            // First call
            service.getUserSeries().subscribe(series => {
                expect(series.length).toBe(1);
            });

            const req1 = httpMock.expectOne('/api/users/me/series');
            req1.flush({
                success: true,
                results: [{ user_serie_id: 1, followed_at: '', updated_at: '', serie: mockSerie }]
            });

            // Second call should use cache
            service.getUserSeries().subscribe(series => {
                expect(series.length).toBe(1);
            });

            httpMock.expectNone('/api/users/me/series');
        });

        it('should refresh cache when forceRefresh is true', () => {
            // First call
            service.getUserSeries().subscribe();
            const req1 = httpMock.expectOne('/api/users/me/series');
            req1.flush({
                success: true,
                results: [{ user_serie_id: 1, followed_at: '', updated_at: '', serie: mockSerie }]
            });

            // Second call with forceRefresh
            service.getUserSeries(true).subscribe(series => {
                expect(series.length).toBe(1);
            });

            const req2 = httpMock.expectOne('/api/users/me/series');
            req2.flush({
                success: true,
                results: [{ user_serie_id: 1, followed_at: '', updated_at: '', serie: mockSerie }]
            });
        });
    });

    describe('isSerieReallyFollowed', () => {
        it('should return true if serie is in user list', () => {
            service.isSerieReallyFollowed(1).subscribe(result => {
                expect(result).toBe(true);
            });

            const req = httpMock.expectOne('/api/users/me/series');
            req.flush({
                success: true,
                results: [{ user_serie_id: 1, followed_at: '', updated_at: '', serie: mockSerie }]
            });
        });

        it('should return false if serie is not in user list', () => {
            service.isSerieReallyFollowed(999).subscribe(result => {
                expect(result).toBe(false);
            });

            const req = httpMock.expectOne('/api/users/me/series');
            req.flush({ success: true, results: [] });
        });
    });

    describe('followSerie', () => {
        it('should follow serie and show success notification', () => {
            const spy = vi.spyOn(notificationService, 'success');

            service.followSerie(1).subscribe(result => {
                expect(result).toBe(true);
            });

            const req = httpMock.expectOne('/api/users/me/series/1/follow');
            expect(req.request.method).toBe('POST');
            req.flush({ success: true });

            expect(spy).toHaveBeenCalledWith('notifications.success.serie_added');
        });

        it('should invalidate cache after follow', () => {
            // First, populate cache
            service.getUserSeries().subscribe();
            const req1 = httpMock.expectOne('/api/users/me/series');
            req1.flush({ success: true, results: [] });

            // Follow a serie
            service.followSerie(1).subscribe();
            const req2 = httpMock.expectOne('/api/users/me/series/1/follow');
            req2.flush({ success: true });

            // Next getUserSeries call should hit API again (cache invalidated)
            service.getUserSeries().subscribe();
            const req3 = httpMock.expectOne('/api/users/me/series');
            req3.flush({
                success: true,
                results: [{ user_serie_id: 1, followed_at: '', updated_at: '', serie: mockSerie }]
            });
        });

        it('should throw error on failure', () => {
            service.followSerie(1).subscribe({
                error: (err) => {
                    expect(err).toBeTruthy();
                }
            });

            const req = httpMock.expectOne('/api/users/me/series/1/follow');
            req.flush({ success: false, error: 'Already following' });
        });
    });

    describe('unfollowSerie', () => {
        it('should unfollow serie and show success notification', () => {
            const spy = vi.spyOn(notificationService, 'success');

            service.unfollowSerie(1).subscribe(result => {
                expect(result).toBe(true);
            });

            const req = httpMock.expectOne('/api/users/me/series/1/unfollow');
            req.flush({ success: true });

            expect(spy).toHaveBeenCalledWith('notifications.success.serie_removed');
        });

        it('should invalidate cache after unfollow', () => {
            // First, populate cache
            service.getUserSeries().subscribe();
            const req1 = httpMock.expectOne('/api/users/me/series');
            req1.flush({
                success: true,
                results: [{ user_serie_id: 1, followed_at: '', updated_at: '', serie: mockSerie }]
            });

            // Unfollow a serie
            service.unfollowSerie(1).subscribe();
            const req2 = httpMock.expectOne('/api/users/me/series/1/unfollow');
            req2.flush({ success: true });

            // Next getUserSeries call should hit API again (cache invalidated)
            service.getUserSeries().subscribe();
            const req3 = httpMock.expectOne('/api/users/me/series');
            req3.flush({ success: true, results: [] });
        });
    });

    describe('markSerieAsWatched', () => {
        it('should mark serie as watched', () => {
            service.markSerieAsWatched(1).subscribe(result => {
                expect(result).toBe(true);
            });

            const req = httpMock.expectOne('/api/users/me/series/1/watched');
            req.flush({ success: true });
        });

        it('should return false on error', () => {
            service.markSerieAsWatched(1).subscribe(result => {
                expect(result).toBe(false);
            });

            const req = httpMock.expectOne('/api/users/me/series/1/watched');
            req.error(new ProgressEvent('error'));
        });
    });

    describe('unmarkSerieAsWatched', () => {
        it('should unmark serie as watched', () => {
            service.unmarkSerieAsWatched(1).subscribe(result => {
                expect(result).toBe(true);
            });

            const req = httpMock.expectOne('/api/users/me/series/1/unwatched');
            req.flush({ success: true });
        });
    });

    describe('markSeasonAsWatched', () => {
        it('should mark season as watched', () => {
            service.markSeasonAsWatched(1, 10).subscribe(result => {
                expect(result).toBe(true);
            });

            const req = httpMock.expectOne('/api/users/me/series/1/seasons/10/watched');
            req.flush({ success: true });
        });
    });

    describe('unmarkSeasonAsWatched', () => {
        it('should unmark season as watched', () => {
            service.unmarkSeasonAsWatched(1, 10).subscribe(result => {
                expect(result).toBe(true);
            });

            const req = httpMock.expectOne('/api/users/me/series/1/seasons/10/unwatched');
            req.flush({ success: true });
        });
    });

    describe('markEpisodeAsWatched', () => {
        it('should mark episode as watched', () => {
            service.markEpisodeAsWatched(1, 100).subscribe(result => {
                expect(result).toBe(true);
            });

            const req = httpMock.expectOne('/api/users/me/series/1/episodes/100/watched');
            req.flush({ success: true });
        });
    });

    describe('unmarkEpisodeAsWatched', () => {
        it('should unmark episode as watched', () => {
            service.unmarkEpisodeAsWatched(1, 100).subscribe(result => {
                expect(result).toBe(true);
            });

            const req = httpMock.expectOne('/api/users/me/series/1/episodes/100/unwatched');
            req.flush({ success: true });
        });
    });
});
