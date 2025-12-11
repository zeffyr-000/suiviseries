importScripts('./ngsw-worker.js');

globalThis.addEventListener('push', (event) => {
    if (!event.data) {
        return;
    }

    try {
        const data = event.data.json();

        const options = {
            body: data.body || '',
            icon: data.icon || '/icons/icon-192x192.png',
            badge: data.badge || '/icons/icon-72x72.png',
            tag: data.tag || 'suiviseries-notification',
            requireInteraction: data.requireInteraction || false,
            data: {
                url: data.url,
                notification_id: data.notification_id,
                serie_id: data.serie_id
            }
        };

        event.waitUntil(
            globalThis.registration.showNotification(data.title || 'Suivi Séries', options)
                .catch((err) => {
                    const title = data.title || 'Suivi Séries';
                    const notificationId = data.notification_id ? ` (ID: ${data.notification_id})` : '';
                    console.error(`[Custom SW] Error displaying notification "${title}"${notificationId}:`, err);
                })
        );
    } catch (error) {
        console.error('[Custom SW] Error processing push:', error);
    }
});

globalThis.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.notification.data?.url) {
        const url = event.notification.data.url;

        // Validate URL for security (must be a relative path starting with '/')
        const isValidUrl = url.startsWith('/');
        if (!isValidUrl) {
            console.error('[Custom SW] Invalid URL in notification data (must be relative path):', url);
            return;
        }

        event.waitUntil(
            Promise.all([
                // Focus or open the window
                clients.matchAll({ type: 'window', includeUncontrolled: true })
                    .then((windowClients) => {
                        // Normalize URL to absolute for exact matching
                        let targetUrl;
                        try {
                            targetUrl = new URL(url, globalThis.location.origin).href;
                        } catch (e) {
                            console.error('[Custom SW] Failed to normalize URL:', url, e);
                            return;
                        }

                        for (const client of windowClients) {
                            if (client.url === targetUrl && 'focus' in client) {
                                return client.focus();
                            }
                        }
                        if (clients.openWindow) {
                            return clients.openWindow(url);
                        }
                    }),
                // Mark notification as read (runs independently)
                event.notification.data.notification_id
                    ? fetch(`/api/notifications/${event.notification.data.notification_id}/read`, {
                        method: 'POST',
                        credentials: 'include'
                    }).then((response) => {
                        if (!response.ok) {
                            throw new Error(`Failed to mark notification as read. Status: ${response.status}`);
                        }
                    }).catch((err) => console.error('[Custom SW] Error marking notification as read:', err))
                    : Promise.resolve()
            ]).catch((err) => console.error('[Custom SW] Error handling click:', err))
        );
    }
});
