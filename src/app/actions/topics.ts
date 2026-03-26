"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { TopicNode } from "@/lib/types";

import { TOPIC_COLORS } from "@/lib/colors";

const createTopicSchema = z.object({
  title: z.string().min(1).max(100),
  color: z.enum(TOPIC_COLORS).default("slate"),
});

export async function createTopic(input: { title: string; color?: string }) {
  const userId = await getAuthUserId();
  const data = createTopicSchema.parse(input);

  const maxOrder = await db.topic.aggregate({
    where: { userId },
    _max: { order: true },
  });

  await db.topic.create({
    data: {
      userId,
      title: data.title,
      color: data.color,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/");
}

export async function updateTopicColor(topicId: string, color: string) {
  const userId = await getAuthUserId();
  const parsed = z.enum(TOPIC_COLORS).parse(color);

  const topic = await db.topic.findFirst({
    where: { id: topicId, userId },
  });
  if (!topic) throw new Error("Topic not found");

  await db.topic.update({
    where: { id: topicId },
    data: { color: parsed },
  });

  revalidatePath("/");
}

export async function getTopics(): Promise<TopicNode[]> {
  const userId = await getAuthUserId();

  const topics = await db.topic.findMany({
    where: { userId },
    orderBy: { order: "asc" },
    include: {
      habits: {
        orderBy: { order: "asc" },
        select: { id: true, title: true },
      },
    },
  });

  return topics.map((t) => ({
    id: t.id,
    title: t.title,
    color: t.color,
    habits: t.habits,
  }));
}

export async function deleteTopic(topicId: string) {
  const userId = await getAuthUserId();

  const topic = await db.topic.findFirst({
    where: { id: topicId, userId },
  });
  if (!topic) throw new Error("Topic not found");

  await db.topic.delete({ where: { id: topicId } });

  revalidatePath("/");
}

export async function reorderTopics(orderedIds: string[]) {
  const userId = await getAuthUserId();

  const topics = await db.topic.findMany({
    where: { userId },
    select: { id: true },
  });
  const userTopicIds = new Set(topics.map((t) => t.id));

  // Verify all IDs belong to user
  for (const id of orderedIds) {
    if (!userTopicIds.has(id)) throw new Error("Topic not found");
  }

  await db.$transaction(
    orderedIds.map((id, index) =>
      db.topic.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/");
}

export async function reorderHabits(topicId: string, orderedHabitIds: string[]) {
  const userId = await getAuthUserId();

  const topic = await db.topic.findFirst({
    where: { id: topicId, userId },
  });
  if (!topic) throw new Error("Topic not found");

  const habits = await db.habit.findMany({
    where: { topicId, userId },
    select: { id: true },
  });
  const habitIdSet = new Set(habits.map((h) => h.id));

  for (const id of orderedHabitIds) {
    if (!habitIdSet.has(id)) throw new Error("Habit not found");
  }

  await db.$transaction(
    orderedHabitIds.map((id, index) =>
      db.habit.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/");
}
