import type { DataService } from "@/lib/data-service";
import type { TopicNode, HabitData, ActivityStats, DayActivity } from "@/lib/types";
import { getActivityDateRange, eachDayOfRange, formatDateKey, getDayLabel } from "@/lib/week";

const TOPICS_KEY = "demo-topics";
const HABITS_KEY = "demo-habits";
const LOGS_KEY = "demo-logs";
const INIT_KEY = "demo-initialized";

interface DemoTopic {
  id: string;
  title: string;
  color: string;
  order: number;
}

interface DemoHabit {
  id: string;
  topicId: string;
  title: string;
  activeDays: string[];
  order: number;
}

interface DemoLog {
  id: string;
  habitId: string;
  date: string;
  status: string;
}

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function uid(): string {
  return crypto.randomUUID();
}

function seedIfNeeded() {
  if (localStorage.getItem(INIT_KEY)) return;

  const topicId1 = uid();
  const topicId2 = uid();

  const topics: DemoTopic[] = [
    { id: topicId1, title: "Morning Routine", color: "amber", order: 0 },
    { id: topicId2, title: "Learning", color: "blue", order: 1 },
  ];

  const habits: DemoHabit[] = [
    { id: uid(), topicId: topicId1, title: "Meditate", activeDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"], order: 0 },
    { id: uid(), topicId: topicId1, title: "Exercise", activeDays: ["MON", "TUE", "WED", "THU", "FRI"], order: 1 },
    { id: uid(), topicId: topicId2, title: "Read 20 pages", activeDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"], order: 0 },
  ];

  write(TOPICS_KEY, topics);
  write(HABITS_KEY, habits);
  write(LOGS_KEY, []);
  localStorage.setItem(INIT_KEY, "1");
}

export function createDemoDataService(): DataService {
  seedIfNeeded();

  return {
    async getTopics(): Promise<TopicNode[]> {
      const topics = read<DemoTopic>(TOPICS_KEY).sort((a, b) => a.order - b.order);
      const habits = read<DemoHabit>(HABITS_KEY);
      return topics.map((t) => ({
        id: t.id,
        title: t.title,
        color: t.color,
        habits: habits
          .filter((h) => h.topicId === t.id)
          .sort((a, b) => a.order - b.order)
          .map((h) => ({ id: h.id, title: h.title })),
      }));
    },

    async createTopic(input) {
      const topics = read<DemoTopic>(TOPICS_KEY);
      const maxOrder = topics.reduce((max, t) => Math.max(max, t.order), -1);
      topics.push({
        id: uid(),
        title: input.title,
        color: input.color ?? "slate",
        order: maxOrder + 1,
      });
      write(TOPICS_KEY, topics);
    },

    async updateTopicColor(topicId, color) {
      const topics = read<DemoTopic>(TOPICS_KEY);
      const topic = topics.find((t) => t.id === topicId);
      if (topic) {
        topic.color = color;
        write(TOPICS_KEY, topics);
      }
    },

    async deleteTopic(topicId) {
      const topics = read<DemoTopic>(TOPICS_KEY).filter((t) => t.id !== topicId);
      write(TOPICS_KEY, topics);
      const habits = read<DemoHabit>(HABITS_KEY);
      const habitIdsToRemove = habits.filter((h) => h.topicId === topicId).map((h) => h.id);
      write(HABITS_KEY, habits.filter((h) => h.topicId !== topicId));
      if (habitIdsToRemove.length > 0) {
        const removeSet = new Set(habitIdsToRemove);
        write(LOGS_KEY, read<DemoLog>(LOGS_KEY).filter((l) => !removeSet.has(l.habitId)));
      }
    },

    async reorderTopics(orderedIds) {
      const topics = read<DemoTopic>(TOPICS_KEY);
      const map = new Map(topics.map((t) => [t.id, t]));
      const reordered: DemoTopic[] = [];
      orderedIds.forEach((id, i) => {
        const t = map.get(id);
        if (t) {
          t.order = i;
          reordered.push(t);
        }
      });
      write(TOPICS_KEY, reordered);
    },

    async reorderHabits(_topicId, orderedHabitIds) {
      const habits = read<DemoHabit>(HABITS_KEY);
      const map = new Map(habits.map((h) => [h.id, h]));
      const idSet = new Set(orderedHabitIds);
      orderedHabitIds.forEach((id, i) => {
        const h = map.get(id);
        if (h) h.order = i;
      });
      write(HABITS_KEY, habits.map((h) => (idSet.has(h.id) ? map.get(h.id)! : h)));
    },

    async createHabit(input) {
      const habits = read<DemoHabit>(HABITS_KEY);
      const topicHabits = habits.filter((h) => h.topicId === input.topicId);
      const maxOrder = topicHabits.reduce((max, h) => Math.max(max, h.order), -1);
      habits.push({
        id: uid(),
        topicId: input.topicId,
        title: input.title,
        activeDays: input.activeDays,
        order: maxOrder + 1,
      });
      write(HABITS_KEY, habits);
    },

    async updateHabit(input) {
      const habits = read<DemoHabit>(HABITS_KEY);
      const habit = habits.find((h) => h.id === input.habitId);
      if (habit) {
        habit.title = input.title;
        habit.activeDays = input.activeDays;
        write(HABITS_KEY, habits);
      }
    },

    async deleteHabit(habitId) {
      write(HABITS_KEY, read<DemoHabit>(HABITS_KEY).filter((h) => h.id !== habitId));
      write(LOGS_KEY, read<DemoLog>(LOGS_KEY).filter((l) => l.habitId !== habitId));
    },

    async getHabitsWithLogs(habitIds, weekStart, weekEnd): Promise<HabitData[]> {
      if (habitIds.length === 0) return [];
      const idSet = new Set(habitIds);
      const habits = read<DemoHabit>(HABITS_KEY)
        .filter((h) => idSet.has(h.id))
        .sort((a, b) => a.order - b.order);
      const logs = read<DemoLog>(LOGS_KEY).filter(
        (l) => idSet.has(l.habitId) && l.date >= weekStart && l.date <= weekEnd
      );

      return habits.map((h) => ({
        id: h.id,
        topicId: h.topicId,
        title: h.title,
        activeDays: h.activeDays,
        logs: logs
          .filter((l) => l.habitId === h.id)
          .map((l) => ({ id: l.id, date: l.date, status: l.status })),
      }));
    },

    async toggleHabitLog(input) {
      const logs = read<DemoLog>(LOGS_KEY);
      const idx = logs.findIndex((l) => l.habitId === input.habitId && l.date === input.date);
      if (idx >= 0) {
        logs.splice(idx, 1);
      } else {
        logs.push({ id: uid(), habitId: input.habitId, date: input.date, status: "DONE" });
      }
      write(LOGS_KEY, logs);
    },

    async getActivityStats(input): Promise<ActivityStats> {
      if (input.habitIds.length === 0) {
        return { days: [], totalDone: 0, totalPossible: 0, completionRate: 0, currentStreak: 0, longestStreak: 0 };
      }

      const idSet = new Set(input.habitIds);
      const habits = read<DemoHabit>(HABITS_KEY).filter((h) => idSet.has(h.id));
      const { start, end } = getActivityDateRange(input.range as "1m" | "3m" | "6m" | "1y");
      const startKey = formatDateKey(start);
      const endKey = formatDateKey(end);
      const allLogs = read<DemoLog>(LOGS_KEY).filter(
        (l) => idSet.has(l.habitId) && l.date >= startKey && l.date <= endKey
      );

      const logSet = new Set(allLogs.map((l) => `${l.habitId}:${l.date}`));

      const allDays = eachDayOfRange(start, end);
      const today = formatDateKey(new Date());
      const days: DayActivity[] = [];
      let totalDone = 0;
      let totalPossible = 0;

      for (const day of allDays) {
        const dateKey = formatDateKey(day);
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
            if (logSet.has(`${habit.id}:${dateKey}`)) done++;
          }
        }
        const ratio = total > 0 ? done / total : 0;
        days.push({ date: dateKey, done, total, ratio });
        totalDone += done;
        totalPossible += total;
      }

      let currentStreak = 0;
      let longestStreak = 0;
      let streak = 0;
      let foundCurrent = false;

      for (let i = days.length - 1; i >= 0; i--) {
        const d = days[i];
        if (d.date > today) continue;
        if (d.total === 0) continue;
        if (d.done > 0) {
          streak++;
          if (!foundCurrent) currentStreak = streak;
          longestStreak = Math.max(longestStreak, streak);
        } else {
          if (!foundCurrent) foundCurrent = true;
          streak = 0;
        }
      }

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
    },
  };
}
