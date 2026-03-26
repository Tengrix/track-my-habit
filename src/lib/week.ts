import { startOfWeek, endOfWeek, addWeeks, subMonths, subYears, format, eachDayOfInterval } from "date-fns";
import type { ActivityRange } from "@/lib/types";

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

export function getActivityDateRange(range: ActivityRange): { start: Date; end: Date } {
  const today = new Date();
  const end = today;
  let start: Date;
  switch (range) {
    case "1m": start = subMonths(today, 1); break;
    case "3m": start = subMonths(today, 3); break;
    case "6m": start = subMonths(today, 6); break;
    case "1y": start = subYears(today, 1); break;
  }
  return {
    start: startOfWeek(start, WEEK_OPTIONS),
    end: endOfWeek(end, WEEK_OPTIONS),
  };
}

export function eachDayOfRange(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end });
}
