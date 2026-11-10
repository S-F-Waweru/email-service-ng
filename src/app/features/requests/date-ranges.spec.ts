import { parseDay, rangeLabel, resolveRange, toDayString } from './date-ranges';

// Wednesday 12 November 2026, 15:30 local time.
const now = new Date(2026, 10, 12, 15, 30);
const day = (d: Date | null) => (d ? toDayString(d) : null);

describe('resolveRange', () => {
  it.each([
    ['today', '2026-11-12', null],
    ['yesterday', '2026-11-11', '2026-11-12'],
    ['thisWeek', '2026-11-09', null], // Monday
    ['lastWeek', '2026-11-02', '2026-11-09'],
    ['last7', '2026-11-06', null], // today plus the 6 days before
    ['thisMonth', '2026-11-01', null],
    ['lastMonth', '2026-10-01', '2026-11-01'],
    ['last30', '2026-10-14', null],
    ['thisYear', '2026-01-01', null],
  ] as const)('%s', (preset, from, to) => {
    const range = resolveRange({ preset }, now);
    expect(day(range.from)).toBe(from);
    expect(day(range.to)).toBe(to);
  });

  it('treats Sunday as the end of the week', () => {
    const sunday = new Date(2026, 10, 15, 9);
    expect(day(resolveRange({ preset: 'thisWeek' }, sunday).from)).toBe('2026-11-09');
  });

  it('includes the whole last day of a custom range', () => {
    const range = resolveRange({ preset: 'custom', start: '2026-11-01', end: '2026-11-05' }, now);
    expect(day(range.from)).toBe('2026-11-01');
    expect(day(range.to)).toBe('2026-11-06');
  });

  it('handles last month in January', () => {
    const range = resolveRange({ preset: 'lastMonth' }, new Date(2027, 0, 10));
    expect(day(range.from)).toBe('2026-12-01');
    expect(day(range.to)).toBe('2027-01-01');
  });
});

describe('parseDay / rangeLabel', () => {
  it('parses a day as local midnight', () => {
    const d = parseDay('2026-11-12');
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 10, 12, 0]);
  });

  it('labels presets by name', () => {
    expect(rangeLabel({ preset: 'last7' })).toBe('Last 7 days');
  });
});
