# Service Worker Configuration Guide

This document describes how the Angular Service Worker is configured in the Suivi Séries application, common pitfalls to avoid, and troubleshooting steps.

## Architecture Overview

The application uses a **custom service worker** that extends Angular's default service worker to add push notification handling.

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   custom-sw.js                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              ngsw-worker.js                     │  │  │
│  │  │  (Angular Service Worker - handles caching)     │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  + Push notification handlers                        │  │
│  │  + Notification click handlers                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Files Involved

| File                                 | Purpose                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------- |
| `src/custom-sw.js`                   | Custom service worker that imports ngsw-worker.js and adds push handlers  |
| `ngsw-config.json`                   | Configuration for Angular's service worker (caching strategies, assets)   |
| `src/app/app.config.ts`              | Registers the service worker via `provideServiceWorker()`                 |
| `src/app/services/update.service.ts` | Handles SW update detection and user notification                         |
| `angular.json`                       | Includes `custom-sw.js` in build assets and references `ngsw-config.json` |

## Configuration Details

### 1. Service Worker Registration (`app.config.ts`)

```typescript
provideServiceWorker('custom-sw.js', {
  enabled: !isDevMode(),
  registrationStrategy: 'registerWhenStable:30000',
});
```

- **`custom-sw.js`**: We register our custom SW, NOT `ngsw-worker.js` directly
- **`enabled: !isDevMode()`**: SW is disabled in development mode
- **`registerWhenStable:30000`**: Wait for app stability or 30 seconds max before registering

### 2. NGSW Configuration (`ngsw-config.json`)

#### Asset Groups

```json
{
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/manifest.webmanifest",
          "/*.css",
          "/*.js",
          "!/custom-sw.js" // ⚠️ CRITICAL: Exclude custom-sw.js
        ]
      }
    }
  ]
}
```

#### ⚠️ CRITICAL: Why `custom-sw.js` Must Be Excluded

The `custom-sw.js` file **MUST NOT** be included in the cached assets because:

1. **Service workers update independently**: The browser compares the registered SW file byte-by-byte with the server version. If the SW is cached, updates won't be detected.

2. **Hash conflicts**: Angular's ngsw creates a hash of all cached files. If `custom-sw.js` changes, the hash changes, but the SW might serve the old cached version, causing a hash mismatch.

3. **Unrecoverable state**: Hash mismatches can put the SW into `SAFE_MODE` or `EXISTING_CLIENTS_ONLY` state, breaking the app.

#### Data Groups (API Caching)

```json
{
  "dataGroups": [
    {
      "name": "api-performance",
      "urls": ["https://image.tmdb.org/**"],
      "cacheConfig": {
        "strategy": "performance", // Cache-first
        "maxSize": 200,
        "maxAge": "30d"
      }
    },
    {
      "name": "api-freshness",
      "urls": ["/api/**"],
      "cacheConfig": {
        "strategy": "freshness", // Network-first
        "maxSize": 50,
        "maxAge": "1h",
        "timeout": "3s"
      }
    }
  ]
}
```

### 3. Build Configuration (`angular.json`)

```json
{
  "assets": [
    { "glob": "**/*", "input": "public" },
    "src/robots.txt",
    "src/custom-sw.js" // Copied to dist/browser/
  ],
  "configurations": {
    "production": {
      "serviceWorker": "ngsw-config.json" // Generates ngsw.json manifest
    }
  }
}
```

### 4. Custom Service Worker (`src/custom-sw.js`)

```javascript
// MUST be first line - imports Angular's service worker
importScripts('./ngsw-worker.js');

// Custom push notification handler
globalThis.addEventListener('push', (event) => {
  // Handle push notifications...
});

// Custom notification click handler
globalThis.addEventListener('notificationclick', (event) => {
  // Handle notification clicks...
});
```

## Update Detection (`update.service.ts`)

The `UpdateService` handles:

1. **Periodic update checks**: Every 6 hours once app is stable
2. **Initial update check**: Forced check on first load
3. **Version ready notification**: Prompts user to reload
4. **Installation failures**: Logs errors for debugging
5. **Unrecoverable state**: Prompts user to reload to recover

