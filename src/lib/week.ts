import { startOfWeek, endOfWeek, addWeeks, format, eachDayOfInterval } from "date-fns";

const WEEK_OPTIONS = { weekStartsOn: 1 as const }; // Monday

export const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
export type DayLabel = (typeof DAY_LABELS)[number];

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, WEEK_OPTIONS);
}

export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, WEEK_OPTIONS);
}

export function getWeekDays(weekStart: Date): Date[] {
  return eachDayOfInterval({
    start: weekStart,
    end: getWeekEnd(weekStart),
  });
}

export function shiftWeek(weekStart: Date, offset: number): Date {
  return addWeeks(weekStart, offset);
}

export function formatDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDateDisplay(date: Date): string {
  return format(date, "MMM d");
}

export function getDayLabel(date: Date): DayLabel {
  const dayIndex = (date.getDay() + 6) % 7; // Mon=0..Sun=6
  return DAY_LABELS[dayIndex];
}

export function parseWeekParam(param: string | undefined): Date {
  if (param) {
    const parsed = new Date(param);
    if (!isNaN(parsed.getTime())) {
      return getWeekStart(parsed);
    }
  }
  return getWeekStart(new Date());
}
