import type { Content, Ui } from '../data/schema.ts';

type Period = Content['education'][number]['period'];

/** `2026-06` → `jun 2026` (es) / `Jun 2026` (en). */
export function formatYearMonth(value: string, months: Ui['months']): string {
  const [year, month] = value.split('-');
  return `${months[Number(month) - 1]} ${year}`;
}

/** `{ start: '2026-01', end: null }` → `ene 2026 – Actualidad`. */
export function formatPeriod(period: Period, ui: Pick<Ui, 'months' | 'experience'>): string {
  const start = formatYearMonth(period.start, ui.months);
  const end = period.end ? formatYearMonth(period.end, ui.months) : ui.experience.present;
  return `${start} – ${end}`;
}
