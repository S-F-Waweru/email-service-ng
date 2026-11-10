import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';

/** Placeholder body for pages not built yet. */
@Component({
  selector: 'app-coming-soon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, HlmEmptyImports],
  template: `
    <div hlmEmpty class="rounded-lg border border-dashed">
      <div hlmEmptyHeader>
        <div hlmEmptyMedia variant="icon"><ng-icon [name]="icon()" /></div>
        <div hlmEmptyTitle>{{ heading() }}</div>
        <div hlmEmptyDescription>{{ text() }}</div>
      </div>
    </div>
  `,
})
export class ComingSoon {
  readonly icon = input.required<string>();
  readonly heading = input('Coming next');
  readonly text = input.required<string>();
}
