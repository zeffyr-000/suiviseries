import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { UserNotificationService } from '../services/user-notification.service';
import { Notification } from '../models/notification.model';
import { createSlug, formatRelativeDate } from '../utils/url.utils';
import { getNotificationTranslationKey } from '../utils/notification.utils';

@Component({
    selector: 'app-notifications-menu',
    imports: [
        MatButtonModule,
        MatIconModule,
        MatBadgeModule,
        MatMenuModule,
        MatTooltipModule,
        MatRippleModule,
        TranslocoModule
    ],
    host: {
        'class': 'notifications-menu-host'
    },
    templateUrl: './notifications-menu.component.html',
    styleUrl: './notifications-menu.component.scss'
})
export class NotificationsMenuComponent {
    public readonly userNotificationService = inject(UserNotificationService);
    private readonly router = inject(Router);
    private readonly transloco = inject(TranslocoService);

    protected readonly displayedUnreadCount = computed(() => {
        return this.userNotificationService.unreadCount();
    });

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
