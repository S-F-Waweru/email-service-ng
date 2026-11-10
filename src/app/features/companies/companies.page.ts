import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideBuilding2 } from '@ng-icons/lucide';
import { ComingSoon } from '../../shared/coming-soon';
import { PageHeader } from '../../shared/page-header';

@Component({
  selector: 'app-companies-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, ComingSoon],
  providers: [provideIcons({ lucideBuilding2 })],
  template: `
    <app-page-header title="Companies" description="Where each company's contact emails go, and who is CC'd." />
    <app-coming-soon icon="lucideBuilding2" text="Recipient and CC list editor for each of your companies." />
  `,
})
export class CompaniesPage {}
