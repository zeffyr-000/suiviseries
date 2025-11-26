import { Directive, input, effect, inject, ElementRef, Renderer2, ViewContainerRef, ComponentRef, OnDestroy } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

// Directive to manage button loading states following Material Design 3
// 
// Usage:
// <button mat-raised-button [appButtonLoading]="isLoading()">
//   <mat-icon>save</mat-icon>
//   Save
// </button>
// 
// When loading is true: button disabled, spinner replaces icon, text remains visible
// Note: Only handles the first mat-icon found - buttons should contain a single icon
@Directive({
    selector: '[appButtonLoading]',
})
export class ButtonLoadingDirective implements OnDestroy {
    private readonly el = inject(ElementRef);
    private readonly renderer = inject(Renderer2);
    private readonly viewContainerRef = inject(ViewContainerRef);

    loading = input<boolean>(false, { alias: 'appButtonLoading' });

    private spinnerComponent: ComponentRef<MatProgressSpinner> | null = null;
    private iconElement: HTMLElement | null = null;
    private wasDisabled = false;

    constructor() {
        effect(() => {
            if (this.loading()) {
                this.showLoading();
            } else {
                this.hideLoading();
            }
        });
    }

    private showLoading(): void {
        const button = this.el.nativeElement as HTMLButtonElement;

        this.wasDisabled = button.disabled;
        this.renderer.setAttribute(button, 'disabled', 'true');
        this.renderer.addClass(button, 'button-loading');

        this.iconElement = button.querySelector('mat-icon');
        if (this.iconElement) {
            this.renderer.setStyle(this.iconElement, 'display', 'none');

            this.spinnerComponent = this.viewContainerRef.createComponent(MatProgressSpinner);
            this.spinnerComponent.instance.diameter = 20;

            const spinnerElement = this.spinnerComponent.location.nativeElement;
            this.renderer.setStyle(spinnerElement, 'display', 'inline-block');
            this.renderer.setStyle(spinnerElement, 'margin-right', '8px');
            this.renderer.insertBefore(button, spinnerElement, this.iconElement);
        }
    }

    private hideLoading(): void {
        const button = this.el.nativeElement as HTMLButtonElement;

        if (!this.wasDisabled) {
            this.renderer.removeAttribute(button, 'disabled');
        }
        this.renderer.removeClass(button, 'button-loading');

        if (this.spinnerComponent) {
            this.spinnerComponent.destroy();
            this.spinnerComponent = null;
        }

        if (this.iconElement) {
            this.renderer.removeStyle(this.iconElement, 'display');
            this.iconElement = null;
        }
    }

    ngOnDestroy(): void {
        if (this.spinnerComponent) {
            this.spinnerComponent.destroy();
            this.spinnerComponent = null;
        }
        // Don't manipulate styles in ngOnDestroy: element may already be detached from DOM
        // hideLoading() already cleans up styles during normal operation
        this.iconElement = null;
    }
}
