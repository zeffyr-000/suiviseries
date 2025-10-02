# Installation Setup - Suiviseries

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.19+ or 20.9+
- **npm** 9+ or **yarn** 1.22+
- **Git** 2.34+

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/zeffyr-000/suiviseries.git
cd suiviseries

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:4200`

## 🔧 Development Environment

### VS Code Setup

Install recommended extensions:

```bash
# Angular Language Service
ext install Angular.ng-template

# TypeScript
ext install ms-vscode.vscode-typescript-next

# ESLint
ext install dbaeumer.vscode-eslint

# Prettier
ext install esbenp.prettier-vscode
```

### Environment Configuration

Create your local environment file:

```bash
cp src/environments/environment.ts src/environments/environment.local.ts
```

Edit `environment.local.ts` with your API keys:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8888/suiviseries-api/www',
  googleClientId: 'your-google-client-id.apps.googleusercontent.com',
};
```

## 🔑 Google OAuth Setup

### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google Identity Services API
4. Create OAuth 2.0 credentials

### 2. Configure OAuth Client

- **Application type**: Web application
- **Authorized JavaScript origins**: `http://localhost:4200`
- **Authorized redirect URIs**: `http://localhost:4200/auth/callback`

### 3. Add Client ID

Copy your Client ID to the environment file:

```typescript
// src/environments/environment.local.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8888/suiviseries-api/www',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
};
```

## 🗄️ Backend API Setup

### Local Development

The frontend is configured to proxy API calls to a local backend:

- **Backend URL**: `http://localhost:8888/suiviseries-api/www`
- **Proxy configuration**: `proxy.conf.json`

#### Proxy Configuration

```json
{
  "/api/**": {
    "target": "http://localhost:8888/suiviseries-api/www/",
    "secure": false,
    "pathRewrite": { "^/api": "" }
  }
}
```

**How it works:**

- Frontend calls: `environment.apiUrl + '/series'` → `/api/series`
- Proxy rewrites: `/api/series` → `http://localhost:8888/suiviseries-api/www/series`
- The `pathRewrite` removes the `/api` prefix to match backend routes

### Start Backend Server

Make sure your backend server is running on port 8888 with the path `/suiviseries-api/www`.

Example backend endpoints:

- `GET http://localhost:8888/suiviseries-api/www/series`
- `POST http://localhost:8888/suiviseries-api/www/auth/google`

## 📦 Available Scripts

### Development

```bash
# Start development server with proxy
npm start

# Start without proxy
ng serve

# Start on specific port
ng serve --port 4201
```

### Build

```bash
# Development build
npm run build

# Production build
npm run build:prod

# Build with stats
npm run build:stats
```

### Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci

# Run E2E tests
npm run e2e
```

### Code Quality

```bash
# Lint TypeScript
npm run lint

# Lint and fix
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

## 🐛 Troubleshooting

### Common Issues

#### Port 4200 already in use

```bash
# Kill process on port 4200
npx kill-port 4200

# Or use different port
ng serve --port 4201
```

#### Node modules issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Google OAuth not working

- Verify Client ID in environment file
- Check authorized origins in Google Cloud Console
- Ensure backend API is running

#### API proxy errors

- Verify backend server is running on `http://localhost:8888`
- Check `proxy.conf.json` configuration
- Restart Angular dev server after proxy changes

### Performance Issues

#### Slow development server

```bash
# Use development build optimization
ng serve --optimization=false --source-map=true
```

#### Memory issues

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max_old_space_size=8192"
ng serve
```

## 🌍 Internationalization

### Adding New Languages

1. Install Transloco CLI:

```bash
npm install -g @jsverse/transloco-cli
```

2. Extract translation keys:

```bash
transloco:extract
```

3. Create language files in `src/assets/i18n/`

### Current Languages

- **French (fr)**: Default language with complete translations
- **English (en)**: Add translations to `src/assets/i18n/en.json`

## 📱 Mobile Development

### iOS Development

For iOS app development using Capacitor:

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios

# Initialize Capacitor
npx cap init

# Add iOS platform
npx cap add ios

# Build and sync
npm run build:prod
npx cap sync

# Open in Xcode
npx cap open ios
```

### Android Development

```bash
# Add Android platform
npx cap add android

# Build and sync
npm run build:prod
npx cap sync

# Open in Android Studio
npx cap open android
```

## 🚢 Production Deployment

See [Deployment Guide](DEPLOYMENT.md) for complete production setup instructions.

---

For additional help, check the [Contributing Guide](CONTRIBUTING.md) or open an issue on GitHub.
