import { describe, it, expect } from 'vitest';

import { getPushErrorKey } from './push-error.utils';

describe('getPushErrorKey', () => {
    it.each([
        { message: 'Permission denied', key: 'push_notifications.error_denied' },
        {
            message: 'Push notifications are not supported',
            key: 'push_notifications.error_not_supported',
        },
        { message: 'Permission dialog closed', key: 'push_notifications.error_dialog_closed' },
        {
            message: 'Notification permission not granted',
            key: 'push_notifications.error_dialog_closed',
        },
        {
            message: 'Service Worker not registered',
            key: 'push_notifications.error_service_worker',
        },
        { message: 'Something else', key: 'push_notifications.error_generic' },
    ])('should map "$message" to $key', ({ message, key }) => {
        expect(getPushErrorKey(new Error(message))).toBe(key);
    });

    it('should fall back to the generic key for non-Error values', () => {
        expect(getPushErrorKey('String error')).toBe('push_notifications.error_generic');
        expect(getPushErrorKey(undefined)).toBe('push_notifications.error_generic');
    });
});
