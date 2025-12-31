# Session Persistence - Suiviseries

## Overview

The application implements a persistent authentication system that keeps users logged in across multiple visits, even after several days. The system uses a combination of local storage, JWT tokens, and automatic session refresh.

## Key Components

### 1. Token Storage

The authentication system stores user session data in the browser's `localStorage`:

- **Token**: `suiviseries_auth_token` - JWT token received from the backend
- **User Data**: `suiviseries_user_data` - Serialized user information

This data persists across browser sessions and allows the user to remain authenticated even after closing and reopening the browser.

### 2. Session Initialization

When the application starts (`app.config.ts`), the authentication service performs the following steps:

1. **Load from Storage** (`loadUserFromStorage()`):

   - Reads user data from localStorage
   - Sets the user as authenticated in the application state
   - Does NOT immediately invalidate expired JWT tokens

2. **Verify with Backend** (`refreshSession()`):
   - Sends a request to `/api/init` with the stored token
   - If backend session is valid: updates user data and continues
   - If backend session is invalid: clears authentication data

This approach allows the backend to maintain longer sessions (e.g., using refresh tokens) while the frontend JWT may have a shorter expiration.

### 3. Keep-Alive Mechanism

The `KeepAliveService` runs automatically when the app starts:

- **Interval**: Every 60 minutes (configurable)
- **Action**: Calls `refreshSession()` to verify and renew the session
- **Condition**: Only runs when user is authenticated
- **Lifecycle**: Runs continuously until the app is closed

### 4. Session Refresh Flow

```
User Opens App
    ↓
Load User from localStorage
    ↓
Call /api/init with token
    ↓
Backend validates session
    ↓
┌─────────────────┬─────────────────┐
│  Valid Session  │ Invalid Session │
├─────────────────┼─────────────────┤
│ Keep user auth  │ Clear auth data │
│ Update user     │ Show login      │
└─────────────────┴─────────────────┘
```

## Implementation Details

### AuthService Methods

#### `loadUserFromStorage()`

```typescript
// Loads user from localStorage without immediate JWT validation
// Allows refreshSession() to verify with backend
private loadUserFromStorage(): void {
    const userData = this.getStorageItem(this.userStorageKey);
    if (userData) {
        const user: User = JSON.parse(userData);
        this._currentUser.set(user);
    }
}
```

#### `refreshSession()`

```typescript
// Verifies session with backend using stored token
// Updates or clears authentication based on backend response
async refreshSession(): Promise<void> {
    const token = this.getStorageItem(this.storageKey);
    const response = await this.http.get<InitResponse>('/api/init', {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (response.authenticated && response.user) {
        this._currentUser.set(response.user);
    } else {
        this.clearAuthData();
    }
}
```

#### `initializeApp()`

```typescript
// Called on app startup
// Loads local session then syncs with backend
private async initializeApp(): Promise<void> {
    this.loadUserFromStorage();
    try {
        await this.refreshSession();
    } catch {
        // Sync failed, local session maintained
        // User will be logged out on next interaction if truly invalid
    }
}
```

### KeepAliveService

```typescript
@Injectable({ providedIn: 'root' })
export class KeepAliveService {
  private readonly KEEP_ALIVE_INTERVAL = 60 * 60 * 1000; // 1 hour

  startKeepAlive(): void {
    interval(this.KEEP_ALIVE_INTERVAL)
      .pipe(
        filter(() => this.authService.isAuthenticated()),
        switchMap(() => from(this.authService.refreshSession()))
      )
      .subscribe();
  }
}
```

## Backend Requirements

### Critical Changes Required

The frontend now implements persistent authentication that keeps users logged in for days/weeks. The backend MUST be updated to support this system.

### 🔴 Problem with Current Implementation

If the backend only validates JWT tokens and rejects expired ones, **users will be disconnected after ~1 hour** (JWT expiration), defeating the purpose of persistent sessions.

### ✅ Required Backend Changes

#### 1. Modify `/api/init` Endpoint

**Current behavior (incorrect):**

```php
// ❌ This will disconnect users when JWT expires
if (!isJWTValid($token)) {
    return ['authenticated' => false];
}
```

**Required behavior:**

