# Notifications Module

This module manages the real-time notification system for the Suivi Séries application.

## Architecture

### Components

**App Component** (`app.ts`)

- Manages the notification drawer integrated in the main `mat-sidenav-container`
- Notification button with counter badge in the toolbar
- Drawer state synchronization via `(openedChange)` event
- Actions: display, mark as read, delete, navigate to series

### Services

**UserNotificationService** (`services/user-notification.service.ts`)

- Centralized notification management with Angular Signals
- State: `notifications()` and `unreadCount()`
- REST API: PUT `/api/notifications/{id}`, DELETE `/api/notifications/{id}`
- Optimistic updates for reactive UX
- TMDB poster URL generation

### Models

**Notification** (`models/notification.model.ts`)

```typescript
interface Notification {
  user_notification_id: number;
  notification_id: number;
  serie_id: number;
  serie_name: string;
  serie_poster: string;
  type: 'new_season' | 'new_episodes' | 'status_canceled' | 'status_ended';
  translation_key: string;
  variables: NotificationVariables;
  status: 'unread' | 'read' | 'deleted';
  notified_at: string;
  read_at: string | null;
  created_at: string;
}
```

## Features

### Display

- **Material Drawer** position `end` (right), width 400px
- **Badge** on notification icon (unread counter)
- **Series posters** 48x72px with fallback icon
- **Unread indicator** 3px blue bar on the left
- **Type indicators** colored dots (green: new season, blue: new episodes, orange: status)
- **Relative dates** with Transloco (e.g., "2h ago")

### Interactions

- **Click notification**: mark as read + navigate to series page
- **Delete button**: delete notification (event.stopPropagation)
- **Click backdrop/outside**: close drawer
- **State synchronization**: `(openedChange)` prevents desynchronization

### Animations

- Material Design transition: 150ms cubic-bezier(0.2, 0, 0, 1)
- Hover states on items
- M3 border-radius: 16px (drawer leading edge)

## Tests

### Unit Tests

**UserNotificationService** (`services/user-notification.service.spec.ts`)

- ✅ Initialization with empty state
- ✅ setNotifications with data
- ✅ markAsRead: optimistic update + API call
- ✅ delete: optimistic update + API call
- ✅ Error handling with rollback
- ✅ getTmdbPosterUrl generation

**App Component** (`app.spec.ts`)

- ✅ menuOpen and notificationsOpen signals
- ✅ toggleNotifications state management
- ✅ getNotificationMessage with Transloco
- ✅ onNotificationClick: markAsRead + navigation + close drawer
- ✅ onNotificationDelete: event.stopPropagation + delete
- ✅ Login/logout flows

### Integration Tests

**Notifications Integration** (`notifications/notifications.integration.spec.ts`)

- ✅ User login loads notifications
- ✅ Complete sequence: mark read → delete
- ✅ Drawer state management (open/close/auto-close)
- ✅ Badge count updates
- ✅ Error handling with HTTP failures

### E2E Tests (Playwright)

**Notifications** (`e2e/notifications.spec.ts`)

- ✅ Not logged in: button hidden
- ✅ Logged in: button + badge visible
- ✅ Open drawer (button click)
- ✅ Close drawer (close button, backdrop, Escape)
- ✅ Notification list with posters/titles/messages/dates
- ✅ Visual indicator for unread
- ✅ Navigate to series on click
- ✅ Delete button on hover
- ✅ Notification deletion
- ✅ Badge update after read/delete
- ✅ "No notifications" message when empty
- ✅ Accessibility: ARIA labels, keyboard navigation

**Running tests:**

```bash
# Unit/integration tests
npm test

# E2E tests
npm run e2e
npm run e2e:ui     # interactive mode
npm run e2e:headed # with visible browser
```

## Internationalization

Transloco keys in `src/app/i18n/fr.ts`:

```typescript
"notification": {
  "title": "Notifications",
  "open": "Ouvrir les notifications",
  "close": "Fermer",
  "new_season": "Nouvelle saison {season_number} disponible",
  "new_episodes": "{episode_count, plural, =1 {Un nouvel épisode disponible} other {# nouveaux épisodes disponibles}}",
  "status_canceled": "La série a été annulée",
  "status_ended": "La série est terminée",
  "mark_as_read": "Marquer comme lue",
  "delete": "Supprimer",
  "no_notifications": "Aucune notification",
  "view_serie": "Voir la série",
  "date": {
    "just_now": "À l'instant",
    "minutes_ago": "{count, plural, =1 {Il y a # min} other {Il y a # min}}",
    "hours_ago": "{count, plural, =1 {Il y a #h} other {Il y a #h}}",
    "days_ago": "{count, plural, =1 {Il y a #j} other {Il y a #j}}"
  }
}
```

## Accessibility

- ✅ **ARIA labels**: notification.open, notification.close
- ✅ **Focus management**: Material sidenav manages focus trap
- ✅ **Keyboard navigation**: Escape closes drawer
- ✅ **Screen readers**: button roles, explicit tooltips
- ✅ **Color contrast**: WCAG AA compliant (badges, indicators)

## Styles

Styles integrated in `app.scss`:

```scss
// Notifications sidenav
mat-sidenav:last-of-type {
  width: 400px;
  max-width: 90vw;
  border-radius: 16px 0 0 16px; // M3 large shape
}

.notifications-header {
  /* ... */
}
.notification-item {
  &.unread::before {
    /* 3px blue bar */
  }
  &:hover {
    /* background rgba */
  }
  .delete-button {
    opacity: 0 → 1 on hover;
  }
}
```

## Technical Decisions

### Why MatSidenav instead of MatMenu?

**Problem**: MatMenu has a hardcoded `max-width: 280px` in Material (`_menu-common.scss`)

- Failed attempts: ::ng-deep, overlayPanelClass, !important, ViewEncapsulation.None
- Insufficient width for rich notifications (poster + 2-line text)

**Solution**: Migration to Material Design 3 Navigation Drawer

- ✅ Flexible width (400px configured)
- ✅ UX pattern adapted for lists/notifications (YouTube/Gmail)
- ✅ Material animations consistent with left menu
- ✅ Same `mat-sidenav-container` for consistency

### State Synchronization Pattern

```typescript
<mat-sidenav [opened]="notificationsOpen()" (openedChange)="notificationsOpen.set($event)">
```

**Critical**: Without `(openedChange)`, backdrop click closes drawer but signal stays `true` → 2 clicks needed to reopen.

**Solution**: Event binding synchronizes signal with actual Material state.

## Backend API

### GET /api/init

Returns user with:

```json
{
  "notifications": Notification[],
  "notifications_count": number
}
```

### PUT /api/notifications/:id

Marks notification as read or unread.

**Request Body:**

```json
{
  "status": "read" // or "unread"
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

### DELETE /api/notifications/:id

Permanently deletes notification.

**Response:**

```json
{
  "success": true,
  "message": "Notification deleted"
}
```

## Future Improvements

- [ ] WebSocket real-time push notifications
- [ ] Filters by type (new seasons / new episodes / status)
- [ ] Mark all as read in one click
- [ ] Pagination if > 50 notifications
- [ ] Per-series notification preferences
- [ ] Service Worker for browser notifications
