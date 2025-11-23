import type { CalendarEventViewModel } from "../types";

function padNumber(value: number): string {
  return value.toString().padStart(2, "0");
}

export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1);
  const day = padNumber(date.getDate());
  return `${year}-${month}-${day}`;
}

export function formatTimeForInput(date: Date): string {
  const hours = padNumber(date.getHours());
  const minutes = padNumber(date.getMinutes());
  return `${hours}:${minutes}`;
}

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

export function parseDateKey(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const [, yearString, monthString, dayString] = match;
  const year = Number(yearString);
  const month = Number(monthString) - 1;
  const day = Number(dayString);
  const parsed = new Date(year, month, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

function atStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function atEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function isEventOnDate(
  event: CalendarEventViewModel,
  targetDate: Date,
): boolean {
  const eventStart = atStartOfDay(event.startAt);
  const eventEnd = atEndOfDay(event.endAt ?? event.startAt);
  const comparator = new Date(targetDate);
  comparator.setHours(12, 0, 0, 0);
  return comparator >= eventStart && comparator <= eventEnd;
}
