import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';

import { TranslocoModule } from '@jsverse/transloco';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AuthService } from './services/auth.service';
import { LoginComponent } from './login/login.component';

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
    MatDialogModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly menuOpen = signal(false);

  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);
  private readonly dialog: MatDialog = inject(MatDialog);

  protected readonly currentUser = computed(() => this.authService.currentUser());

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
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
}
