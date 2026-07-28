import { Directive, ElementRef, inject } from '@angular/core';

// Publishes the pointer position inside the host as CSS custom properties so a
// radial highlight can follow the cursor. Styles consuming --spot-x / --spot-y
// must sit behind a (hover: hover) guard: a touch pointer fires this once on
// tap and would otherwise leave a highlight stuck where the finger landed.
@Directive({
    selector: '[appSpotlight]',
    host: {
        '(pointermove)': 'onPointerMove($event)',
    },
})
export class SpotlightDirective {
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

    protected onPointerMove(event: PointerEvent): void {
        if (event.pointerType !== 'mouse') {
            return;
        }

        const element = this.host.nativeElement;
        const rect = element.getBoundingClientRect();

        element.style.setProperty(
            '--spot-x',
            `${((event.clientX - rect.left) / rect.width) * 100}%`,
        );
        element.style.setProperty(
            '--spot-y',
            `${((event.clientY - rect.top) / rect.height) * 100}%`,
        );
    }
}
