import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { Router } from '@angular/router';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class PushNotificationService {
    private readonly http = inject(HttpClient);
    private readonly swPush = inject(SwPush);
    private readonly router = inject(Router);

    readonly permission = signal<NotificationPermission>('default');
    readonly isSubscribed = signal(false);
    readonly isSupported = signal(false);

    constructor() {
        this.isSupported.set(this.swPush.isEnabled);
        this.updatePermissionState();
        this.checkExistingSubscription();
        this.setupPushListeners();
    }

    private setupPushListeners(): void {
        if (!this.swPush.isEnabled) {
            return;
        }

        this.swPush.notificationClicks.subscribe({
            next: (event) => {
                const data = event.notification.data;

                if (data?.url) {
                    this.router.navigateByUrl(data.url);
                }

                if (data?.notification_id) {
                    this.http.put(
                        `${environment.apiUrl}/notifications/${data.notification_id}/read`,
                        {},
                        { withCredentials: true }
                    ).subscribe({
                        error: (err) => console.error('Error marking notification as read:', err)
                    });
                }
            },
            error: (err) => console.error('Error handling notification click:', err)
        });

        this.swPush.messages.subscribe({
            error: (err) => console.error('Error receiving push message:', err)
        });
    }

    private updatePermissionState(): void {
        if (this.isSupported()) {
            this.permission.set(Notification.permission);
        }
    }

    private checkExistingSubscription(): void {
        if (!this.swPush.isEnabled) {
            return;
        }

        this.swPush.subscription.subscribe({
            next: (subscription) => {
                this.isSubscribed.set(!!subscription);
            },
            error: (err) => console.error('Error checking push subscription:', err)
        });
    }

    subscribeToPush(): Observable<PushSubscriptionData> {
        if (!this.swPush.isEnabled) {
            return throwError(() => new Error('Push notifications are not supported'));
        }

        return from(
            this.swPush.requestSubscription({
                serverPublicKey: environment.vapidPublicKey
            })
        ).pipe(
            switchMap((subscription: PushSubscription) => {
                this.isSubscribed.set(true);
                this.updatePermissionState();
                const subscriptionData = this.formatSubscription(subscription);
                return this.sendSubscriptionToServer(subscriptionData);
            }),
            catchError(error => {
                console.error('Error subscribing to push notifications:', error);
                this.updatePermissionState();
                return throwError(() => error);
            })
        );
    }

    private formatSubscription(subscription: PushSubscription): PushSubscriptionData {
        const keys = subscription.toJSON().keys;

        if (!keys?.['p256dh'] || !keys?.['auth']) {
            throw new Error('Invalid subscription keys');
        }

        return {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: keys['p256dh'],
                auth: keys['auth']
            }
        };
    }

    private sendSubscriptionToServer(subscription: PushSubscriptionData): Observable<PushSubscriptionData> {
        return this.http.post<PushSubscriptionData>(
            `${environment.apiUrl}/push/subscribe`,
            subscription
        );
    }

    unsubscribeFromPush(): Observable<void> {
        if (!this.swPush.isEnabled) {
            return throwError(() => new Error('Push notifications are not supported'));
        }

        return from(this.swPush.subscription.pipe(
            switchMap((subscription) => {
                if (!subscription) {
                    return throwError(() => new Error('No subscription found'));
                }

                const endpoint = subscription.endpoint;

                return from(subscription.unsubscribe()).pipe(
                    switchMap(() => {
                        this.isSubscribed.set(false);
                        return this.deleteSubscriptionFromServer(endpoint);
                    })
                );
            })
        )).pipe(
            catchError(error => {
                console.error('Error unsubscribing from push notifications:', error);
                return throwError(() => error);
            })
        );
    }

    private deleteSubscriptionFromServer(endpoint: string): Observable<void> {
        return this.http.post<void>(
            `${environment.apiUrl}/push/unsubscribe`,
            { endpoint },
            { withCredentials: true }
        );
    }

    async showNotification(title: string, options?: NotificationOptions): Promise<void> {
        if (!this.swPush.isEnabled) {
            throw new Error('Notifications are not supported');
        }

        if (this.permission() !== 'granted') {
            throw new Error('Notification permission not granted');
        }

        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            ...options
        });
    }

}
