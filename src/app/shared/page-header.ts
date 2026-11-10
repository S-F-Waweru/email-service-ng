import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Page title row. Put action buttons inside: <app-page-header title="…"><button hlmBtn>…</button></app-page-header> */
@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mb-6 flex flex-wrap items-end justify-between gap-4' },
  templateUrl: './page-header.html',
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly description = input<string>();
}
