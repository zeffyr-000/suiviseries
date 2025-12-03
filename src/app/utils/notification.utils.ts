import { NotificationType } from '../models/notification.model';

// Get the translation key for a notification type
export function getNotificationTranslationKey(type: NotificationType): string {
    switch (type) {
        case 'new_season':
            return 'notification.new_season';
        case 'new_episodes':
            return 'notification.new_episodes';
        case 'status_canceled':
            return 'notification.status_canceled';
        case 'status_ended':
            return 'notification.status_ended';
        default:
            return '';
    }
}
