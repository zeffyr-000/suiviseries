---
name: api-data-mapping
description: Backend/frontend data mapping for Suiviseries — snake_case TMDB-shaped JSON, the { success, results } response envelope, models in models/serie.model.ts, and image/rating helpers. Use when calling /api/* endpoints, adding models, or mapping HTTP responses.
---

# API Data Mapping

The backend (`suiviseries-api`, PHP, TMDB-backed) returns **snake_case** JSON. Frontend models mirror those fields directly — no camelCase remapping layer.

## Response Envelope

Most endpoints wrap data in a `success` envelope. **Always check `success` before using the payload**:

```typescript
map((res) => (res.success ? res.results : []));
```

Envelope shapes (`models/serie.model.ts`):

- `SearchResponse` → `{ success, query, total_results, results: Serie[], message }`
- `SerieDetailResponse` → `{ success, serie: Serie & { seasons, user_data? }, stats? }`
- `UserSeriesResponse` → `{ success, message, user_id, limit, total_results, results: UserSerieItem[] }`

## Core Models (snake_case, TMDB-shaped)

- `Serie` — `id`, `tmdb_id`, `name`, `original_name`, `poster_path`, `backdrop_path`, `first_air_date`, `number_of_seasons`, `number_of_episodes`, `status: SerieStatus`, `vote_average`, `user_data?`, `seasons?`, …
- `Season` — `season_number`, `episode_count`, `episodes: Episode[]`
- `Episode` — `episode_number`, `air_date`, `still_path`, `runtime`
- `SerieUserData` — `is_following`, `is_watched`, `watched_seasons: number[]`, `watched_episodes: number[]`
- `SerieStats` — `followedByCurrentUser`, `watchedByCurrentUser`, `totalFollowers` (note: this one is camelCase — computed client/stats side)
- `SerieStatus` enum — `RETURNING` `'Returning Series'`, `ENDED` `'Ended'`, `CANCELED`, `IN_PRODUCTION`, `PLANNED`

## Helpers

```typescript
getTmdbImageUrl(path, size); // 'w300' | 'w500' | 'w780' | 'original' → full TMDB image URL
formatRating(rating); // vote_average (0–10) → 5-star string, 1 decimal
```

## Rules

- Keep model field names identical to the backend JSON (snake_case) — do not invent camelCase aliases
- Never assume a nullable field is present — `poster_path`, `air_date`, etc. can be `null`; guard before building URLs
- Endpoints are proxied in dev: `/api/*` → `http://localhost:8888/suiviseries-api/www/`
- New endpoints follow the same `{ success, results }` envelope and the HTTP error pattern in the `angular-services` skill
