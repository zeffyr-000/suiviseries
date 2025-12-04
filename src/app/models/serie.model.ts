export interface WatchProvider {
    provider_id: number;
    provider_name: string;
    logo_path: string | null;
    type: 'flatrate' | 'buy' | 'rent';
}

export interface Video {
    key: string;
    name: string;
    type: 'Trailer' | 'Teaser' | 'Clip' | 'Behind the Scenes' | 'Featurette' | 'Bloopers';
    site: string;
    size: number;
    official: boolean;
    published_at: string | null;
}

export interface Episode {
    id: number;
    episode_number: number;
    name: string;
    overview: string;
    air_date: string;
    still_path: string;
    vote_average: number;
    episode_type: string;
    runtime: number | null;
}

export interface Season {
    id: number;
    season_number: number;
    name: string;
    overview: string;
    poster_path: string;
    air_date: string;
    episode_count: number;
    episodes: Episode[];
}

export interface SerieUserData {
    is_following: boolean;
    followed_at: string | null;
    is_watched: boolean;
    watched_at: string | null;
    watched_seasons: number[];
    watched_episodes: number[];
}

export interface SerieStats {
    followedByCurrentUser: boolean;
    watchedByCurrentUser: boolean;
    totalFollowers: number;
    seasons_count?: number;
    episodes_count?: number;
}

export interface Serie {
    id: number;
    tmdb_id: number;
    name: string;
    original_name: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    first_air_date: string;
    last_air_date: string | null;
    number_of_seasons: number;
    number_of_episodes: number;
    status: SerieStatus;
    popularity: number;
    vote_average: number;
    vote_count: number;
    data_complete: boolean;
    watch_providers?: WatchProvider[];
    videos?: Video[];
    created_at?: string;
    updated_at?: string;
    poster_url?: string;
    backdrop_url?: string;
    seasons?: Season[];
    user_data?: SerieUserData;
}

export interface SerieDetailResponse {
    success: boolean;
    serie: Serie & {
        seasons: Season[];
        user_data?: SerieUserData;
    };
    stats?: {
        seasons_count: number;
        episodes_count: number;
    };
}

export interface SearchResponse {
    success: boolean;
    query: string;
    total_results: number;
    results: Serie[];
    message: string;
}

export interface UserSerieItem {
    user_serie_id: number;
    followed_at: string;
    updated_at: string;
    serie: Serie;
}

export interface UserSeriesResponse {
    success: boolean;
    message: string;
    user_id: number;
    limit: number;
    total_results: number;
    results: UserSerieItem[];
}

export enum SerieStatus {
    RETURNING = 'Returning Series',
    ENDED = 'Ended',
    CANCELED = 'Canceled',
    IN_PRODUCTION = 'In Production',
    PLANNED = 'Planned'
}

export const getTmdbImageUrl = (path: string, size: 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string => {
    return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const formatRating = (rating: number): string => {
    return (rating / 10 * 5).toFixed(1);
};