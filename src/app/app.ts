import { ChangeDetectionStrategy, Component, signal, computed, inject, effect } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';

import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { AuthService } from './services/auth.service';
import { UserNotificationService } from './services/user-notification.service';
import { PushNotificationService } from './services/push-notification.service';
import { LoginComponent } from './login/login.component';
import { PushNotificationPromptComponent } from './components/push-notification-prompt/push-notification-prompt.component';
import { Notification } from './models/notification.model';
import { createSlug, formatRelativeDate } from './utils/url.utils';
import { getNotificationTranslationKey } from './utils/notification.utils';

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
    MatDialogModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSlideToggleModule,
    PushNotificationPromptComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly menuOpen = signal(false);
  protected readonly notificationsOpen = signal(false);
  protected readonly pushLoading = signal(false);

  private readonly authService: AuthService = inject(AuthService);
  protected readonly userNotificationService: UserNotificationService = inject(UserNotificationService);
  protected readonly pushService: PushNotificationService = inject(PushNotificationService);
  private readonly router: Router = inject(Router);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly transloco = inject(TranslocoService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly currentUser = computed(() => this.authService.currentUser());

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user?.notifications) {
        this.userNotificationService.setNotifications(user.notifications, user.notifications_count);
      }
    });
  }

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
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
      this.transloco.translate(key, params)
    );
  }

  onNotificationClick(notification: Notification): void {
    if (notification.status === 'unread') {
      this.userNotificationService.markAsRead(notification.user_notification_id);
    }
    this.notificationsOpen.set(false);
    const slug = createSlug(notification.serie_name);
    this.router.navigate(['/serie', notification.serie_id, slug]);
  }

  async onNotificationDelete(event: Event, notification: Notification): Promise<void> {
    event.stopPropagation();
    await this.userNotificationService.delete(notification.user_notification_id);
  }

  login(): void {
    this.dialog.open(LoginComponent, {
      width: '540px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true
    });
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/']);
  }

  async togglePushNotifications(): Promise<void> {
    const isCurrentlyEnabled = this.pushService.permission() === 'granted' && this.pushService.isSubscribed();
    const mockEvent = new Event('toggle');

    if (isCurrentlyEnabled) {
      await this.disablePushNotifications(mockEvent);
    } else {
      await this.enablePushNotifications(mockEvent);
    }
  }

  async enablePushNotifications(event: Event): Promise<void> {
    event.stopPropagation();
    this.pushLoading.set(true);

    try {
      await firstValueFrom(this.pushService.subscribeToPush());
      this.snackBar.open(
        this.transloco.translate('push_notifications.enabled_success'),
        this.transloco.translate('notifications.close'),
        { duration: 3000 }
      );

      await this.pushService.showNotification(
        this.transloco.translate('push_notifications.confirmation_enabled_title'),
        {
          body: this.transloco.translate('push_notifications.confirmation_enabled_body'),
          tag: 'push-confirmation-enabled'
        }
      );
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      let message = this.transloco.translate('push_notifications.error_generic');

      if (error instanceof Error) {
        if (error.message.includes('denied')) {
          message = this.transloco.translate('push_notifications.error_denied');
        } else if (error.message.includes('not supported')) {
          message = this.transloco.translate('push_notifications.error_not_supported');
        }
      }

      this.snackBar.open(message, this.transloco.translate('notifications.close'), {
        duration: 5000
      });
    } finally {
      this.pushLoading.set(false);
    }
  }

  async disablePushNotifications(event: Event): Promise<void> {
    event.stopPropagation();
    this.pushLoading.set(true);

    try {
      await firstValueFrom(this.pushService.unsubscribeFromPush());

      this.snackBar.open(
        this.transloco.translate('push_notifications.disabled_success'),
        this.transloco.translate('notifications.close'),
        { duration: 3000 }
      );
    } catch (error) {
      console.error('Error disabling push notifications:', error);
      this.snackBar.open(
        this.transloco.translate('push_notifications.error_generic'),
        this.transloco.translate('notifications.close'),
        { duration: 5000 }
      );
    } finally {
      this.pushLoading.set(false);
    }
  }
}
