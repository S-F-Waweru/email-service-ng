import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendar, lucideCalendarRange, lucideCheck, lucideChevronDown, lucideX } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmInput } from '@spartan-ng/helm/input';
import {
  type DatePreset,
  PRESET_GROUPS,
  PRESET_LABELS,
  rangeLabel,
  resolveRange,
  toDayString,
} from './date-ranges';
import { RequestsStore } from './requests.store';

/** "Any time" / presets (today, this week, last month…) / custom range. */
@Component({
  selector: 'app-date-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, HlmButton, HlmDropdownMenuImports, HlmInput],
  providers: [provideIcons({ lucideCalendar, lucideCalendarRange, lucideCheck, lucideChevronDown, lucideX })],
  host: { class: 'flex flex-wrap items-center gap-2' },
  templateUrl: './date-filter.html',
})
export class DateFilterControl {
  protected readonly store = inject(RequestsStore);

  protected readonly groups = PRESET_GROUPS;
  protected readonly labels = PRESET_LABELS;
  protected readonly today = toDayString(new Date());

  protected readonly current = computed(() => this.store.filters().date);
  protected readonly label = computed(() => {
    const date = this.current();
    return date ? rangeLabel(date) : 'Any time';
  });

  /** Custom range editor (two date inputs) is open. */
  protected readonly editingCustom = signal(false);
  protected readonly start = signal('');
  protected readonly end = signal('');
  protected readonly customError = computed(() => {
    if (!this.start() || !this.end()) return 'Pick both dates.';
    if (this.start() > this.end()) return 'The start date is after the end date.';
    return null;
  });

  protected isCurrent(preset: DatePreset): boolean {
    return this.current()?.preset === preset;
  }

  protected choose(preset: DatePreset): void {
    this.editingCustom.set(false);
    this.store.setDate({ preset });
  }

  protected openCustom(): void {
    // Start from whatever is selected now, or the last 7 days.
    const current = this.current();
    const range = resolveRange(current ?? { preset: 'last7' });
    const endDay = range.to ? new Date(range.to.getTime() - 1) : new Date();
    this.start.set(current?.preset === 'custom' ? current.start : toDayString(range.from));
    this.end.set(current?.preset === 'custom' ? current.end : toDayString(endDay));
    this.editingCustom.set(true);
  }

  protected applyCustom(): void {
    if (this.customError()) return;
    this.store.setDate({ preset: 'custom', start: this.start(), end: this.end() });
    this.editingCustom.set(false);
  }

  protected clear(): void {
    this.editingCustom.set(false);
    this.store.setDate(null);
  }
}
