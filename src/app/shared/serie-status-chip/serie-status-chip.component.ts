import { ChangeDetectionStrategy, Component, input, inject, computed } from '@angular/core';

import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { SerieStatus } from '../../models/serie.model';

@Component({
    selector: 'app-serie-status-chip',
    imports: [
        TranslocoModule,
        MatChipsModule,
        MatIconModule
    ],
    templateUrl: './serie-status-chip.component.html',
    styleUrl: './serie-status-chip.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SerieStatusChipComponent {
    readonly status = input<SerieStatus>(SerieStatus.PLANNED);
    readonly size = input<'small' | 'medium' | 'large'>('small');
    readonly showIcon = input(true);

    private readonly translocoService = inject(TranslocoService);

    // Computed properties for optimal performance
    protected readonly statusClass = computed(() => {
        const statusMap: Record<SerieStatus, string> = {
            [SerieStatus.RETURNING]: 'status-returning',
            [SerieStatus.ENDED]: 'status-ended',
            [SerieStatus.CANCELED]: 'status-canceled',
            [SerieStatus.IN_PRODUCTION]: 'status-production',
            [SerieStatus.PLANNED]: 'status-planned'
        };
        return `${statusMap[this.status()] || 'status-default'} size-${this.size()}`;
    });

    protected readonly statusIcon = computed(() => {
        const iconMap: Record<SerieStatus, string> = {
            [SerieStatus.RETURNING]: 'refresh',
            [SerieStatus.ENDED]: 'check_circle',
            [SerieStatus.CANCELED]: 'cancel',
            [SerieStatus.IN_PRODUCTION]: 'work',
            [SerieStatus.PLANNED]: 'schedule'
        };
        return iconMap[this.status()] || 'info';
    });

    protected readonly translatedStatus = computed(() => {
        const statusMap: Record<SerieStatus, string> = {
            [SerieStatus.RETURNING]: 'status.returning_series',
            [SerieStatus.ENDED]: 'status.ended',
            [SerieStatus.CANCELED]: 'status.canceled',
            [SerieStatus.IN_PRODUCTION]: 'status.in_production',
            [SerieStatus.PLANNED]: 'status.planned'
        };
        return this.translocoService.translate(statusMap[this.status()]);
    });
}