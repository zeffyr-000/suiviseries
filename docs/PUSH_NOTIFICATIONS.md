# Push Notifications

## Overview

This document describes the push notification implementation and the expected payload format from the backend.

## Architecture

### Custom Service Worker

The app uses a custom service worker (`custom-sw.js`) that extends Angular's `ngsw-worker.js`:

- **Imports Angular SW**: Keeps all Angular features (cache, offline, updates)
- **Adds push handler**: Displays notifications even when app is closed
- **Adds click handler**: Navigates to content and marks notifications as read

This ensures notifications work 24/7, regardless of app state.

## Backend Requirements

### Push Notification Payload Format

The backend **MUST** send push notifications with a **valid JSON payload**. The service worker will reject non-JSON payloads with a `SyntaxError`.

**Correct Format:**

```json
{
  "title": "New episodes available!",
  "body": "Breaking Bad - 3 new episodes available",
  "icon": "https://image.tmdb.org/t/p/w154/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
  "badge": "/icons/icon-72x72.png",
  "tag": "notification-10414",
  "url": "/series/breaking-bad/1396",
  "notification_id": 10414,
  "serie_id": 1311
}
```

**Incorrect Format (will cause errors):**

```
Test push notification
```

### Notification Data Schema

| Field                | Type    | Required | Description                                                                        |
| -------------------- | ------- | -------- | ---------------------------------------------------------------------------------- |
| `title`              | string  | Yes      | Notification title                                                                 |
| `body`               | string  | Yes      | Notification message                                                               |
| `icon`               | string  | No       | Icon URL (defaults to `/icons/icon-192x192.png`). Can be external URL (e.g., TMDB) |
| `badge`              | string  | No       | Badge URL (defaults to `/icons/icon-72x72.png`)                                    |
| `tag`                | string  | No       | Notification tag for grouping/replacement                                          |
| `url`                | string  | No       | **Navigation URL - must be relative path starting with `/`**                       |
| `notification_id`    | number  | No       | User notification ID to mark as read                                               |
| `serie_id`           | number  | No       | Serie ID for tracking                                                              |
| `requireInteraction` | boolean | No       | Keep notification visible until interaction                                        |

**Security Notes:**

- `url`: Restricted to relative paths only (e.g., `/series/breaking-bad/1396`) to prevent open redirect attacks
- `icon`/`badge`: External URLs accepted but backend should validate sources (e.g., whitelist trusted domains like TMDB)

## API Endpoints

### Mark Notification as Read

**Endpoint:** `PUT /api/notifications/:id`

**Authentication:** Required

- Angular HttpClient: `withCredentials: true`
- Service Worker (Fetch API): `credentials: 'include'`

**Request Body:**

```json
{
  "status": "read"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Notification marked as read",
  "notification": {
    "id": 123,
    "status": "read",
    "read_at": "2025-12-12 14:30:00"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Notification not found"
}
```

## Frontend Implementation

### Service Worker

**Custom Service Worker (`custom-sw.js`)**:

- Extends Angular's service worker (`ngsw-worker.js`)
- Handles `push` events to display notifications even when app is closed
- Handles `notificationclick` events to navigate and mark as read
- Registered via `provideServiceWorker('custom-sw.js')` in production only

### Services

1. **PushNotificationService** - Manages push notification subscriptions

   - Subscribes to push notifications via VAPID
   - Manages subscription state with signals

2. **UserNotificationService** - Manages notification state
   - Stores notifications in a signal
   - Provides read/unread counts
   - Handles optimistic UI updates

### Notification Flow

**When push notification arrives:**

1. Service worker receives `push` event (works even if app is closed)
2. Parses JSON payload
3. Displays notification with `globalThis.registration.showNotification()`

**When user clicks notification:**

1. Service worker receives `notificationclick` event
2. Closes notification
3. Focuses existing app window or opens new one at `url`
4. Sends PUT to `/api/notifications/:id` with `{"status": "read"}` to mark as read

## Common Issues

### 404 Error on Mark as Read

**Symptom:** `Failed to load resource: the server responded with a status of 404 ()`

**Cause:** The `notification_id` in the push payload doesn't exist in the database

**Solution:** Ensure the backend sends valid `notification_id` values that exist in the `user_notifications` table

### JSON Parse Error in Service Worker

**Symptom:** `Uncaught SyntaxError: Failed to execute 'json' on 'PushMessageData': ... is not valid JSON`

**Cause:** The backend is sending plain text instead of JSON

**Solution:** Update backend to send properly formatted JSON payloads as shown above

## Testing

### Test Push Notification

To test push notifications in development:

1. Subscribe to push notifications in the app
2. Send a test notification from the backend with proper JSON format
3. Verify the notification appears with correct title and body
4. Click the notification and verify navigation works
5. Check that the notification is marked as read

### Expected Backend Behavior

- Push payload must be valid JSON
- `notification_id` must exist in database
- `PUT /api/notifications/:id` must accept status updates with body `{"status": "read"}`
- `DELETE /api/notifications/:id` must accept notification deletion
- Endpoints must return 200 for valid IDs, 404 for invalid ones
