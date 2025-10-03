import { Component, Input, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { SerieStatus } from '../../models/serie.model';

@Component({
    selector: 'app-serie-status-chip',
    standalone: true,
    imports: [
        CommonModule,
        TranslocoModule,
        MatChipsModule,
        MatIconModule
    ],
    templateUrl: './serie-status-chip.component.html',
    styleUrl: './serie-status-chip.component.scss'
})
export class SerieStatusChipComponent {
    @Input() set status(value: SerieStatus) {
        this.statusSignal.set(value);
    }
    get status(): SerieStatus {
        return this.statusSignal();
    }

    @Input() set size(value: 'small' | 'medium' | 'large') {
        this.sizeSignal.set(value);
    }
    get size(): 'small' | 'medium' | 'large' {
        return this.sizeSignal();
    }

    @Input() showIcon = true;

    private readonly translocoService = inject(TranslocoService);
    private readonly statusSignal = signal<SerieStatus>(SerieStatus.PLANNED);
    private readonly sizeSignal = signal<'small' | 'medium' | 'large'>('small');

    // Computed properties for optimal performance
    protected readonly statusClass = computed(() => {
        const statusMap: Record<SerieStatus, string> = {
            [SerieStatus.RETURNING]: 'status-returning',
            [SerieStatus.ENDED]: 'status-ended',
            [SerieStatus.CANCELED]: 'status-canceled',
            [SerieStatus.IN_PRODUCTION]: 'status-production',
            [SerieStatus.PLANNED]: 'status-planned'
        };
        return `${statusMap[this.statusSignal()] || 'status-default'} size-${this.sizeSignal()}`;
    });

    protected readonly statusIcon = computed(() => {
        const iconMap: Record<SerieStatus, string> = {
            [SerieStatus.RETURNING]: 'refresh',
            [SerieStatus.ENDED]: 'check_circle',
            [SerieStatus.CANCELED]: 'cancel',
            [SerieStatus.IN_PRODUCTION]: 'work',
            [SerieStatus.PLANNED]: 'schedule'
        };
        return iconMap[this.statusSignal()] || 'info';
    });

    protected readonly translatedStatus = computed(() => {
        const statusMap: Record<SerieStatus, string> = {
            [SerieStatus.RETURNING]: 'status.returning_series',
            [SerieStatus.ENDED]: 'status.ended',
            [SerieStatus.CANCELED]: 'status.canceled',
            [SerieStatus.IN_PRODUCTION]: 'status.in_production',
            [SerieStatus.PLANNED]: 'status.planned'
        };
        return this.translocoService.translate(statusMap[this.statusSignal()]);
    });
}