```php
// ✅ Validate server-side session, not just JWT
function handleInitRequest() {
    $token = getAuthorizationToken(); // From "Authorization: Bearer xxx"

    // Check server-side session (cookie, refresh token, or session DB)
    $sessionId = $_COOKIE['suiviseries_session'] ?? null;

    if ($sessionId && isServerSessionValid($sessionId)) {
        $user = getUserFromSession($sessionId);

        // Optional: Generate new JWT for the frontend
        $newJwt = generateJWT($user, 3600); // 1 hour expiration

        return [
            'authenticated' => true,
            'user' => [
                'id' => $user->id,
                'google_id' => $user->google_id,
                'email' => $user->email,
                'display_name' => $user->display_name,
                'photo_url' => $user->photo_url,
                'status' => $user->status,
                'created_at' => $user->created_at,
                'last_login' => $user->last_login,
                'notifications' => $user->notifications,
                'notifications_count' => $user->notifications_count
            ],
            'token' => $newJwt // Optional: return refreshed JWT
        ];
    }

    return [
        'authenticated' => false,
        'user' => null
    ];
}
```

#### 2. Implement Two-Level Authentication

**Short-lived JWT (1 hour):**

- Used for API requests
- Stored in `localStorage` by frontend
- Low security risk if compromised

**Long-lived Session (30 days):**

- Cookie HTTP-only secure **OR** Refresh token in database
- Allows reconnection even with expired JWT
- High security through server-side validation

#### 3. Login Endpoint Modifications

```php
// POST /auth/login
function handleLogin($googleCredential) {
    $user = authenticateWithGoogle($googleCredential);

    // Generate short-lived JWT
    $accessToken = generateJWT($user, 3600); // 1 hour

    // Create long-lived server session
    $sessionId = createServerSession($user->id, 30 * 24 * 3600); // 30 days

    // Set secure HTTP-only cookie
    setcookie('suiviseries_session', $sessionId, [
        'expires' => time() + (30 * 24 * 3600),
        'path' => '/',
        'httponly' => true,
        'secure' => true, // HTTPS only
        'samesite' => 'Strict'
    ]);

    return [
        'success' => true,
        'user' => $user,
        'token' => $accessToken
    ];
}
```

#### 4. Session Validation Flow

```
Frontend Request to /api/init
    ↓
Backend receives JWT (may be expired) + Session Cookie
    ↓
Check Server-Side Session
    ↓
┌─────────────────────────┬──────────────────────────┐
│    Session Valid        │     Session Invalid      │
├─────────────────────────┼──────────────────────────┤
│ Return authenticated    │ Return authenticated     │
│ user: {...}             │ false                    │
│ token: new JWT          │                          │
└─────────────────────────┴──────────────────────────┘
```

### Implementation Options

#### Option A: HTTP-Only Cookie (Recommended)

**Advantages:**

- XSS proof (JavaScript cannot access)
- Simple implementation
- Standard approach

**Database table:**

```sql
CREATE TABLE sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(user_id),
    INDEX(expires_at)
);
```

#### Option B: Refresh Token in Database

**Advantages:**

- Works with stateless APIs
- Mobile-friendly
- Better for microservices

**Database table:**

```sql
CREATE TABLE refresh_tokens (
    token VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(user_id),
    INDEX(expires_at)
);
```

### Required API Responses

#### `/api/init` - Session Valid

```json
{
  "authenticated": true,
  "user": {
    "id": 123,
    "google_id": "google-id-123",
    "email": "user@example.com",
    "display_name": "John Doe",
    "photo_url": "https://...",
    "status": "active",
    "created_at": "2023-01-01T00:00:00Z",
    "last_login": "2025-12-30T10:00:00Z",
    "notifications": [],
    "notifications_count": 0
  }
}
```

#### `/api/init` - Session Invalid

```json
{
  "authenticated": false,
  "user": null
}
```

### CORS Configuration

If using cookies, backend must allow credentials:

```php
header('Access-Control-Allow-Origin: http://localhost:4200'); // Dev
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
```

**Production:**

```php
header('Access-Control-Allow-Origin: https://suiviseries.com');
header('Access-Control-Allow-Credentials: true');
```

