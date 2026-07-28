import { Component, computed, input } from '@angular/core';

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export type StatRingAccent = 'gold' | 'ice' | 'flare';

@Component({
    selector: 'app-stat-ring',
    imports: [],
    templateUrl: './stat-ring.component.html',
    styleUrl: './stat-ring.component.scss',
})
export class StatRingComponent {
    // How full the arc is, from 0 to 1. Values outside the range are clamped
    // rather than rejected, because ratings and progress both come from data
    // the component does not control.
    readonly ratio = input.required<number>();
    readonly label = input.required<string>();
    readonly accent = input<StatRingAccent>('gold');
    // Announced to screen readers, which cannot read an arc.
    readonly description = input<string>('');

    protected readonly radius = RADIUS;
    protected readonly circumference = CIRCUMFERENCE;

    protected readonly offset = computed(() => {
        const clamped = Math.min(Math.max(this.ratio(), 0), 1);
        return CIRCUMFERENCE * (1 - clamped);
    });
}
