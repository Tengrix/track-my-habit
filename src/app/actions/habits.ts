"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { DAY_LABELS } from "@/lib/week";

const createHabitSchema = z.object({
  topicId: z.string().min(1),
  title: z.string().min(1).max(200),
  activeDays: z.array(z.enum(DAY_LABELS)).min(1),
});

export async function createHabit(input: {
  topicId: string;
  title: string;
  activeDays: string[];
}) {
  const userId = await getAuthUserId();
  const data = createHabitSchema.parse(input);

  // Verify the topic belongs to user
  const topic = await db.topic.findFirst({
    where: { id: data.topicId, userId },
  });
  if (!topic) throw new Error("Topic not found");

  const maxOrder = await db.habit.aggregate({
    where: { topicId: data.topicId },
    _max: { order: true },
  });

  await db.habit.create({
    data: {
      userId,
      topicId: data.topicId,
      title: data.title,
      activeDays: data.activeDays,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/");
}

const updateHabitSchema = z.object({
  habitId: z.string().min(1),
  title: z.string().min(1).max(200),
  activeDays: z.array(z.enum(DAY_LABELS)).min(1),
});

export async function updateHabit(input: {
  habitId: string;
  title: string;
  activeDays: string[];
}) {
  const userId = await getAuthUserId();
  const data = updateHabitSchema.parse(input);

  const habit = await db.habit.findFirst({
    where: { id: data.habitId, userId },
  });
  if (!habit) throw new Error("Habit not found");

  await db.habit.update({
    where: { id: data.habitId },
    data: {
      title: data.title,
      activeDays: data.activeDays,
    },
  });

  revalidatePath("/");
}

export async function deleteHabit(habitId: string) {
  const userId = await getAuthUserId();

  const habit = await db.habit.findFirst({
    where: { id: habitId, userId },
  });
  if (!habit) throw new Error("Habit not found");

  await db.habit.delete({ where: { id: habitId } });

  revalidatePath("/");
}

export async function getHabitsWithLogs(
  habitIds: string[],
  weekStart: string,
  weekEnd: string
) {
  const userId = await getAuthUserId();

  if (habitIds.length === 0) return [];

  const habits = await db.habit.findMany({
    where: {
      userId,
      id: { in: habitIds },
    },
    orderBy: { order: "asc" },
    include: {
      logs: {
        where: {
          date: {
            gte: new Date(weekStart),
            lte: new Date(weekEnd),
          },
        },
      },
    },
  });

  return habits.map((habit) => ({
    id: habit.id,
    topicId: habit.topicId,
    title: habit.title,
    activeDays: habit.activeDays,
    logs: habit.logs.map((log) => ({
      id: log.id,
      date: log.date.toISOString().split("T")[0],
      status: log.status,
    })),
  }));
}

const toggleLogSchema = z.object({
  habitId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function toggleHabitLog(input: { habitId: string; date: string }) {
  const userId = await getAuthUserId();
  const data = toggleLogSchema.parse(input);

  // Verify habit belongs to user
  const habit = await db.habit.findFirst({
    where: { id: data.habitId, userId },
  });
  if (!habit) throw new Error("Habit not found");

  const dateObj = new Date(data.date + "T00:00:00.000Z");

  const existing = await db.habitLog.findUnique({
    where: {
      habitId_date: {
        habitId: data.habitId,
        date: dateObj,
      },
    },
  });

  if (existing) {
    await db.habitLog.delete({ where: { id: existing.id } });
  } else {
    await db.habitLog.create({
      data: {
        habitId: data.habitId,
        date: dateObj,
        status: "DONE",
      },
    });
  }

  revalidatePath("/");
}
