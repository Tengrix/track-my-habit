export interface TopicNode {
  id: string;
  title: string;
  parentId: string | null;
  children: TopicNode[];
}

export interface HabitData {
  id: string;
  topicId: string;
  title: string;
  activeDays: string[];
  logs: { id: string; date: string; status: string }[];
}

export interface SubtopicSection {
  id: string;
  title: string;
  habits: HabitData[];
}
