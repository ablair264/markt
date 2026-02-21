export type ValueFormat = 'currency' | 'number' | 'percentage';

/* ------------------------------------------------------------------ */
/*  Calendar event time formatting                                      */
/* ------------------------------------------------------------------ */

export interface FormatEventTimeOptions {
  /**
   * BCP 47 locale string used for day/time formatting.
   * Defaults to 'en-GB' (24-hour clock, "Mon", "21 Feb" etc.).
   */
  locale?: string;
  /**
   * IANA time zone name, e.g. "Europe/London", "America/New_York".
   * When omitted the browser's local time zone is used.
   */
  timeZone?: string;
  /**
   * Treat the event as all-day (no time displayed).
   *
   * **Google Calendar**: set to `!!event.start.date` (date-only events use
   * `start.date` instead of `start.dateTime`).
   *
   * **Microsoft Graph (Outlook)**: set to `event.isAllDay`.
   */
  allDay?: boolean;
}

/**
 * Format a calendar event's start/end into a compact display string.
 * Accepts `Date` objects or ISO 8601 strings from either API.
 *
 * @example
 * // Google Calendar
 * formatEventTime(event.start.dateTime, event.end.dateTime)
 * // → "Thu · 13:00 – 13:45"
 *
 * // Google Calendar all-day
 * formatEventTime(event.start.date, event.end.date, { allDay: true })
 * // → "Thu 21 Feb · All day"
 *
 * // Microsoft Graph
 * formatEventTime(event.start.dateTime, event.end.dateTime, {
 *   timeZone: event.start.timeZone,
 *   allDay: event.isAllDay,
 * })
 * // → "Thu · 14:00 – 15:00"
 */
export function formatEventTime(
  start: Date | string,
  end: Date | string,
  options: FormatEventTimeOptions = {},
): string {
  const { locale = 'en-GB', timeZone, allDay = false } = options;

  const tzOpt = timeZone ? { timeZone } : {};

  const s = start instanceof Date ? start : new Date(start);
  const e = end instanceof Date ? end : new Date(end);

  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: 'short', ...tzOpt });
  const timeFmt = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    ...tzOpt,
  });
  const dateFmt = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...tzOpt,
  });

  // Compare calendar dates in the target timezone
  const toDateStr = (d: Date) =>
    d.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit', ...tzOpt });
  const sameDay = toDateStr(s) === toDateStr(e);

  if (allDay) {
    return sameDay
      ? `${dateFmt.format(s)} · All day`
      : `${dateFmt.format(s)} – ${dateFmt.format(e)}`;
  }

  return sameDay
    ? `${dayFmt.format(s)} · ${timeFmt.format(s)} – ${timeFmt.format(e)}`
    : `${dateFmt.format(s)} – ${dateFmt.format(e)}`;
}

const defaultCurrency = 'GBP';

export function formatCurrency(
  n: number,
  currency: string = defaultCurrency,
): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatCompact(n: number): string {
  return new Intl.NumberFormat('en-GB', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-GB').format(n);
}

export function formatPercentage(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function formatValue(
  n: number,
  format: ValueFormat,
  currency?: string,
): string {
  switch (format) {
    case 'currency':
      return formatCurrency(n, currency);
    case 'percentage':
      return formatPercentage(n);
    case 'number':
    default:
      return formatNumber(n);
  }
}
