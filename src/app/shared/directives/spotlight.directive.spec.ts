import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'vitest';

import { SpotlightDirective } from './spotlight.directive';

@Component({
    imports: [SpotlightDirective],
    template: '<div appSpotlight class="host"></div>',
})
class HostComponent {}

describe('SpotlightDirective', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HTMLElement;

    const movePointer = (pointerType: string) => {
        host.dispatchEvent(
            new PointerEvent('pointermove', {
                pointerType,
                clientX: 50,
                clientY: 60,
                bubbles: true,
            }),
        );
        fixture.detectChanges();
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });

        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        host = fixture.nativeElement.querySelector('.host');

        // jsdom reports a zero-sized box, so the geometry is stubbed to keep the
        // percentage maths meaningful.
        host.getBoundingClientRect = () =>
            ({ left: 0, top: 0, width: 200, height: 300 }) as DOMRect;
    });

    it('should publish the pointer position as percentages', () => {
        movePointer('mouse');

        expect(host.style.getPropertyValue('--spot-x')).toBe('25%');
        expect(host.style.getPropertyValue('--spot-y')).toBe('20%');
    });

    it('should ignore touch input, which would leave the highlight stuck after a tap', () => {
        movePointer('touch');

        expect(host.style.getPropertyValue('--spot-x')).toBe('');
        expect(host.style.getPropertyValue('--spot-y')).toBe('');
    });

    it('should ignore pen input for the same reason', () => {
        movePointer('pen');

        expect(host.style.getPropertyValue('--spot-x')).toBe('');
    });
});
