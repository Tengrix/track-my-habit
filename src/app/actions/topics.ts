"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { TopicNode } from "@/lib/types";

const createTopicSchema = z.object({
  title: z.string().min(1).max(100),
});

export async function createTopic(input: { title: string }) {
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
      order: (maxOrder._max.order ?? -1) + 1,
    },
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
    habits: t.habits,
  }));
}
