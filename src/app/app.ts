import { Component, ElementRef, signal, computed, inject, effect, viewChild } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { RouterOutlet, Router, RouterModule } from '@angular/router';

import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { firstValueFrom } from 'rxjs';

import { AuthService } from './services/auth.service';
import { UserNotificationService } from './services/user-notification.service';
import { PushNotificationService } from './services/push-notification.service';
import { NotificationService } from './services/notification.service';
import { openLoginDialog } from './login/login.component';
import { PushNotificationPromptComponent } from './components/push-notification-prompt/push-notification-prompt.component';
import { AppFooterComponent } from './shared/app-footer/app-footer.component';
import { Notification } from './models/notification.model';
import { createSlug, formatRelativeDate } from './utils/url.utils';
import { getNotificationTranslationKey } from './utils/notification.utils';
import { getPushErrorKey } from './utils/push-error.utils';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        RouterModule,
        TranslocoModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
        MatListModule,
        MatMenuModule,
        MatDividerModule,
        MatBadgeModule,
        MatTooltipModule,
        MatSlideToggleModule,
        PushNotificationPromptComponent,
        AppFooterComponent,
    ],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    protected readonly menuOpen = signal(false);
    protected readonly notificationsOpen = signal(false);
    protected readonly pushLoading = signal(false);

    private readonly authService: AuthService = inject(AuthService);
    protected readonly userNotificationService: UserNotificationService =
        inject(UserNotificationService);
    protected readonly pushService: PushNotificationService = inject(PushNotificationService);
    private readonly router: Router = inject(Router);
    private readonly dialog: MatDialog = inject(MatDialog);
    private readonly transloco = inject(TranslocoService);
    private readonly notificationService = inject(NotificationService);

    protected readonly currentUser = computed(() => this.authService.currentUser());

    private readonly toolbar = viewChild(MatToolbar, { read: ElementRef<HTMLElement> });

    constructor() {
        // In-page anchors land below the sticky toolbar rather than under it
        inject(ViewportScroller).setOffset(() => [
            0,
            this.toolbar()?.nativeElement.offsetHeight ?? 0,
        ]);

        effect(() => {
            const user = this.currentUser();
            if (user?.notifications) {
                this.userNotificationService.setNotifications(
                    user.notifications,
                    user.notifications_count,
                );
            }
        });
    }

    toggleMenu() {
        this.menuOpen.set(!this.menuOpen());
    }

    protected closeMenu(): void {
        this.menuOpen.set(false);
    }

    toggleNotifications() {
        this.notificationsOpen.set(!this.notificationsOpen());
    }

    getNotificationMessage(notification: Notification): string {
        const key = getNotificationTranslationKey(notification.type);
        return this.transloco.translate(key, notification.variables);
    }

    getFormattedDate(dateString: string): string {
        return formatRelativeDate(dateString, (key: string, params?: Record<string, number>) =>
            this.transloco.translate(key, params),
        );
    }

    async onNotificationClick(notification: Notification): Promise<void> {
        // Always call markAsRead - service handles already read notifications
        await this.userNotificationService.markAsRead(notification.user_notification_id);
        this.notificationsOpen.set(false);
        const slug = createSlug(notification.serie_name);
        this.router.navigate(['/serie', notification.serie_id, slug]);
    }

    async onNotificationDelete(notification: Notification): Promise<void> {
        await this.userNotificationService.delete(notification.user_notification_id);
    }

    login(): void {
        openLoginDialog(this.dialog);
    }

    async logout(): Promise<void> {
        await this.authService.logout();
        this.router.navigate(['/']);
    }

    async togglePushNotifications(): Promise<void> {
        const isCurrentlyEnabled =
            this.pushService.permission() === 'granted' && this.pushService.isSubscribed();

        if (isCurrentlyEnabled) {
            await this.disablePushNotifications();
        } else {
            await this.enablePushNotifications();
        }
    }

    private async enablePushNotifications(): Promise<void> {
        this.pushLoading.set(true);

        try {
            await firstValueFrom(this.pushService.subscribeToPush());
            this.notificationService.success('push_notifications.enabled_success');

            await this.pushService.showNotification(
                this.transloco.translate('push_notifications.confirmation_enabled_title'),
                {
                    body: this.transloco.translate('push_notifications.confirmation_enabled_body'),
                    tag: 'push-confirmation-enabled',
                },
            );
        } catch (error) {
            console.error('Error enabling push notifications:', error);
            this.notificationService.error(getPushErrorKey(error));
        } finally {
            this.pushLoading.set(false);
        }
    }

    private async disablePushNotifications(): Promise<void> {
        this.pushLoading.set(true);

        try {
            await firstValueFrom(this.pushService.unsubscribeFromPush());
            this.notificationService.success('push_notifications.disabled_success');
        } catch (error) {
            console.error('Error disabling push notifications:', error);
            this.notificationService.error('push_notifications.error_generic');
        } finally {
            this.pushLoading.set(false);
        }
    }
}
