import { Component, Input, inject } from '@angular/core';
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
    @Input() status!: SerieStatus;
    @Input() size: 'small' | 'medium' | 'large' = 'small';
    @Input() showIcon = true;

    private readonly translocoService = inject(TranslocoService);

    protected translateStatus(status: SerieStatus): string {
        const statusMap: Record<SerieStatus, string> = {
            [SerieStatus.RETURNING]: 'status.returning_series',
            [SerieStatus.ENDED]: 'status.ended',
            [SerieStatus.CANCELED]: 'status.canceled',
            [SerieStatus.IN_PRODUCTION]: 'status.in_production',
            [SerieStatus.PLANNED]: 'status.planned'
        };
        return this.translocoService.translate(statusMap[status]);
    }

    protected getStatusClass(): string {
        const statusMap: Record<SerieStatus, string> = {
            [SerieStatus.RETURNING]: 'status-returning',
            [SerieStatus.ENDED]: 'status-ended',
            [SerieStatus.CANCELED]: 'status-canceled',
            [SerieStatus.IN_PRODUCTION]: 'status-production',
            [SerieStatus.PLANNED]: 'status-planned'
        };
        return `${statusMap[this.status] || 'status-default'} size-${this.size}`;
    }

    protected getStatusIcon(): string {
        const iconMap: Record<SerieStatus, string> = {
            [SerieStatus.RETURNING]: 'refresh',
            [SerieStatus.ENDED]: 'check_circle',
            [SerieStatus.CANCELED]: 'cancel',
            [SerieStatus.IN_PRODUCTION]: 'work',
            [SerieStatus.PLANNED]: 'schedule'
        };
        return iconMap[this.status] || 'info';
    }
}