import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SerieRecommendationsComponent } from './serie-recommendations.component';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';

describe('SerieRecommendationsComponent', () => {
    let component: SerieRecommendationsComponent;
    let fixture: ComponentFixture<SerieRecommendationsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                SerieRecommendationsComponent,
                getTranslocoTestingModule()
            ],
            providers: [provideRouter([])]
        }).compileComponents();

        fixture = TestBed.createComponent(SerieRecommendationsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not render when recommendations array is empty', () => {
        fixture.componentRef.setInput('recommendations', []);
        fixture.detectChanges();

        const card = fixture.nativeElement.querySelector('.recommendations-card');
        expect(card).toBeNull();
    });

    it('should render recommendation series cards', () => {
        const mockRecommendations = [
            {
                id: 1,
                tmdb_id: 101,
                name: 'Recommendation Serie 1',
                original_name: 'Recommendation Serie 1',
                overview: 'Overview 1',
                poster_path: 'https://example.com/poster1.jpg',
                backdrop_path: 'https://example.com/backdrop1.jpg',
                first_air_date: '2020-01-01',
                vote_average: 8.5,
                popularity: 100
            },
            {
                id: 2,
                tmdb_id: 102,
                name: 'Recommendation Serie 2',
                original_name: 'Recommendation Serie 2',
                overview: 'Overview 2',
                poster_path: 'https://example.com/poster2.jpg',
                backdrop_path: null,
                first_air_date: '2021-06-15',
                vote_average: 7.2,
                popularity: 80
            }
        ];

        fixture.componentRef.setInput('recommendations', mockRecommendations);
        fixture.detectChanges();

        const cards = fixture.nativeElement.querySelectorAll('.recommendation-card');
        expect(cards.length).toBe(2);
    });

    it('should generate correct route for recommendation serie', () => {
        const mockRecommendation = {
            id: 123,
            tmdb_id: 456,
            name: 'Test Serie',
            original_name: 'Test Serie',
            overview: 'Test',
            poster_path: null,
            backdrop_path: null,
            first_air_date: '2020-01-01',
            vote_average: 8,
            popularity: 100
        };

        const route = component.getSerieRoute(mockRecommendation);
        expect(route).toEqual(['/serie', 123, 'test-serie']);
    });

    it('should display poster image when poster_path is available', () => {
        const mockRecommendations = [
            {
                id: 1,
                tmdb_id: 101,
                name: 'Test Serie',
                original_name: 'Test Serie',
                overview: 'Test',
                poster_path: 'https://example.com/poster.jpg',
                backdrop_path: null,
                first_air_date: '2020-01-01',
                vote_average: 8,
                popularity: 100
            }
        ];

        fixture.componentRef.setInput('recommendations', mockRecommendations);
        fixture.detectChanges();

        const img = fixture.nativeElement.querySelector('.recommendation-poster img');
        expect(img).toBeTruthy();
        expect(img.src).toBe('https://example.com/poster.jpg');
    });

    it('should display placeholder when poster_path is null', () => {
        const mockRecommendations = [
            {
                id: 1,
                tmdb_id: 101,
                name: 'Test Serie',
                original_name: 'Test Serie',
                overview: 'Test',
                poster_path: null,
                backdrop_path: null,
                first_air_date: '2020-01-01',
                vote_average: 8,
                popularity: 100
            }
        ];

        fixture.componentRef.setInput('recommendations', mockRecommendations);
        fixture.detectChanges();

        const placeholder = fixture.nativeElement.querySelector('.recommendation-poster-placeholder');
        expect(placeholder).toBeTruthy();
    });

    it('should format rating correctly', () => {
        expect(component['formatRating'](8)).toBe('4.0');
        expect(component['formatRating'](7.5)).toBe('3.8');
        expect(component['formatRating'](10)).toBe('5.0');
    });

    it('should display year from first_air_date', () => {
        const mockRecommendations = [
            {
                id: 1,
                tmdb_id: 101,
                name: 'Test Serie',
                original_name: 'Test Serie',
                overview: 'Test',
                poster_path: null,
                backdrop_path: null,
                first_air_date: '2020-05-15',
                vote_average: 8,
                popularity: 100
            }
        ];

        fixture.componentRef.setInput('recommendations', mockRecommendations);
        fixture.detectChanges();

        const year = fixture.nativeElement.querySelector('.recommendation-year');
        expect(year.textContent.trim()).toBe('2020');
    });

    it('should have routerLink attribute on cards', () => {
        const mockRecommendations = [
            {
                id: 789,
                tmdb_id: 456,
                name: 'Test Serie',
                original_name: 'Test Serie',
                overview: 'Test',
                poster_path: null,
                backdrop_path: null,
                first_air_date: '2020-01-01',
                vote_average: 8,
                popularity: 100
            }
        ];

        fixture.componentRef.setInput('recommendations', mockRecommendations);
        fixture.detectChanges();

        const card = fixture.nativeElement.querySelector('.recommendation-card');
        expect(card).toBeTruthy();
        expect(card.tagName.toLowerCase()).toBe('a');
    });
});
