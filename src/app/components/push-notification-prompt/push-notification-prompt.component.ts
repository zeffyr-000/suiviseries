import { Component, computed, signal, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { PushNotificationService } from '../../services/push-notification.service';
import { NotificationService } from '../../services/notification.service';
import { getPushErrorKey } from '../../utils/push-error.utils';

export const PUSH_PROMPT_DISMISSED_KEY = 'push-notification-dismissed';

// "Not now" means later, not never: the prompt stays away for this long, then
// asks once more. Notifications can be turned on from the user menu meanwhile.
export const PUSH_PROMPT_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

function wasDismissedRecently(): boolean {
    const stored = Number(localStorage.getItem(PUSH_PROMPT_DISMISSED_KEY));
    return stored > 0 && Date.now() - stored < PUSH_PROMPT_COOLDOWN_MS;
}

@Component({
    selector: 'app-push-notification-prompt',
    imports: [MatButtonModule, MatIconModule, TranslocoModule],
    templateUrl: './push-notification-prompt.component.html',
    styleUrl: './push-notification-prompt.component.scss',
})
export class PushNotificationPromptComponent {
    private readonly pushService = inject(PushNotificationService);
    private readonly notificationService = inject(NotificationService);

    // Seeded from storage: the dismissal used to be written but never read
    // back, so the prompt returned on every visit.
    private readonly dismissed = signal(wasDismissedRecently());
    readonly isLoading = signal(false);

    // Only a browser that has not yet been asked gets the prompt. A denied
    // permission cannot be lifted from the page, so offering it would be noise.
    readonly shouldShowPrompt = computed(() => {
        return (
            !this.dismissed() &&
            this.pushService.isSupported() &&
            this.pushService.permission() === 'default' &&
            !this.pushService.isSubscribed()
        );
    });

    dismiss(): void {
        this.dismissed.set(true);
        localStorage.setItem(PUSH_PROMPT_DISMISSED_KEY, Date.now().toString());
    }

    async enableNotifications(): Promise<void> {
        this.isLoading.set(true);

        try {
            await firstValueFrom(this.pushService.subscribeToPush());
            this.notificationService.success('push_notifications.enabled_success');
            this.dismissed.set(true);
        } catch (error) {
            console.error('Error enabling push notifications:', error);
            this.notificationService.error(getPushErrorKey(error));
        } finally {
            this.isLoading.set(false);
        }
    }
}
