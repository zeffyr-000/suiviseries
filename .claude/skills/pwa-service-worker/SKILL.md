---
name: pwa-service-worker
description: PWA, service worker, and Web Push conventions for Suiviseries — ngsw-config.json caching, UpdateService (SwUpdate) update prompts, PushNotificationService subscription lifecycle, and browser-capability guards. Use when touching service-worker config, app-update, or push-notification code.
---

# PWA / Service Worker

Suiviseries is a PWA using `@angular/service-worker`. Three concerns: caching config, app updates, and Web Push.

## Service Worker Config

- `ngsw-config.json` defines asset groups and data caching strategies
- Registered in `app.config.ts` via `provideServiceWorker('custom-sw.js', { enabled: !isDevMode(), registrationStrategy: 'registerWhenStable:30000' })` — this project ships a **custom worker (`custom-sw.js`)**, not the default `ngsw-worker.js`
- The SW is **disabled in dev** (`enabled: !isDevMode()`) — test PWA behavior against a production build (`npm run build` then serve `dist/`)

## App Updates — UpdateService

`UpdateService` wraps `SwUpdate` to detect new versions and prompt the user (via `NotificationService`) to reload:

```typescript
private readonly swUpdate = inject(SwUpdate);

if (this.swUpdate.isEnabled) {
  this.swUpdate.versionUpdates
    .pipe(filter((e) => e.type === 'VERSION_READY'))
    .subscribe(() => this.promptReload());
}
```

- Always guard on `swUpdate.isEnabled` (false in dev / unsupported browsers)
- Reload with `document.location.reload()` only after the user accepts

## Web Push — PushNotificationService

Manages the push subscription lifecycle. Guard every browser capability:

```typescript
if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
if (Notification.permission === 'denied') return;

const sub = await this.swPush.requestSubscription({ serverPublicKey: VAPID_PUBLIC_KEY });
// POST the subscription to the backend
```

- Check `Notification.permission` before requesting
- Send/remove the subscription on the backend when the user opts in/out
- Handle `swPush.messages` and `swPush.notificationClicks` for foreground handling and navigation
- The `push-notification-prompt` component (`components/push-notification-prompt/`) gates the opt-in UX

## Rules

- Never assume SW/push APIs exist — feature-detect first (`'serviceWorker' in navigator`, `'PushManager' in window`, `Notification.permission`)
- Keep push/update side effects out of components where possible — centralize in the dedicated services
- Test update and push flows against a real production build, not the dev server
