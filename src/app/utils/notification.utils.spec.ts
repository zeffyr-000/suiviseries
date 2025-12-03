import { describe, it, expect } from 'vitest';
import { getNotificationTranslationKey } from './notification.utils';
import { NotificationType } from '../models/notification.model';

describe('notification.utils', () => {
    describe('getNotificationTranslationKey', () => {
        it('should return correct key for new_season', () => {
            expect(getNotificationTranslationKey('new_season')).toBe('notification.new_season');
        });

        it('should return correct key for new_episodes', () => {
            expect(getNotificationTranslationKey('new_episodes')).toBe('notification.new_episodes');
        });

        it('should return correct key for status_canceled', () => {
            expect(getNotificationTranslationKey('status_canceled')).toBe('notification.status_canceled');
        });

        it('should return correct key for status_ended', () => {
            expect(getNotificationTranslationKey('status_ended')).toBe('notification.status_ended');
        });

        it('should return empty string for unknown type', () => {
            expect(getNotificationTranslationKey('unknown' as NotificationType)).toBe('');
        });
    });
});
