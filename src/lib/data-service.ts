import type { TopicNode, HabitData, ActivityStats } from "@/lib/types";

export interface DataService {
  getTopics(): Promise<TopicNode[]>;
  createTopic(input: { title: string; color?: string }): Promise<void>;
  updateTopicColor(topicId: string, color: string): Promise<void>;
  deleteTopic(topicId: string): Promise<void>;
  reorderTopics(orderedIds: string[]): Promise<void>;
  reorderHabits(topicId: string, orderedHabitIds: string[]): Promise<void>;

  createHabit(input: { topicId: string; title: string; activeDays: string[] }): Promise<void>;
  updateHabit(input: { habitId: string; title: string; activeDays: string[] }): Promise<void>;
  deleteHabit(habitId: string): Promise<void>;

  getHabitsWithLogs(habitIds: string[], weekStart: string, weekEnd: string): Promise<HabitData[]>;
  toggleHabitLog(input: { habitId: string; date: string }): Promise<void>;

  getActivityStats(input: { habitIds: string[]; range: string }): Promise<ActivityStats>;
}
