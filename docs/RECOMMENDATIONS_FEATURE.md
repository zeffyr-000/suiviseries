# Series Recommendations Feature

## Overview

This document describes the implementation of the series recommendations feature in the serie-detail page. Recommendations are based on TMDB user preferences and provide more relevant suggestions than similar series.

## Component: `SerieRecommendationsComponent`

### Location

`src/app/serie-detail/serie-recommendations/`

### Purpose

Displays a grid of recommended series based on TMDB user behavior and preferences for the currently viewed series.

### Input Properties

```typescript
recommendations = input.required<Recommendation[]>();
```

### Recommendation Interface

```typescript
interface Recommendation {
  id: number; // Internal database ID (for direct navigation)
  tmdb_id: number; // TMDB ID (for reference)
  name: string; // Serie name
  original_name: string; // Original serie name
  overview: string; // Serie synopsis
  poster_path: string | null; // Full poster URL (w500) or null
  backdrop_path: string | null; // Full backdrop URL (w1280) or null
  first_air_date: string | null; // First air date (YYYY-MM-DD)
  vote_average: number; // Rating (0-10)
  popularity: number; // TMDB popularity score
}
```

## Features

### Visual Display

- **Grid layout**: Responsive grid with auto-fill columns (minimum 150px on desktop, 120px on mobile)
- **Card design**: Each recommended series is displayed as a card with:
  - Poster image or placeholder icon
  - Series title (truncated to 2 lines)
  - Release year
  - Star rating (converted from 0-10 to 0-5 scale)

### Interactions

- **Click**: Navigates to the detail page of the selected recommended serie using internal database ID
- **Keyboard**: Fully keyboard accessible with focus states
- **Hover effects**:
  - Card lifts up 8px with scale transform on hover
  - Smooth transitions for all hover states
  - Focus outline for keyboard navigation

### Accessibility

- `routerLink` for semantic navigation
- Focus-visible outline for keyboard users
- `aria-label` with serie name for screen readers
- Semantic HTML structure

## Integration in SerieDetailComponent

### Data Flow

1. **API Response**: The backend returns a `recommendations` array in the `/api/series/:id/detail` endpoint
2. **Computed Property**:
   ```typescript
   protected recommendations = computed(() => {
       const currentSerie = this.serie();
       return currentSerie?.recommendations || [];
   });
   ```
3. **Template Rendering**: Component only renders if `recommendations().length > 0`
4. **Navigation**: Uses `routerLink` for direct navigation with internal database ID

### Navigation Method

Uses URL utility functions for consistent route generation:

```typescript
protected getSerieRoute(serie: Recommendation): unknown[] {
    return getSerieRouteParams(serie.id, serie.name);
}
```

**Key Improvement**: Direct navigation using internal database ID eliminates the need for a search query, making navigation instant and reliable.

## Styling

### Key CSS Features

- **Material Design 3** principles
- **CSS Grid** for responsive layout
- **Smooth transitions** (300ms cubic-bezier(0.2, 0, 0, 1))
- **Elevation shadows** from Material Design system
- **Color tokens** from Material theme
- **Responsive breakpoints** using mixins
- **Rating badge mixin** for consistent styling across components

### Color Usage

- Primary color: For section icon
- Surface variant: For placeholder backgrounds
- On-surface: For text
- Star icon: Golden color (#fbbf24)

## Translation Keys

Located in `src/app/i18n/fr.ts`:

```typescript
{
    "serie_detail": {
        "recommendations": "Recommandations",
        "view_recommendation": "Voir les détails de {{name}}"
    }
}
```

## Testing

### Test File

`src/app/serie-detail/serie-recommendations/serie-recommendations.component.spec.ts`

### Test Coverage

- Component creation
- Conditional rendering (empty vs populated)
- Card rendering count
- Route generation
- Poster image display
- Placeholder display for missing posters
- Rating format conversion
- Year extraction from date
- RouterLink integration

## Performance Considerations

### API Response

- Maximum **10 recommended series** returned by backend
- Sorted by relevance (TMDB user behavior-based)
- Better quality filter: rating ≥ 6.5 OR (popularity ≥ 5 + 100+ votes)
- Only series available in the database (navigation guaranteed)

### Image Loading

- `loading="lazy"` attribute on all images
- Poster size: w500 (500px width)
- Fallback to placeholder icon if no poster
- Full URLs provided by backend (no client-side concatenation)

### Rendering

- Only renders if `recommendations().length > 0`
- Uses `@for` with `track recommendation.id` for efficient updates
- `ChangeDetectionStrategy.OnPush` for optimal performance
- Signals for reactive state management

## Why Recommendations Instead of Similar Series?

The migration from `/similar` to `/recommendations` endpoint provides:

1. **Better relevance**: Based on actual TMDB user behavior vs metadata matching
2. **Quality example**: Narcos now correctly suggests Narcos: Mexico as #1 recommendation
3. **Higher quality threshold**: More stringent filtering for better suggestions
4. **User-driven**: Reflects real preferences from TMDB community

## Dependencies

- `@angular/material`: MatCard, MatIcon
- `@jsverse/transloco`: Internationalization
- `@angular/common`: DatePipe
- `@angular/router`: RouterLink for navigation
- Material Design 3 theme variables
- Custom SCSS mixins for responsive design and rating badge
