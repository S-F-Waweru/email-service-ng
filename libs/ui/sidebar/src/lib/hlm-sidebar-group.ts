import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
  selector: '[hlmSidebarGroup],hlm-sidebar-group',
  exportAs: 'hlmSidebarGroup',
  host: {
    'data-slot': 'sidebar-group',
    'data-sidebar': 'group',
  },
})
export class HlmSidebarGroup {
  constructor() {
    classes(() => 'px-2 py-1 relative flex w-full min-w-0 flex-col');
  }
}