### Testing the Implementation

**Test 1: Fresh login**

```bash
curl -X POST http://localhost:8888/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"credential": "google-token"}' \
  -c cookies.txt
```

**Test 2: Session verification (with expired JWT)**

```bash
curl -X GET http://localhost:8888/api/init \
  -H "Authorization: Bearer expired-jwt-token" \
  -b cookies.txt
```

Expected: `{"authenticated": true, "user": {...}}`

**Test 3: After 30 days (session expired)**

```bash
# Delete or expire the session in DB
curl -X GET http://localhost:8888/api/init \
  -H "Authorization: Bearer any-token" \
  -b cookies.txt
```

Expected: `{"authenticated": false, "user": null}`

### Security Checklist

- [ ] Session cookies have `httponly` flag
- [ ] Session cookies have `secure` flag (HTTPS)
- [ ] Session cookies have `samesite=Strict`
- [ ] Server validates session on every `/api/init` call
- [ ] Old sessions are cleaned up (cron job)
- [ ] JWT secret is strong and environment-specific
- [ ] Session IDs are cryptographically random
- [ ] Session expiration is configurable
- [ ] Logout invalidates server session

### Migration Guide

**Step 1:** Add session storage (database table or cache)

**Step 2:** Update `/auth/login` to create server sessions

**Step 3:** Modify `/api/init` to validate server sessions, not just JWT

**Step 4:** Test with frontend (user should stay logged in after JWT expires)

**Step 5:** Add session cleanup cron job

---

**⚠️ Without these changes, persistent authentication will NOT work and users will be disconnected every hour.**

## Security Considerations

### Token Expiration Strategy

- **Frontend JWT**: Short expiration (e.g., 1 hour) for security
- **Backend Session**: Longer expiration (e.g., 30 days) for convenience
- **Validation**: Always verify with backend before critical operations

### Storage Security

- **localStorage**: Used instead of sessionStorage for persistence
- **HTTPS**: All API calls must use HTTPS in production
- **XSS Protection**: Content Security Policy headers required
- **Token Rotation**: Backend should rotate tokens periodically

### Logout Behavior

The logout process clears all authentication data:

1. Clears localStorage items
2. Clears authentication cookies
3. Calls backend `/api/logout` endpoint
4. Disables Google auto-select

## Configuration

To adjust session persistence behavior:

### Change Keep-Alive Interval

```typescript
// keep-alive.service.ts
private readonly KEEP_ALIVE_INTERVAL = 30 * 60 * 1000; // 30 minutes
```

### Modify Storage Keys

```typescript
// auth.service.ts
private readonly storageKey = 'suiviseries_auth_token';
private readonly userStorageKey = 'suiviseries_user_data';
```

## Testing

The authentication service includes comprehensive tests covering:

- Initial state validation
- Token storage and retrieval
- Session refresh scenarios
- Expired token handling
- Logout behavior
- Storage persistence

Run tests with:

```bash
npm test
```

## User Experience

From the user's perspective:

1. **First Login**: User authenticates with Google OAuth
2. **Session Stored**: Token and user data saved in localStorage
3. **Close Browser**: User closes the browser/tab
4. **Return Later**: User opens the app after hours/days
5. **Auto-Login**: User is automatically authenticated
6. **Background Refresh**: Session renewed every hour automatically
7. **Extended Use**: User can stay logged in for days/weeks

## Troubleshooting

### User Gets Logged Out Unexpectedly

Possible causes:

- Backend session expired (server-side timeout)
- localStorage was cleared (browser privacy settings)
- Network error prevented keep-alive refresh
- Backend returned invalid session response

### Session Not Persisting

Check:

- localStorage is enabled in browser
- Browser not in incognito/private mode
- No browser extensions clearing storage
- Backend `/api/init` returns valid responses

## Future Enhancements

Potential improvements to consider:

1. **Refresh Token Rotation**: Implement automatic token refresh
2. **Multiple Device Support**: Sync sessions across devices
3. **Session Invalidation**: Allow users to view/revoke active sessions
4. **Offline Mode**: Cache data for offline access
5. **Biometric Authentication**: Add fingerprint/face ID support
