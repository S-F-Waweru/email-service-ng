import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideMonitor, lucideMoon, lucideSun } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import type { ThemeMode } from './brand.types';
import { ThemeService } from './theme.service';

/** Light / dark / system switcher for the header. */
@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, HlmButton, HlmDropdownMenuImports],
  providers: [provideIcons({ lucideSun, lucideMoon, lucideMonitor, lucideCheck })],
  template: `
    <button
      hlmBtn
      variant="ghost"
      size="icon"
      [hlmDropdownMenuTrigger]="menu"
      align="end"
      aria-label="Change theme"
    >
      <ng-icon [name]="icon()" />
    </button>

    <ng-template #menu>
      <hlm-dropdown-menu class="w-36">
        @for (option of options; track option.mode) {
          <button hlmDropdownMenuItem (triggered)="theme.setMode(option.mode)">
            <ng-icon [name]="option.icon" />
            {{ option.label }}
            @if (theme.mode() === option.mode) {
              <ng-icon name="lucideCheck" class="ms-auto" />
            }
          </button>
        }
      </hlm-dropdown-menu>
    </ng-template>
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);

  protected readonly options: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: 'light', label: 'Light', icon: 'lucideSun' },
    { mode: 'dark', label: 'Dark', icon: 'lucideMoon' },
    { mode: 'system', label: 'System', icon: 'lucideMonitor' },
  ];

  protected readonly icon = computed(() => (this.theme.isDark() ? 'lucideMoon' : 'lucideSun'));
}
