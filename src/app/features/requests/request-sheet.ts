import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { RequestReadingPane } from './request-reading-pane';
import { RequestsStore } from './requests.store';

/** Small screens: the reading pane in a sheet over the list. */
@Component({
  selector: 'app-request-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmSheetImports, RequestReadingPane],
  template: `
    <hlm-sheet side="right" [state]="store.selected() ? 'open' : 'closed'" (stateChanged)="onState($event)">
      <hlm-sheet-content *hlmSheetPortal="let ctx" class="w-full overflow-y-auto p-4 pt-12 data-[side=right]:sm:max-w-lg">
        <h2 hlmSheetTitle class="sr-only">Request</h2>
        <app-request-reading-pane [showClose]="false" />
      </hlm-sheet-content>
    </hlm-sheet>
  `,
})
export class RequestSheet {
  protected readonly store = inject(RequestsStore);

  protected onState(state: string): void {
    if (state === 'closed') this.store.close();
  }
}