### Events Handled

| Event                         | Handling              |
| ----------------------------- | --------------------- |
| `VERSION_READY`               | Prompt user to reload |
| `VERSION_INSTALLATION_FAILED` | Log error             |
| `UNRECOVERABLE_STATE`         | Prompt user to reload |

## Common Pitfalls

### ❌ DON'T: Include non-existent files in ngsw-config.json

```json
// BAD - index.csr.html doesn't exist in Angular 21+
"files": ["/index.csr.html", "/index.html"]
```

This causes hash validation failures because the SW expects a file that doesn't exist.

### ❌ DON'T: Cache the service worker file itself

```json
// BAD - custom-sw.js will be cached, preventing updates
"files": ["/*.js"]
```

### ✅ DO: Exclude the custom SW from caching

```json
// GOOD - Negative pattern AFTER the inclusive pattern
"files": ["/*.js", "!/custom-sw.js"]
```

### ❌ DON'T: Put negative patterns before positive ones

```json
// BAD - Pattern order matters! Exclusion must come AFTER inclusion
"files": ["!/custom-sw.js", "/*.js"]
```

### ❌ DON'T: Ignore unrecoverable states

```typescript
// BAD - User stuck on broken version
this.swUpdate.versionUpdates.subscribe(/* only VERSION_READY */);
```

### ✅ DO: Handle all SW events

```typescript
// GOOD - Full error handling
this.swUpdate.versionUpdates.subscribe(/* handle all events */);
this.swUpdate.unrecoverable.subscribe(/* prompt reload */);
```

## Troubleshooting

### Check Service Worker Status

Navigate to: `https://your-app.com/ngsw/state`

This shows:

- Driver state (NORMAL, SAFE_MODE, EXISTING_CLIENTS_ONLY)
- Latest manifest hash
- Last update check
- Active versions and clients

### Common Issues

#### "Hash mismatch" errors

**Symptoms**: Console errors about hash mismatches, app not updating

**Causes**:

1. Files referenced in ngsw-config.json don't exist
2. CDN or proxy serving stale files
3. Non-atomic deployment (files updated at different times)

**Fix**:

- Verify all files in ngsw-config.json exist in the build
- Clear CDN cache
- Use atomic deployments

#### Service worker not updating

**Symptoms**: Users don't see new versions

**Causes**:

1. custom-sw.js is being cached
2. Browser aggressively caching SW
3. UpdateService not running

**Fix**:

- Ensure `!/custom-sw.js` is in ngsw-config.json
- Check browser DevTools > Application > Service Workers
- Verify UpdateService.checkForUpdates() is called

#### App stuck in broken state

**Symptoms**: App shows errors, won't load

**Causes**:

1. Unrecoverable SW state
2. Corrupted cache

**Fix for users**:

1. Open DevTools > Application > Service Workers
2. Click "Unregister" on the service worker
3. Clear site data
4. Reload the page

**Programmatic recovery** (already implemented):

```typescript
this.swUpdate.unrecoverable.subscribe(() => {
  if (confirm('Reload to recover?')) {
    location.reload();
  }
});
```

## Testing Service Worker Changes

1. **Build in production mode**: `npm run build`

2. **Verify ngsw.json**: Check `dist/suiviseries/browser/ngsw.json`

   - Ensure `custom-sw.js` is NOT in the `urls` or `hashTable`
   - Verify all referenced files exist

3. **Test with http-server**:

   ```bash
   npx http-server dist/suiviseries/browser -p 8080
   ```

4. **Check SW registration**: DevTools > Application > Service Workers

5. **Simulate update**:
   - Make a change and rebuild
   - Reload the page
   - Verify update notification appears

## References

- [Angular Service Worker Documentation](https://angular.dev/ecosystem/service-workers)
- [Custom Service Worker Scripts](https://angular.dev/ecosystem/service-workers/custom-service-worker-scripts)
- [Service Worker Configuration](https://angular.dev/ecosystem/service-workers/config)
- [Service Worker DevOps](https://angular.dev/ecosystem/service-workers/devops)
