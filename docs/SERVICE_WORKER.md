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

#### Asset Groups Architecture

The application uses **three asset groups** with different caching strategies to ensure reliability:

```json
{
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": ["/index.html", "/manifest.webmanifest", "/*.css", "/*.js", "!/custom-sw.js"]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/**/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2)",
          "!/favicon.ico"
        ]
      }
    }
  ]
}
```

#### Install Modes Explained

| Mode       | Behavior                                        | Use For                                        |
| ---------- | ----------------------------------------------- | ---------------------------------------------- |
| `prefetch` | Downloaded and cached immediately on SW install | Critical app shell files (index.html, CSS, JS) |
| `lazy`     | Cached only when first requested by the browser | Non-critical assets (images, icons, fonts)     |

#### Update Modes Explained

| Mode       | Behavior                                            | Use For                       |
| ---------- | --------------------------------------------------- | ----------------------------- |
| `prefetch` | Updated immediately when a new version is available | Assets that should stay fresh |
| `lazy`     | Updated only when requested                         | Rarely changing assets        |

#### ⚠️ CRITICAL: Why `favicon.ico` is Completely Excluded

The favicon is **completely excluded** from service worker caching (`!/favicon.ico`) because:

1. **CDN/Server transformation**: Many CDNs and servers transform, compress, or optimize favicons, changing their hash
2. **Hash validation always fails**: Even in `lazy` mode, Angular validates file hashes when caching
3. **Build/deploy mismatch**: The file served in production may differ from the build artifact
4. **Installation failure**: Hash mismatches cause `VERSION_INSTALLATION_FAILED` errors blocking SW updates
5. **Non-critical asset**: The favicon loads fine without SW caching—the browser handles it natively

**Lesson learned**: If any asset consistently causes hash mismatches in production, exclude it entirely rather than trying different cache strategies.

#### ⚠️ CRITICAL: Why `custom-sw.js` Must Be Excluded

The `custom-sw.js` file **MUST NOT** be included in the cached assets because:

1. **Service workers update independently**: The browser compares the registered SW file byte-by-byte with the server version. If the SW is cached, updates won't be detected.

2. **Hash conflicts**: Angular's ngsw creates a hash of all cached files. If `custom-sw.js` changes, the hash changes, but the SW might serve the old cached version, causing a hash mismatch.

3. **Unrecoverable state**: Hash mismatches can put the SW into `SAFE_MODE` or `EXISTING_CLIENTS_ONLY` state, breaking the app.

### Hash Mismatch Prevention Rules

To prevent `Hash mismatch (cacheBustedFetchFromNetwork)` errors in production:

| Rule                                    | Explanation                                                             |
| --------------------------------------- | ----------------------------------------------------------------------- |
| **Exclude CDN-transformed assets**      | `!/favicon.ico` - assets that CDN may modify must be excluded entirely  |
| **Exclude the service worker file**     | `!/custom-sw.js` must be in the exclusion list                          |
| **Use atomic deployments**              | All files should be deployed simultaneously to avoid version mismatches |
| **Verify build output**                 | Check `ngsw.json` hashTable matches actual file hashes before deploying |
| **Clear CDN cache on deploy**           | Stale cached files at CDN level cause hash mismatches                   |
| **Exclude persistently failing assets** | If an asset always fails hash validation, exclude it rather than debug  |

#### Which Assets Go Where?

```
┌─────────────────────────────────────────────────────────────────┐
│                    PREFETCH (app group)                         │
│  ✓ index.html          - App entry point                        │
│  ✓ manifest.webmanifest - PWA manifest                          │
│  ✓ *.js                 - JavaScript bundles                    │
│  ✓ *.css                - Stylesheets                           │
│  ✗ custom-sw.js         - EXCLUDED (updates independently)      │
├─────────────────────────────────────────────────────────────────┤
│                    LAZY (assets group)                          │
│  ✓ *.svg, *.png, *.jpg  - Images                                │
│  ✓ *.woff, *.woff2      - Fonts                                 │
│  ✓ icons/*              - PWA icons                             │
│  ✗ favicon.ico          - EXCLUDED (CDN may transform it)       │
├─────────────────────────────────────────────────────────────────┤
│                    NOT CACHED (browser handles)                 │
│  → favicon.ico          - Loaded directly, no SW caching        │
│  → custom-sw.js         - Managed by browser SW lifecycle       │
└─────────────────────────────────────────────────────────────────┘
```

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

**Symptoms**:

- Console errors: `Hash mismatch (cacheBustedFetchFromNetwork): expected XXX, got YYY`
- `VERSION_INSTALLATION_FAILED` events in UpdateService
- Users stuck on old versions
- Service worker in `EXISTING_CLIENTS_ONLY` state

**Causes**:

1. **Volatile asset in prefetch group**: Assets like `favicon.ico` in the `app` group with `prefetch` mode
2. **Files don't exist**: Files referenced in ngsw-config.json missing from build
3. **CDN cache mismatch**: CDN serving stale files while ngsw.json has new hashes
4. **Non-atomic deployment**: Files updated at different times during deploy
5. **File transformation**: Server or CDN modifying files (compression, optimization)

**Immediate Fix for Users**:

1. Open DevTools > Application > Storage
2. Click "Clear site data"
3. Reload the page

**Permanent Fix**:

1. **Move volatile assets to lazy group**:

   ```json
   {
     "name": "ui-assets",
     "installMode": "lazy",
     "updateMode": "prefetch",
     "resources": { "files": ["/favicon.ico"] }
   }
   ```

2. **Verify hashes before deploy**:

   ```bash
   # Check the hash in ngsw.json (base64 SHA-1)
   cat dist/suiviseries/browser/ngsw.json | jq '.hashTable["/favicon.ico"]'

   # Compare with actual file hash (base64, matching Angular's format)
   openssl dgst -sha1 -binary dist/suiviseries/browser/favicon.ico | openssl base64
   ```

3. **Clear CDN cache after every deploy**

4. **Use atomic deployments** (upload all files, then switch)

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

## Production Deployment Checklist

Before every production deployment, verify:

- [ ] **Build completed successfully**: `npm run build` with no errors
- [ ] **ngsw.json generated**: File exists in `dist/suiviseries/browser/`
- [ ] **custom-sw.js not in hashTable**: `grep "custom-sw.js" dist/suiviseries/browser/ngsw.json` returns nothing
- [ ] **favicon.ico not in app group**: Verify it's in `ui-assets` group with `lazy` mode
- [ ] **All referenced files exist**: Every file in ngsw.json hashTable exists in dist
- [ ] **Clear CDN cache**: Purge cache for `*.js`, `*.css`, `ngsw.json`, `ngsw-worker.js`
- [ ] **Atomic deployment**: Upload all files before making them live
- [ ] **Verify after deploy**: Check `/ngsw/state` shows `NORMAL` driver state

### Post-Deployment Verification

```bash
# Check service worker state
curl https://your-app.com/ngsw/state

# Verify ngsw.json is accessible
curl -I https://your-app.com/ngsw.json

# Check for hash mismatch in browser
# Open DevTools > Console, reload and look for errors
```

## References

- [Angular Service Worker Documentation](https://angular.dev/ecosystem/service-workers)
- [Custom Service Worker Scripts](https://angular.dev/ecosystem/service-workers/custom-service-worker-scripts)
- [Service Worker Configuration](https://angular.dev/ecosystem/service-workers/config)
- [Service Worker DevOps](https://angular.dev/ecosystem/service-workers/devops)
