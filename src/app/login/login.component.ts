import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit, effect, Signal, inject, viewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { TranslocoModule } from '@jsverse/transloco';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login-modal',
    imports: [
        TranslocoModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatDialogModule
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, AfterViewInit {
    readonly googleButton = viewChild<ElementRef<HTMLDivElement>>('googleButton');

    loading: Signal<boolean>;

    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    public readonly dialogRef = inject(MatDialogRef<LoginComponent>);
    public readonly data = inject(MAT_DIALOG_DATA) as { returnUrl?: string };

    constructor() {
        this.loading = this.authService.loading;

        effect(() => {
            const user = this.authService.currentUser();
            if (user) {
                if (this.data?.returnUrl) {
                    this.router.navigate([this.data.returnUrl]);
                }
                this.dialogRef.close(user);
            }
        });
    }

    ngOnInit(): void {
        this.authService.initGoogleSignIn().catch((err) => console.error('Failed to initialize Google Sign-In:', err));
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            const buttonEl = this.googleButton();
            if (buttonEl?.nativeElement) {
                this.authService.renderGoogleButton(buttonEl.nativeElement);
            }
        }, 100);
    }

    signInWithGoogle(): void {
        this.authService.signInWithGooglePopup();
    }

    goHome(): void {
        this.dialogRef.close();
    }
}