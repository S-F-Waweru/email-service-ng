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
  template: `
    <app-page-header title="Sites" description="Websites that can submit contact forms, their API keys and mail settings." />
    <app-coming-soon icon="lucideGlobe" text="Create and edit sites, reveal or rotate API keys, per-site SMTP." />
  `,
})
export class AdminSitesPage {}
