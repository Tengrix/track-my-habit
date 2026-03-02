export interface TopicNode {
  id: string;
  title: string;
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
  habits: HabitData[];
}
