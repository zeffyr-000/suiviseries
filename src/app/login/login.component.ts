import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, effect, Signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login-modal',
    standalone: true,
    imports: [
        CommonModule,
        TranslocoModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatDialogModule
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, AfterViewInit {
    @ViewChild('googleButton', { static: false }) googleButton!: ElementRef<HTMLDivElement>;

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
        this.authService.initGoogleSignIn().catch(error => {
            console.error('Failed to initialize Google Sign-In:', error);
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            if (this.googleButton?.nativeElement) {
                this.authService.renderGoogleButton(this.googleButton.nativeElement);
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