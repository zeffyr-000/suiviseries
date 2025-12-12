import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notification } from '../models/notification.model';

@Injectable({
    providedIn: 'root'
})
export class UserNotificationService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    private readonly _notifications = signal<Notification[]>([]);
    private readonly _unreadCount = signal<number>(0);

    public readonly notifications = this._notifications.asReadonly();
    public readonly unreadCount = this._unreadCount.asReadonly();

    setNotifications(notifications: Notification[], unreadCount?: number): void {
        this._notifications.set(notifications || []);
        if (unreadCount === undefined) {
            this._unreadCount.set(notifications?.filter(n => n.status === 'unread').length || 0);
        } else {
            this._unreadCount.set(unreadCount);
        }
    }

    async markAsRead(userNotificationId: number): Promise<void> {
        const notification = this._notifications().find(n => n.user_notification_id === userNotificationId);

        // Already read, nothing to do
        if (!notification || notification.status === 'read') {
            return;
        }

        // Update UI optimistically
        this._notifications.update(notifications =>
            notifications.map(n =>
                n.user_notification_id === userNotificationId
                    ? { ...n, status: 'read', read_at: new Date().toISOString() }
                    : n
            )
        );
        this._unreadCount.update(count => Math.max(0, count - 1));

        try {
            await firstValueFrom(
                this.http.put<{ success: boolean; message: string }>(
                    `${this.apiUrl}/notifications/${userNotificationId}`,
                    { status: 'read' },
                    { withCredentials: true }
                )
            );
        } catch (error) {
            console.error('Failed to mark notification as read', error);

            // Rollback on error
            this._notifications.update(notifications =>
                notifications.map(n =>
                    n.user_notification_id === userNotificationId
                        ? { ...n, status: 'unread', read_at: null }
                        : n
                )
            );
            this._unreadCount.update(count => count + 1);
        }
    }

    async delete(userNotificationId: number): Promise<void> {
        try {
            await firstValueFrom(
                this.http.delete<{ success: boolean; message: string }>(
                    `${this.apiUrl}/notifications/${userNotificationId}`,
                    { withCredentials: true }
                )
            );

            const deletedNotification = this._notifications().find(n => n.user_notification_id === userNotificationId);

            this._notifications.update(notifications =>
                notifications.filter(n => n.user_notification_id !== userNotificationId)
            );

            if (deletedNotification?.status === 'unread') {
                this._unreadCount.update(count => Math.max(0, count - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification', error);
        }
    }

    getTmdbPosterUrl(posterPath: string, size: 'w200' | 'w500' = 'w200'): string {
        if (!posterPath) return '';
        return `https://image.tmdb.org/t/p/${size}${posterPath}`;
    }
}
