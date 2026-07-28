import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-footer',
    imports: [RouterModule, TranslocoModule],
    templateUrl: './app-footer.component.html',
    styleUrl: './app-footer.component.scss',
})
export class AppFooterComponent {
    protected readonly projectRepo = 'https://github.com/zeffyr-000/suiviseries';
}
