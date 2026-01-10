import { signal } from '@angular/core';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { createMockUser } from './user.mock';
import { createMockSerie, createMockSerieStats } from './serie.mock';

// Interface for AuthService mock
interface MockAuthService {
    isAuthenticated: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof signal<ReturnType<typeof createMockUser> | null>>;
    loading: ReturnType<typeof signal<boolean>>;
    initialized: ReturnType<typeof signal<boolean>>;
    userDisplayName: ReturnType<typeof vi.fn>;
    userPhotoUrl: ReturnType<typeof vi.fn>;
    isUserAuthenticated: ReturnType<typeof vi.fn>;
    getStoredToken: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
}

// Mock AuthService factory
export function createMockAuthService(overrides: Partial<MockAuthService> = {}): MockAuthService {
    return {
        isAuthenticated: vi.fn().mockReturnValue(false),
        currentUser: signal(null),
        loading: signal(false),
        initialized: signal(true),
        userDisplayName: vi.fn().mockReturnValue('Test User'),
        userPhotoUrl: vi.fn().mockReturnValue(''),
        isUserAuthenticated: vi.fn().mockReturnValue(false),
        getStoredToken: vi.fn().mockReturnValue(null),
        logout: vi.fn().mockResolvedValue(undefined),
        ...overrides
    };
}

// Create an authenticated mock AuthService
export function createMockAuthenticatedAuthService() {
    const mockUser = createMockUser();
    return createMockAuthService({
        isAuthenticated: vi.fn().mockReturnValue(true),
        currentUser: signal(mockUser),
        isUserAuthenticated: vi.fn().mockReturnValue(true),
        userDisplayName: vi.fn().mockReturnValue(mockUser.display_name),
        userPhotoUrl: vi.fn().mockReturnValue(mockUser.photo_url)
    });
}

// Mock MetadataService factory
export function createMockMetadataService() {
    return {
        updatePageMetadata: vi.fn(),
        setOpenGraphData: vi.fn()
    };
}

// Interface for SeriesService mock
interface MockSeriesService {
    getSerieDetails: ReturnType<typeof vi.fn>;
    isSerieReallyFollowed: ReturnType<typeof vi.fn>;
    getPopularSeries: ReturnType<typeof vi.fn>;
    getTopRatedSeries: ReturnType<typeof vi.fn>;
    followSerie: ReturnType<typeof vi.fn>;
    unfollowSerie: ReturnType<typeof vi.fn>;
    markSerieAsWatched: ReturnType<typeof vi.fn>;
    unmarkSerieAsWatched: ReturnType<typeof vi.fn>;
    markSeasonAsWatched: ReturnType<typeof vi.fn>;
    unmarkSeasonAsWatched: ReturnType<typeof vi.fn>;
    markEpisodeAsWatched: ReturnType<typeof vi.fn>;
    unmarkEpisodeAsWatched: ReturnType<typeof vi.fn>;
}

// Mock SeriesService factory
export function createMockSeriesService(overrides: Partial<MockSeriesService> = {}): MockSeriesService {
    const mockSerie = createMockSerie();
    const mockStats = createMockSerieStats();

    return {
        getSerieDetails: vi.fn().mockReturnValue(of({
            success: true,
            serie: mockSerie,
            stats: mockStats
        })),
        isSerieReallyFollowed: vi.fn().mockReturnValue(of(false)),
        getPopularSeries: vi.fn().mockReturnValue(of([mockSerie])),
        getTopRatedSeries: vi.fn().mockReturnValue(of([mockSerie])),
        followSerie: vi.fn().mockReturnValue(of(true)),
        unfollowSerie: vi.fn().mockReturnValue(of(true)),
        markSerieAsWatched: vi.fn().mockReturnValue(of(true)),
        unmarkSerieAsWatched: vi.fn().mockReturnValue(of(true)),
        markSeasonAsWatched: vi.fn().mockReturnValue(of(true)),
        unmarkSeasonAsWatched: vi.fn().mockReturnValue(of(true)),
        markEpisodeAsWatched: vi.fn().mockReturnValue(of(true)),
        unmarkEpisodeAsWatched: vi.fn().mockReturnValue(of(true)),
        ...overrides
    };
}

// Interface for PushNotificationService mock
interface MockPushNotificationService {
    isSupported: ReturnType<typeof signal<boolean>>;
    permission: ReturnType<typeof signal<NotificationPermission>>;
    isSubscribed: ReturnType<typeof signal<boolean>>;
    subscribeToPush: ReturnType<typeof vi.fn>;
    unsubscribeFromPush: ReturnType<typeof vi.fn>;
}

// Mock PushNotificationService factory
export function createMockPushNotificationService(overrides: Partial<MockPushNotificationService> = {}): MockPushNotificationService {
    return {
        isSupported: signal(true),
        permission: signal<NotificationPermission>('default'),
        isSubscribed: signal(false),
        subscribeToPush: vi.fn().mockReturnValue(of(undefined)),
        unsubscribeFromPush: vi.fn().mockReturnValue(of(undefined)),
        ...overrides
    };
}

// Mock MatDialog factory
export function createMockMatDialog() {
    return {
        open: vi.fn().mockReturnValue({
            afterClosed: vi.fn().mockReturnValue(of(null))
        })
    };
}

// Mock MatSnackBar factory
export function createMockMatSnackBar() {
    return {
        open: vi.fn()
    };
}

// Mock Router factory
export function createMockRouter() {
    return {
        navigate: vi.fn().mockResolvedValue(true),
        navigateByUrl: vi.fn().mockResolvedValue(true)
    };
}
