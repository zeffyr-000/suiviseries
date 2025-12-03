import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { UserNotificationService } from '../services/user-notification.service';
import { Notification } from '../models/notification.model';
import { createSlug, formatRelativeDate } from '../utils/url.utils';
import { getNotificationTranslationKey } from '../utils/notification.utils';

@Component({
    selector: 'app-notifications-drawer',
    imports: [
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatRippleModule,
        MatBadgeModule,
        TranslocoModule
    ],
    templateUrl: './notifications-drawer.component.html',
    styleUrl: './notifications-drawer.component.scss'
})
export class NotificationsDrawerComponent {
    public readonly userNotificationService = inject(UserNotificationService);
    private readonly router = inject(Router);
    private readonly transloco = inject(TranslocoService);

    drawerOpen = signal(false);

    toggleDrawer(): void {
        this.drawerOpen.set(!this.drawerOpen());
    }

    closeDrawer(): void {
        this.drawerOpen.set(false);
    }

    getNotificationMessage(notification: Notification): string {
        const key = getNotificationTranslationKey(notification.type);
        return this.transloco.translate(key, notification.variables);
    }

    getFormattedDate(dateString: string): string {
        return formatRelativeDate(dateString, (key: string, params?: Record<string, number>) =>
            this.transloco.translate(key, params)
        );
    }

    onNotificationClick(notification: Notification): void {
        if (notification.status === 'unread') {
            this.userNotificationService.markAsRead(notification.user_notification_id);
        }
        const slug = createSlug(notification.serie_name);
        this.router.navigate(['/serie', notification.serie_id, slug]);
    }

    onDeleteClick(event: Event, notification: Notification): void {
        event.stopPropagation();
        this.userNotificationService.delete(notification.user_notification_id);
    }
}
