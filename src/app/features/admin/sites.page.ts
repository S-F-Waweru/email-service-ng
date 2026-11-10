import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideGlobe } from '@ng-icons/lucide';
import { ComingSoon } from '../../shared/coming-soon';
import { PageHeader } from '../../shared/page-header';

@Component({
  selector: 'app-admin-sites-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, ComingSoon],
  providers: [provideIcons({ lucideGlobe })],
  templateUrl: './sites.page.html',
})
export class AdminSitesPage {}
