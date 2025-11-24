# API Documentation - Suiviseries Backend

## 📡 Overview

Complete REST API documentation for the Suiviseries application.

**Base URL:** `https://api.suiviseries.com/v1`  
**Authentication:** Google OAuth 2.0 + JWT Bearer Token  
**Content-Type:** `application/json`

## 🔐 Authentication

### Google OAuth Flow

#### 1. Initiate Connection

```http
POST /auth/google/init
Content-Type: application/json

{
  "redirectUri": "https://app.suiviseries.com/auth/callback"
}
```

**Response:**

```json
{
  "authUrl": "https://accounts.google.com/oauth/authorize?client_id=...",
  "state": "random-state-token"
}
```

#### 2. Authorization Callback

```http
POST /auth/google/callback
Content-Type: application/json

{
  "code": "authorization-code-from-google",
  "state": "random-state-token"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "usr_1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://lh3.googleusercontent.com/...",
    "createdAt": "2024-01-15T10:30:00Z",
    "lastLoginAt": "2024-01-20T14:25:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

#### 3. Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 4. Logout

```http
POST /auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 👤 User Management

### User Profile

```http
GET /user/profile
Authorization: Bearer {token}
```

**Response:**

```json
{
  "id": "usr_1234567890",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://lh3.googleusercontent.com/...",
  "preferences": {
    "language": "fr",
    "theme": "dark",
    "notifications": {
      "newEpisodes": true,
      "seasonFinale": true,
      "recommendations": false
    }
  },
  "statistics": {
    "totalSeries": 45,
    "totalEpisodes": 1247,
    "totalWatchTime": 52340,
    "favoriteGenres": ["Drama", "Thriller", "Sci-Fi"]
  }
}
```

### Update Profile

```http
PATCH /user/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "preferences": {
    "language": "en",
    "theme": "light"
  }
}
```

## 📺 Series Management

### Series Search

#### General Search

```http
GET /series/search?q={query}&limit={limit}&offset={offset}
Authorization: Bearer {token}
```

**Paramètres:**

- `q` (string, required): Terme de recherche
- `limit` (integer, optional): Nombre de résultats (default: 20, max: 50)
- `offset` (integer, optional): Offset for pagination (default: 0)
- `genre` (string, optional): Filtrer par genre
- `status` (string, optional): "ended", "continuing", "upcoming"
- `year` (integer, optional): Année de première diffusion

**Response:**

