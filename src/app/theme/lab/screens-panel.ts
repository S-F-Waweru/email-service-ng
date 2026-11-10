import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideInbox, lucideSearch, lucideSettings, lucideUsers } from '@ng-icons/lucide';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { BrandLogo } from '../brand-logo';
import { ThemeService } from '../theme.service';

/** A small realistic screen (sidebar, header, table, toasts) in the current theme. */
@Component({
  selector: 'app-screens-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, HlmBadge, HlmButton, HlmInput, BrandLogo],
  providers: [provideIcons({ lucideBell, lucideInbox, lucideSearch, lucideSettings, lucideUsers })],
  template: `
    <div class="bg-background text-foreground flex min-h-[28rem] overflow-hidden rounded-lg border">
      <!-- Sidebar -->
      <aside class="bg-sidebar text-sidebar-foreground border-sidebar-border hidden w-48 shrink-0 flex-col gap-1 border-e p-2 text-xs sm:flex">
        <app-brand-logo surface="sidebar" class="mb-3 h-6 px-2 pt-2" />
        <a class="bg-sidebar-accent text-sidebar-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 font-medium">
          <ng-icon name="lucideInbox" /> Requests
          <span class="bg-sidebar-primary text-sidebar-primary-foreground ms-auto rounded-full px-1.5 text-[10px]">3</span>
        </a>
        <a class="hover:bg-sidebar-accent flex items-center gap-2 rounded-md px-2 py-1.5"><ng-icon name="lucideUsers" /> Users</a>
        <a class="hover:bg-sidebar-accent flex items-center gap-2 rounded-md px-2 py-1.5"><ng-icon name="lucideSettings" /> Settings</a>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex h-12 items-center gap-2 border-b px-4 text-sm">
          <span class="text-muted-foreground">{{ theme.brand().shortName ?? 'Company' }}</span>
          <span class="text-muted-foreground/50">/</span>
          <span class="font-medium">Requests</span>
          <button hlmBtn variant="ghost" size="icon-sm" class="ms-auto" aria-label="Notifications"><ng-icon name="lucideBell" /></button>
        </header>

        <div class="grid gap-4 p-4">
          <div class="flex flex-wrap items-center gap-2">
            <input hlmInput class="h-8 w-56" placeholder="Search name or email" aria-label="Search (sample)" />
            <button hlmBtn size="sm" variant="secondary">Filters</button>
            <span class="ms-auto flex gap-2">
              <button hlmBtn size="sm" variant="outline" (click)="showToast('error')">Error toast</button>
              <button hlmBtn size="sm" (click)="showToast('success')">Success toast</button>
            </span>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            @for (stat of stats; track stat.label) {
              <div class="bg-card rounded-lg border p-3">
                <p class="text-muted-foreground text-xs">{{ stat.label }}</p>
                <p class="text-xl font-semibold" [class]="stat.class">{{ stat.value }}</p>
              </div>
            }
          </div>

          <div class="overflow-hidden rounded-lg border text-xs">
            @for (row of rows; track row.name) {
              <div class="hover:bg-muted/50 flex items-center gap-3 border-b px-3 py-2.5 last:border-b-0" [class.bg-muted]="row.selected">
                <span class="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full font-semibold">
                  {{ row.name.charAt(0) }}
                </span>
                <span class="grid min-w-0 flex-1">
                  <span class="truncate font-medium">{{ row.name }}</span>
                  <span class="text-muted-foreground truncate">{{ row.subject }}</span>
                </span>
                <span hlmBadge [class]="row.badge">{{ row.status }}</span>
                <span class="text-muted-foreground hidden w-16 text-end sm:block">{{ row.time }}</span>
              </div>
            }
          </div>

          <div class="bg-destructive/10 text-destructive rounded-md p-3 text-xs">
            Last attempt failed: 535 5.7.8 Username and Password not accepted
          </div>
          <p class="text-xs">
            Body text with a <a class="text-primary underline-offset-4 hover:underline" href="#" (click)="$event.preventDefault()">link in the primary colour</a>
            and <span class="text-muted-foreground">secondary text</span>.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class ScreensPanel {
  protected readonly theme = inject(ThemeService);

  protected readonly stats = [
    { label: 'Sent this week', value: '128', class: '' },
    { label: 'Retrying', value: '2', class: 'text-warning' },
    { label: 'Failed', value: '3', class: 'text-destructive' },
  ];

  protected readonly rows = [
    { name: 'Amina Wanjiru', subject: 'Pricing for monthly plan', status: 'Sent', badge: 'bg-success/15 text-success', time: '10:42', selected: true },
    { name: 'Brian Otieno', subject: 'Delivery to Mombasa', status: 'Retrying 2/5', badge: 'bg-warning/15 text-warning', time: '09:15', selected: false },
    { name: 'Cynthia Mwangi', subject: 'Call me back please', status: 'Failed', badge: 'bg-destructive/10 text-destructive', time: 'Yesterday', selected: false },
    { name: 'David Kiprotich', subject: 'Partnership enquiry', status: 'Queued', badge: 'bg-muted text-muted-foreground', time: 'Mon', selected: false },
  ];

  protected showToast(kind: 'success' | 'error'): void {
    if (kind === 'success') toast.success('Saved', { description: 'Your changes are live.' });
    else toast.error('Could not save', { description: 'Email must be an email.' });
  }
}
