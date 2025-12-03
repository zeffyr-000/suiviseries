import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { PushNotificationService } from '../../services/push-notification.service';

@Component({
  selector: 'app-push-notification-prompt',
  imports: [CommonModule, MatButtonModule, MatIconModule, TranslocoModule],
  templateUrl: './push-notification-prompt.component.html',
  styleUrl: './push-notification-prompt.component.scss'
})
export class PushNotificationPromptComponent {
  private readonly pushService = inject(PushNotificationService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  private readonly dismissed = signal(false);
  readonly isLoading = signal(false);

  readonly shouldShowPrompt = computed(() => {
    return (
      !this.dismissed() &&
      this.pushService.isSupported() &&
      this.pushService.permission() === 'default' &&
      !this.pushService.isSubscribed()
    );
  });

  readonly isBlocked = computed(() => this.pushService.permission() === 'denied');

  dismiss(): void {
    this.dismissed.set(true);
    localStorage.setItem('push-notification-dismissed', Date.now().toString());
  }

  async enableNotifications(): Promise<void> {
    this.isLoading.set(true);

    try {
      await firstValueFrom(this.pushService.subscribeToPush());

      this.snackBar.open(
        this.transloco.translate('push_notifications.enabled_success'),
        this.transloco.translate('notifications.close'),
        { duration: 3000 }
      );

      this.dismissed.set(true);
    } catch (error) {
      console.error('Error enabling push notifications:', error);

      let message = this.transloco.translate('push_notifications.error_generic');

      if (error instanceof Error) {
        if (error.message.includes('denied')) {
          message = this.transloco.translate('push_notifications.error_denied');
        } else if (error.message.includes('not supported')) {
          message = this.transloco.translate('push_notifications.error_not_supported');
        } else if (error.message.includes('dialog closed') || error.message.includes('not granted')) {
          message = this.transloco.translate('push_notifications.error_dialog_closed');
        } else if (error.message.includes('Service Worker')) {
          message = this.transloco.translate('push_notifications.error_service_worker');
        }
      }

      this.snackBar.open(message, this.transloco.translate('notifications.close'), {
        duration: 5000
      });
    } finally {
      this.isLoading.set(false);
    }
  }
}