```json
{
  "results": [
    {
      "id": "serie_breaking_bad",
      "title": "Breaking Bad",
      "originalTitle": "Breaking Bad",
      "overview": "Un professeur de chimie...",
      "genres": ["Crime", "Drama", "Thriller"],
      "firstAirDate": "2008-01-20",
      "lastAirDate": "2013-09-29",
      "status": "ended",
      "rating": 9.5,
      "popularity": 98.7,
      "poster": "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      "backdrop": "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
      "network": "AMC",
      "country": "US",
      "language": "en",
      "numberOfSeasons": 5,
      "numberOfEpisodes": 62,
      "episodeRunTime": [45, 47],
      "inProduction": false
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 20,
    "offset": 0,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Series Details

```http
GET /series/{serieId}
Authorization: Bearer {token}
```

**Response:**

```json
{
  "id": "serie_breaking_bad",
  "title": "Breaking Bad",
  "originalTitle": "Breaking Bad",
  "overview": "Un professeur de chimie du lycée...",
  "genres": ["Crime", "Drama", "Thriller"],
  "firstAirDate": "2008-01-20",
  "lastAirDate": "2013-09-29",
  "status": "ended",
  "rating": 9.5,
  "popularity": 98.7,
  "poster": "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
  "backdrop": "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
  "network": "AMC",
  "country": "US",
  "language": "en",
  "numberOfSeasons": 5,
  "numberOfEpisodes": 62,
  "episodeRunTime": [45, 47],
  "inProduction": false,
  "createdBy": [
    {
      "id": "person_vince_gilligan",
      "name": "Vince Gilligan",
      "job": "Creator"
    }
  ],
  "seasons": [
    {
      "id": "season_1",
      "seasonNumber": 1,
      "name": "Season 1",
      "overview": "La première saison...",
      "airDate": "2008-01-20",
      "episodeCount": 7,
      "poster": "https://image.tmdb.org/t/p/w500/...",
      "episodes": [
        {
          "id": "episode_s1e1",
          "episodeNumber": 1,
          "name": "Pilot",
          "overview": "Walter White...",
          "airDate": "2008-01-20",
          "runtime": 58,
          "stillPath": "https://image.tmdb.org/t/p/w500/...",
          "rating": 8.2
        }
      ]
    }
  ],
  "cast": [
    {
      "id": "person_bryan_cranston",
      "name": "Bryan Cranston",
      "character": "Walter White",
      "profilePath": "https://image.tmdb.org/t/p/w500/...",
      "order": 0
    }
  ],
  "userStatus": {
    "isInLibrary": true,
    "status": "completed",
    "rating": 9,
    "startedAt": "2024-01-10T20:00:00Z",
    "completedAt": "2024-01-18T22:30:00Z",
    "watchedEpisodes": 62,
    "totalEpisodes": 62,
    "currentSeason": 5,
    "currentEpisode": 16,
    "isFavorite": true,
    "notes": "Une des meilleures séries jamais créées"
  }
}
```

## 📚 My Library

### User Series List

```http
GET /user/library?status={status}&sort={sort}&order={order}&limit={limit}&offset={offset}
Authorization: Bearer {token}
```

**Paramètres:**

- `status` (string, optional): "watching", "completed", "planned", "dropped", "on_hold"
- `sort` (string, optional): "title", "rating", "addedAt", "lastWatched", "nextEpisode"
- `order` (string, optional): "asc", "desc" (default: "asc")

**Response:**

```json
{
  "series": [
    {
      "id": "serie_breaking_bad",
      "title": "Breaking Bad",
      "poster": "https://image.tmdb.org/t/p/w500/...",
      "userStatus": {
        "status": "completed",
        "rating": 9,
        "progress": {
          "watchedEpisodes": 62,
          "totalEpisodes": 62,
          "watchedSeasons": 5,
          "totalSeasons": 5,
          "completionPercentage": 100
        },
        "addedAt": "2024-01-10T18:00:00Z",
        "lastWatchedAt": "2024-01-18T22:30:00Z",
        "isFavorite": true
      }
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0
  }
}
```

### Add Series to Library

```http
POST /user/library
Authorization: Bearer {token}
Content-Type: application/json

{
  "serieId": "serie_breaking_bad",
  "status": "watching",
  "rating": null,
  "isFavorite": false,
  "notes": "Recommended by a friend"
}
```

### Update Series Status

```http
PATCH /user/library/{serieId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed",
  "rating": 9,
  "isFavorite": true,
  "completedAt": "2024-01-18T22:30:00Z",
  "notes": "Absolutely brilliant!"
}
```

### Remove Series from Library

```http
DELETE /user/library/{serieId}
Authorization: Bearer {token}
```

## 📊 Watch Management

### Mark Episode as Watched

```http
POST /user/library/{serieId}/episodes/{episodeId}/watched
Authorization: Bearer {token}
Content-Type: application/json

{
  "watchedAt": "2024-01-15T21:00:00Z",
  "rating": 8,
  "notes": "Excellent episode"
}
```

### Mark Episode as Unwatched

```http
POST /user/library/{serieId}/episodes/{episodeId}/unwatched
Authorization: Bearer {token}
```

### Mark Entire Season as Watched

```http
POST /user/library/{serieId}/seasons/{seasonNumber}/watched
Authorization: Bearer {token}
Content-Type: application/json

{
  "watchedAt": "2024-01-15T21:00:00Z"
}
```

### Mark Entire Season as Unwatched

```http
POST /user/library/{serieId}/seasons/{seasonNumber}/unwatched
Authorization: Bearer {token}
```

### Mark Entire Series as Watched

```http
POST /user/library/{serieId}/watched
Authorization: Bearer {token}
Content-Type: application/json

{
  "watchedAt": "2024-01-18T22:30:00Z",
  "rating": 9
}
```

### Mark Entire Series as Unwatched

```http
POST /user/library/{serieId}/unwatched
Authorization: Bearer {token}
```

### Watch History

```http
GET /user/history?limit={limit}&offset={offset}&fromDate={fromDate}&toDate={toDate}
Authorization: Bearer {token}
```

**Response:**

```json
{
  "history": [
    {
      "id": "history_entry_123",
      "type": "episode",
      "episode": {
        "id": "episode_s5e16",
        "title": "Felina",
        "seasonNumber": 5,
        "episodeNumber": 16,
        "series": {
          "id": "serie_breaking_bad",
          "title": "Breaking Bad"
        }
      },
      "watchedAt": "2024-01-18T22:30:00Z",
      "rating": 10,
      "notes": "Final parfait"
    }
  ],
  "pagination": {
    "total": 1247,
    "limit": 50,
    "offset": 0
  }
}
```

## 📈 Statistiques

### General Statistics

```http
GET /user/stats
Authorization: Bearer {token}
```

**Response:**

```json
{
  "overview": {
    "totalSeries": 45,
    "seriesByStatus": {
      "watching": 12,
      "completed": 28,
      "planned": 3,
      "dropped": 2,
      "on_hold": 0
    },
    "totalEpisodes": 1247,
    "totalWatchTime": 52340,
    "averageRating": 7.8,
    "favoriteGenres": [
      { "genre": "Drama", "count": 18, "percentage": 40 },
      { "genre": "Thriller", "count": 15, "percentage": 33.3 },
      { "genre": "Crime", "count": 12, "percentage": 26.7 }
    ]
  },
  "thisMonth": {
    "episodesWatched": 23,
    "watchTime": 1058,
    "seriesCompleted": 2,
    "newSeriesAdded": 1
  },
  "achievements": [
    {
      "id": "binge_watcher",
      "name": "Binge Watcher",
      "description": "Regarder 10 épisodes en une journée",
      "unlockedAt": "2024-01-15T23:45:00Z",
      "rarity": "common"
    }
  ]
}
```

### Detailed Statistics by Period

```http
GET /user/stats/timeline?period={period}&limit={limit}
Authorization: Bearer {token}
```

**Paramètres:**

- `period`: "daily", "weekly", "monthly", "yearly"
- `limit`: Nombre de périodes (default: 12)

## 🔍 Recommandations

### Get Recommendations

```http
GET /recommendations?type={type}&limit={limit}
Authorization: Bearer {token}
```

**Paramètres:**

- `type`: "trending", "similar", "popular", "new_releases"

**Response:**

```json
{
  "recommendations": [
    {
      "serie": {
        "id": "serie_better_call_saul",
        "title": "Better Call Saul",
        "poster": "https://image.tmdb.org/t/p/w500/...",
        "rating": 8.8,
        "genres": ["Crime", "Drama"]
      },
      "reason": "Basé sur votre appréciation de Breaking Bad",
      "similarity": 0.95,
      "confidence": 0.87
    }
  ],
  "metadata": {
    "type": "similar",
    "basedOn": ["Breaking Bad", "The Sopranos"],
    "algorithm": "collaborative_filtering_v2"
  }
}
```

## 🚨 Error Codes

### Authentication Errors

- `401` - Token invalide ou expiré
- `403` - Accès interdit
- `419` - Token CSRF invalide

### Validation Errors

- `400` - Données invalides
- `422` - Erreur de validation des champs

### Resource Errors

- `404` - Ressource non trouvée
- `409` - Conflit (ex: série déjà dans la bibliothèque)

### Server Errors

- `500` - Erreur interne du serveur
- `502` - Service indisponible
- `503` - Maintenance en cours

### Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données fournies ne sont pas valides",
    "details": {
      "field": "rating",
      "message": "La note doit être comprise entre 1 et 10"
    },
    "timestamp": "2024-01-20T15:30:00Z",
    "requestId": "req_1234567890"
  }
}
```

## 🔄 Rate Limiting

- **Limite générale :** 1000 requêtes par heure par utilisateur
- **Authentification :** 10 tentatives par minute
- **Search**: 100 requests per minute
- **Data Updates**: 200 requests per minute

### Rate Limiting Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642694400
```

## 🔧 Webhooks (Optional)

### Webhook Configuration

```http
POST /webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["episode.watched", "serie.completed"],
  "secret": "your-webhook-secret"
}
```

### Available Events

- `episode.watched` - Episode marked as watched
- `serie.completed` - Series completed
- `new.episode` - New episode available
- `recommendation.new` - New recommendation

---

This API is **RESTful**, **secure**, and performance-optimized. All responses include appropriate **cache headers** and support **gzip compression**.

For specific questions or feature requests, contact the development team.
