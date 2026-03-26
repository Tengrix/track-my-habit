"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth";
import { getActivityDateRange, eachDayOfRange, formatDateKey, getDayLabel } from "@/lib/week";
import type { ActivityStats, DayActivity } from "@/lib/types";

const statsSchema = z.object({
  habitIds: z.array(z.string().min(1)),
  range: z.enum(["1m", "3m", "6m", "1y"]),
});

export async function getActivityStats(input: {
  habitIds: string[];
  range: string;
}): Promise<ActivityStats> {
  const userId = await getAuthUserId();
  const data = statsSchema.parse(input);

  if (data.habitIds.length === 0) {
    return { days: [], totalDone: 0, totalPossible: 0, completionRate: 0, currentStreak: 0, longestStreak: 0 };
  }

  const { start, end } = getActivityDateRange(data.range);

  const habits = await db.habit.findMany({
    where: { userId, id: { in: data.habitIds } },
    select: { id: true, activeDays: true },
  });

  const logs = await db.habitLog.findMany({
    where: {
      habitId: { in: data.habitIds },
      date: { gte: start, lte: end },
    },
    select: { habitId: true, date: true },
  });

  // Build log lookup: "habitId:dateKey" -> true
  const logSet = new Set<string>();
  for (const log of logs) {
    logSet.add(`${log.habitId}:${log.date.toISOString().split("T")[0]}`);
  }

  // Build per-day activity
  const allDays = eachDayOfRange(start, end);
  const today = formatDateKey(new Date());
  const days: DayActivity[] = [];
  let totalDone = 0;
  let totalPossible = 0;

  for (const day of allDays) {
    const dateKey = formatDateKey(day);
    // Don't count future days
    if (dateKey > today) {
      days.push({ date: dateKey, done: 0, total: 0, ratio: 0 });
      continue;
    }

    const dayLabel = getDayLabel(day);
    let done = 0;
    let total = 0;

    for (const habit of habits) {
      if (habit.activeDays.includes(dayLabel)) {
        total++;
        if (logSet.has(`${habit.id}:${dateKey}`)) {
          done++;
        }
      }
    }

    const ratio = total > 0 ? done / total : 0;
    days.push({ date: dateKey, done, total, ratio });
    totalDone += done;
    totalPossible += total;
  }

  // Streaks: consecutive days with ratio > 0, skipping days with total === 0
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  let foundCurrent = false;

  // Walk backwards from today
  for (let i = days.length - 1; i >= 0; i--) {
    const d = days[i];
    if (d.date > today) continue;
    if (d.total === 0) continue; // skip rest days

    if (d.done > 0) {
      streak++;
      if (!foundCurrent) currentStreak = streak;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      if (!foundCurrent) foundCurrent = true;
      streak = 0;
    }
  }

  // Also scan forward for longest streak
  streak = 0;
  for (const d of days) {
    if (d.date > today) break;
    if (d.total === 0) continue;
    if (d.done > 0) {
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 0;
    }
  }

  const completionRate = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  return { days, totalDone, totalPossible, completionRate, currentStreak, longestStreak };
}
