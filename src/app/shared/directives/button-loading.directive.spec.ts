import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { MatIconModule } from '@angular/material/icon';

import { ButtonLoadingDirective } from './button-loading.directive';

@Component({
    imports: [ButtonLoadingDirective, MatIconModule],
    template: `
        <button class="with-icon" [appButtonLoading]="loading()" [disabled]="disabled()">
            <mat-icon>save</mat-icon>
            Save
        </button>
        <button class="text-only" [appButtonLoading]="loading()">Save</button>
    `,
})
class HostComponent {
    readonly loading = signal(false);
    readonly disabled = signal(false);
}

describe('ButtonLoadingDirective', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    const button = (selector: string): HTMLButtonElement =>
        fixture.nativeElement.querySelector(selector);

    const setLoading = (value: boolean) => {
        host.loading.set(value);
        fixture.detectChanges();
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });

        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should leave the button untouched while idle', () => {
        expect(button('.with-icon').disabled).toBe(false);
        expect(button('.with-icon').classList.contains('button-loading')).toBe(false);
        expect(button('.with-icon').querySelector('mat-progress-spinner')).toBeNull();
    });

    it('should disable the button and swap the icon for a spinner while loading', () => {
        setLoading(true);

        const target = button('.with-icon');
        expect(target.disabled).toBe(true);
        expect(target.classList.contains('button-loading')).toBe(true);
        expect(target.querySelector('mat-progress-spinner')).toBeTruthy();
        expect(target.querySelector<HTMLElement>('mat-icon')?.style.display).toBe('none');
    });

    it('should restore the button once loading ends', () => {
        setLoading(true);
        setLoading(false);

        const target = button('.with-icon');
        expect(target.disabled).toBe(false);
        expect(target.classList.contains('button-loading')).toBe(false);
        expect(target.querySelector('mat-progress-spinner')).toBeNull();
        expect(target.querySelector<HTMLElement>('mat-icon')?.style.display).toBe('');
    });

    it('should keep a button disabled that was disabled before loading started', () => {
        host.disabled.set(true);
        fixture.detectChanges();

        setLoading(true);
        setLoading(false);

        expect(button('.with-icon').disabled).toBe(true);
    });

    it('should only disable a button that has no icon to replace', () => {
        setLoading(true);

        const target = button('.text-only');
        expect(target.disabled).toBe(true);
        expect(target.querySelector('mat-progress-spinner')).toBeNull();
    });

    it('should drop the spinner when the host is destroyed mid-load', () => {
        setLoading(true);

        expect(() => fixture.destroy()).not.toThrow();
    });
});
