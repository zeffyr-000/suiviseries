# 📺 Suiviseries

> Modern and performant Angular 20 application for personalized TV series tracking

[![Angular](https://img.shields.io/badge/Angular-20.3-red.svg)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org)
[![Material](https://img.shields.io/badge/Material-20.0-purple.svg)](https://material.angular.io)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Features

### 🎯 Smart Tracking

- **Hierarchical Management**: Series, season, or individual episode marking with automatic synchronization
- **Advanced Statuses**: Watching, completed, planned, dropped, on hold
- **Notes & Ratings**: Personal rating system and custom comments
- **Complete History**: Chronological tracking of your viewing progress

### 🔍 Discovery & Search

- **Multi-filter Search**: By title, genre, year, status, network
- **Recommendations**: Suggestions based on your tastes and viewing habits
- **Trending & Popular**: Discover current trending series
- **Rich Details**: Cast, creators, synopsis, critic ratings

### 🎨 Modern Interface

- **Material Design 3**: Smooth interface with animations and transitions
- **Custom Theme**: Rose/red color palette with dark mode
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **A11y Accessibility**: Full screen reader support

### 🌍 International & Performance

- **Multilingual**: French support with Transloco and MessageFormat
- **Local Fonts**: Local Roboto for better performance
- **PWA Ready**: Native installation and offline functionality
- **Lazy Loading**: Optimized module loading

## 📚 Documentation

- 📖 **[Installation Guide](docs/SETUP.md)** - Complete project setup
- 🏗️ **[Technical Architecture](docs/ARCHITECTURE.md)** - Code patterns and structure
- 🚀 **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment options
- 🤝 **[Contributing Guide](docs/CONTRIBUTING.md)** - Development standards and workflow
- 📡 **[API Documentation](docs/API.md)** - Backend API specifications

## API Proxy Configuration

The application is configured to use a proxy to the backend API during development.

### Configuration

- **Proxy file**: `proxy.conf.json`
- **API URL**: `http://localhost:8888/suiviseries-api/www`
- **Local prefix**: `/api`

### Usage

Calls to `/api/*` are automatically redirected to the backend API:

- `GET /api/series` → `http://localhost:8888/suiviseries-api/www/series`
- `GET /api/series/popular` → `http://localhost:8888/suiviseries-api/www/series/popular`

## Google OAuth Authentication

The application uses Google OAuth for user authentication and registration.

### Required Configuration

1. **Google Cloud Console**: Set up a project with Google Identity API
2. **Client ID**: Add your Google Client ID to environment files
3. **API Backend**: Implement authentication endpoints

### Authentication Architecture

#### Google Identity Services Loading

The Google Identity Services script is loaded directly in `src/index.html`:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

#### TypeScript Integration

Custom types defined in `src/app/types/google-identity.types.ts`:

- `GoogleIdConfiguration` - Google Identity setup
- `CredentialResponse` - Authentication response
- `GsiButtonConfiguration` - Google button configuration
- Helper functions: `isGoogleLibraryLoaded()`, `waitForGoogleLibrary()`

#### Authentication Service

The `AuthService` handles:

- Initialization with `waitForGoogleLibrary()`
- Automatic configuration once library is loaded
- Reactive state management with Signals
- Robust fallback and error handling

## 🎨 Technical Architecture

### Core Stack

- **Angular 20** with standalone components and modern control flow (`@if`, `@for`)
- **Angular Material 20** with Material Design 3
- **TypeScript 5+** with strict ESLint configuration
- **RxJS 7** for reactive programming
- **Signals** for reactive state management

### Project Structure

```
src/app/
├── guards/           # Route guards (auth.guard.ts)
├── home/            # Homepage with popular series
├── search/          # Series search functionality
├── serie-detail/    # Series details with season/episode management
├── my-series/       # User's series library
├── login/           # Authentication components
├── shared/          # Reusable components (serie-card, status-chip)
├── services/        # Services (auth, series, HTTP)
├── models/          # TypeScript types and interfaces
├── utils/           # Utilities (URL, formatting)
├── i18n/           # Transloco translations
└── types/          # Custom TypeScript types
```

### Advanced State Management

#### Hierarchical Tracking: Series → Season → Episode

- **Complete Series**: Automatically marks all seasons and episodes
- **Complete Season**: Marks/unmarks all episodes in the season
- **Individual Episode**: Automatically updates parent season status
- **Consistency**: Bidirectional synchronization across all levels

#### Consistent REST API

- `POST /series/{id}/watched` → Mark series as watched
- `POST /series/{id}/unwatched` → Mark series as unwatched
- `POST /series/{id}/seasons/{seasonId}/watched` → Mark season as watched
- `POST /series/{id}/seasons/{seasonId}/unwatched` → Mark season as unwatched
- `POST /series/{id}/episodes/{episodeId}/watched` → Mark episode as watched
- `POST /series/{id}/episodes/{episodeId}/unwatched` → Mark episode as unwatched

## 🎨 Design System

### Material Design 3 Theme

- **Primary Color**: Rose (#FF4081)
- **Accent Color**: Red (#F44336)
- **Typography**: Roboto (300, 400, 500, 700)
- **Icons**: Material Icons via Google CDN

### Performance Optimizations

- **Roboto**: Installed locally via `@fontsource/roboto` (-400KB vs CDN)
- **Material Icons**: Google CDN (official Angular Material recommendation)
- **Benefits**: Local fonts for performance, global cache for icons

## 🚀 Development

### Quick Start

```bash
# Install dependencies
npm install

# Start development server with API proxy
npm start
```

The application launches with automatic proxy configuration to the backend API. Routes are protected by authentication guards.

Navigate to `http://localhost:4200/` - the app will reload automatically when you modify source files.

### Main Routes

- `/` - Homepage with popular series
- `/search` - Series search
- `/my-series` - User's series library (authentication protected)
- `/serie/:id/:slug` - Series details with season/episode management
- `/login` - Google OAuth authentication

### Route Protection

The `auth.guard.ts` guard protects sensitive routes:

- Automatic redirection to `/` with `?login=true` if not authenticated
- `returnUrl` support for post-login redirection
- Automatic login modal based on URL parameters

## 🔧 Available Scripts

### Development

```bash
npm start                    # Start dev server with proxy (port 4200)
npm run build               # Development build
npm run build:prod          # Production build with optimizations
```

### Code Quality

```bash
npm run lint                # ESLint with strict rules
npm run lint:fix           # Auto-fix ESLint issues
npm test                   # Unit tests with Karma
npm run test:coverage      # Tests with coverage report
```

### Production Build Optimizations

The production build automatically applies:

- **Tree-shaking**: Dead code elimination
- **Minification**: Optimized JS, CSS, and HTML
- **Lazy loading**: On-demand route loading
- **Code splitting**: Optimal chunks for browser caching
- **Source maps**: For production debugging
- **Bundle analysis**: Size optimization tracking

## 🧪 Testing

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

## 🌐 Internationalization & Pluralization

The application uses **Transloco** with **MessageFormat** for plural management according to ICU standards.

### Pluralization Management

- **ICU Format**: `{count, plural, =0 {no items} one {# item} other {# items}}`
- **Complete Documentation**: See [docs/PLURALIZATION.md](./docs/PLURALIZATION.md)
- **Quick Reference**: See [docs/PLURALIZATION-QUICK-REFERENCE.md](./docs/PLURALIZATION-QUICK-REFERENCE.md)

### Usage Example

### Internationalization Example

```typescript
// i18n/fr.json
"series.episodes": "{count, plural, =0 {No episodes} one {# episode} other {# episodes}}"

// Component template
<span>{{ 'series.episodes' | transloco: {count: serie.episode_count} }}</span>
```

**Output:**

- `count = 0` → "No episodes"
- `count = 1` → "1 episode"
- `count = 5` → "5 episodes"

Execute tests with coverage:

```bash
npm run test:coverage
```

## 🏗️ Technical Highlights

### Modern Angular 20 Architecture

- **Standalone Components**: Full migration from NgModule pattern
- **Modern Control Flow**: `@if`, `@for`, `@switch` syntax
- **Signals API**: Reactive state management
- **Strict TypeScript**: Enhanced type safety and performance

### Advanced Series Tracking

- **Hierarchical Logic**: Series → Season → Episode synchronization
- **Bidirectional State**: Automatic parent/child status updates
- **Consistent REST API**: Unified `/watched` and `/unwatched` endpoints
- **Error Recovery**: Automatic rollback on API failures

### Performance Optimizations

- **Local Fonts**: @fontsource/roboto (-400KB vs Google CDN)
- **Smart Caching**: TTL-based HTTP cache with invalidation
- **Code Splitting**: Optimized lazy loading by route
- **Bundle Size**: <250KB initial, <50KB per lazy chunk

---

**Modern Angular 20 application built with TypeScript 5+, Material Design 3, and current best practices.**
