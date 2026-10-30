// Maps a failed push subscription to the translation key shown to the user.
// The browser and PushNotificationService only describe failures through the
// error message, so matching on its text is the only signal available.
export function getPushErrorKey(error: unknown): string {
    if (!(error instanceof Error)) {
        return 'push_notifications.error_generic';
    }

    const message = error.message;

    if (message.includes('denied')) {
        return 'push_notifications.error_denied';
    }
    if (message.includes('not supported')) {
        return 'push_notifications.error_not_supported';
    }
    if (message.includes('dialog closed') || message.includes('not granted')) {
        return 'push_notifications.error_dialog_closed';
    }
    if (message.includes('Service Worker')) {
        return 'push_notifications.error_service_worker';
    }

    return 'push_notifications.error_generic';
}
