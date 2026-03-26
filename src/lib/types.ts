export interface TopicNode {
  id: string;
  title: string;
  color: string;
  habits: { id: string; title: string }[];
}

export interface HabitData {
  id: string;
  topicId: string;
  title: string;
  activeDays: string[];
  logs: { id: string; date: string; status: string }[];
}

export interface TopicSection {
  id: string;
  title: string;
  color: string;
  habits: HabitData[];
}

export type ActivityRange = "1m" | "3m" | "6m" | "1y";

export interface DayActivity {
  date: string;
  done: number;
  total: number;
  ratio: number;
}

export interface ActivityStats {
  days: DayActivity[];
  totalDone: number;
  totalPossible: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}
