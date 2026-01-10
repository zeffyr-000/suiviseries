import { Serie, SerieStatus, Season, Episode, SerieUserData, SerieStats, SerieImage, SerieImages } from '../../models/serie.model';

// Factory function to create a mock Serie with sensible defaults
export function createMockSerie(overrides: Partial<Serie> = {}): Serie {
    return {
        id: 1,
        tmdb_id: 101,
        name: 'Test Serie',
        original_name: 'Test Serie',
        overview: 'A test serie description for unit testing.',
        poster_path: '/poster.jpg',
        backdrop_path: '/backdrop.jpg',
        first_air_date: '2024-01-01',
        last_air_date: null,
        vote_average: 8.5,
        vote_count: 1000,
        status: SerieStatus.RETURNING,
        number_of_seasons: 1,
        number_of_episodes: 10,
        popularity: 100,
        data_complete: true,
        ...overrides
    };
}

// Factory function to create a mock Episode
export function createMockEpisode(overrides: Partial<Episode> = {}): Episode {
    return {
        id: 1001,
        episode_number: 1,
        name: 'Test Episode',
        overview: 'Episode overview',
        still_path: '/still.jpg',
        air_date: '2024-01-01',
        vote_average: 8,
        episode_type: 'standard',
        runtime: 45,
        ...overrides
    };
}

// Factory function to create a mock Season
export function createMockSeason(overrides: Partial<Season> = {}): Season {
    return {
        id: 100,
        season_number: 1,
        name: 'Season 1',
        overview: 'Season overview',
        poster_path: '/season_poster.jpg',
        air_date: '2024-01-01',
        episode_count: 10,
        episodes: [
            createMockEpisode({ id: 1001, episode_number: 1 }),
            createMockEpisode({ id: 1002, episode_number: 2 })
        ],
        ...overrides
    };
}

// Factory function to create mock SerieUserData
export function createMockSerieUserData(overrides: Partial<SerieUserData> = {}): SerieUserData {
    return {
        is_following: false,
        followed_at: null,
        is_watched: false,
        watched_at: null,
        watched_episodes: [],
        watched_seasons: [],
        ...overrides
    };
}

// Factory function to create mock SerieStats
export function createMockSerieStats(overrides: Partial<SerieStats> = {}): SerieStats {
    return {
        followedByCurrentUser: false,
        watchedByCurrentUser: false,
        totalFollowers: 0,
        seasons_count: 1,
        episodes_count: 10,
        ...overrides
    };
}

// Factory function to create a mock SerieImage
export function createMockSerieImage(overrides: Partial<SerieImage> = {}): SerieImage {
    return {
        file_path: '/image.jpg',
        width: 1920,
        height: 1080,
        aspect_ratio: 1.78,
        vote_average: 5.5,
        vote_count: 100,
        iso_639_1: null,
        ...overrides
    };
}

// Factory function to create mock SerieImages
export function createMockSerieImages(overrides: Partial<SerieImages> = {}): SerieImages {
    return {
        backdrops: [createMockSerieImage({ file_path: '/backdrop1.jpg' })],
        posters: [createMockSerieImage({ file_path: '/poster1.jpg', width: 500, height: 750, aspect_ratio: 0.67 })],
        logos: [],
        ...overrides
    };
}

// Create a Serie with user data for authenticated user tests
export function createMockSerieWithUserData(
    serieOverrides: Partial<Serie> = {},
    userDataOverrides: Partial<SerieUserData> = {}
): Serie {
    return createMockSerie({
        ...serieOverrides,
        user_data: createMockSerieUserData(userDataOverrides)
    });
}

// Create a Serie with seasons for testing season/episode interactions
export function createMockSerieWithSeasons(
    serieOverrides: Partial<Serie> = {},
    seasonsCount = 1
): Serie {
    const seasons = new Array(seasonsCount).fill(null).map((_, i) =>
        createMockSeason({
            id: 100 + i,
            season_number: i + 1,
            name: `Season ${i + 1}`
        })
    );

    return createMockSerie({
        ...serieOverrides,
        seasons,
        number_of_seasons: seasonsCount
    });
}
