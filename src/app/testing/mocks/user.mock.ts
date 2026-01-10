import { User, UserStatus } from '../../models/user.model';

// Factory function to create a mock User with sensible defaults
export function createMockUser(overrides: Partial<User> = {}): User {
    return {
        id: 1,
        google_id: 'google-123',
        email: 'test@test.com',
        display_name: 'Test User',
        photo_url: 'https://example.com/photo.jpg',
        status: UserStatus.ACTIVE,
        created_at: '2023-01-01',
        last_login: '2023-01-01',
        ...overrides
    };
}

// Create a mock admin user
export function createMockAdminUser(overrides: Partial<User> = {}): User {
    return createMockUser({
        display_name: 'Admin User',
        email: 'admin@test.com',
        ...overrides
    });
}
