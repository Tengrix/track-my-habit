"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { TopicNode } from "@/lib/types";

const createTopicSchema = z.object({
  title: z.string().min(1).max(100),
  parentId: z.string().nullable(),
});

export async function createTopic(input: { title: string; parentId: string | null }) {
  const userId = await getAuthUserId();
  const data = createTopicSchema.parse(input);

  if (data.parentId) {
    const parent = await db.topic.findFirst({
      where: { id: data.parentId, userId },
    });
    if (!parent) throw new Error("Parent topic not found");
  }

  const maxOrder = await db.topic.aggregate({
    where: { userId, parentId: data.parentId },
    _max: { order: true },
  });

  await db.topic.create({
    data: {
      userId,
      title: data.title,
      parentId: data.parentId,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/");
}

export async function getTopicsTree(): Promise<TopicNode[]> {
  const userId = await getAuthUserId();

  const topics = await db.topic.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  });

  // Build tree: top-level topics with children
  const topLevel = topics.filter((t) => !t.parentId);
  const childrenMap = new Map<string, TopicNode[]>();

  for (const topic of topics) {
    if (topic.parentId) {
      const existing = childrenMap.get(topic.parentId) ?? [];
      existing.push({
        id: topic.id,
        title: topic.title,
        parentId: topic.parentId,
        children: [],
      });
      childrenMap.set(topic.parentId, existing);
    }
  }

  return topLevel.map((t) => ({
    id: t.id,
    title: t.title,
    parentId: t.parentId,
    children: childrenMap.get(t.id) ?? [],
  }));
}
