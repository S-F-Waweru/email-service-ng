// Date filters for the requests list. Ranges are worked out in the user's
// own time zone ("today" means their today) and sent to the API as instants.

export const DATE_PRESETS = [
  'today',
  'yesterday',
  'thisWeek',
  'lastWeek',
  'last7',
  'thisMonth',
  'lastMonth',
  'last30',
  'thisYear',
] as const;
export type DatePreset = (typeof DATE_PRESETS)[number];

export type DateFilter =
  | { preset: DatePreset }
  /** Inclusive calendar days, YYYY-MM-DD. */
  | { preset: 'custom'; start: string; end: string };

export const PRESET_LABELS: Record<DatePreset, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This week',
  lastWeek: 'Last week',
  last7: 'Last 7 days',
  thisMonth: 'This month',
  lastMonth: 'Last month',
  last30: 'Last 30 days',
  thisYear: 'This year',
};

/** Groups for the menu, separated by dividers. */
export const PRESET_GROUPS: DatePreset[][] = [
  ['today', 'yesterday'],
  ['thisWeek', 'lastWeek', 'last7'],
  ['thisMonth', 'lastMonth', 'last30'],
  ['thisYear'],
];

/** `from` inclusive, `to` exclusive; `to` null = up to now. */
export interface ResolvedRange {
  from: Date;
  to: Date | null;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
/** Weeks start on Monday. */
const startOfWeek = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));

export function resolveRange(filter: DateFilter, now = new Date()): ResolvedRange {
  const today = startOfDay(now);
  switch (filter.preset) {
    case 'today':
      return { from: today, to: null };
    case 'yesterday':
      return { from: addDays(today, -1), to: today };
    case 'thisWeek':
      return { from: startOfWeek(now), to: null };
    case 'lastWeek': {
      const thisWeek = startOfWeek(now);
      return { from: addDays(thisWeek, -7), to: thisWeek };
    }
    case 'last7':
      return { from: addDays(today, -6), to: null };
    case 'thisMonth':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: null };
    case 'lastMonth':
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 1),
      };
    case 'last30':
      return { from: addDays(today, -29), to: null };
    case 'thisYear':
      return { from: new Date(now.getFullYear(), 0, 1), to: null };
    case 'custom':
      return { from: parseDay(filter.start), to: addDays(parseDay(filter.end), 1) };
  }
}

export function rangeLabel(filter: DateFilter): string {
  if (filter.preset !== 'custom') return PRESET_LABELS[filter.preset];
  const fmt = (day: string) =>
    parseDay(day).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  return filter.start === filter.end ? fmt(filter.start) : `${fmt(filter.start)} – ${fmt(filter.end)}`;
}

/** YYYY-MM-DD for <input type="date">, in local time. */
export function toDayString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local midnight of a YYYY-MM-DD day (not UTC, unlike new Date('YYYY-MM-DD')). */
export function parseDay(day: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}
