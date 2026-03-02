"use client";

import { useState, useEffect, useCallback } from "react";
import { TopicTree } from "@/components/TopicTree";
import { HabitWeekGrid } from "@/components/HabitWeekGrid";
import { WeekNavigator } from "@/components/WeekNavigator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getHabitsWithLogs } from "@/app/actions/habits";
import {
  getWeekStart,
  getWeekEnd,
  shiftWeek,
  formatDateKey,
} from "@/lib/week";
import type { TopicNode, HabitData } from "@/lib/types";

const STORAGE_KEY = "track-my-habit-selected-habits";

function loadSelected(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch {}
  return new Set();
}

function saveSelected(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

interface DashboardClientProps {
  topics: TopicNode[];
}

export function DashboardClient({ topics }: DashboardClientProps) {
  const [selectedHabitIds, setSelectedHabitIds] = useState<Set<string>>(loadSelected);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [loading, setLoading] = useState(false);

  // Persist selection
  useEffect(() => {
    saveSelected(selectedHabitIds);
  }, [selectedHabitIds]);

  // Fetch habits when selection or week changes
  const fetchHabits = useCallback(async () => {
    const ids = [...selectedHabitIds];
    if (ids.length === 0) {
      setHabits([]);
      return;
    }
    setLoading(true);
    try {
      const start = formatDateKey(weekStart);
      const end = formatDateKey(getWeekEnd(weekStart));
      const data = await getHabitsWithLogs(ids, start, end);
      setHabits(data);
    } finally {
      setLoading(false);
    }
  }, [selectedHabitIds, weekStart]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  function handleToggleHabit(habitId: string) {
    setSelectedHabitIds((prev) => {
      const next = new Set(prev);
      if (next.has(habitId)) next.delete(habitId);
      else next.add(habitId);
      return next;
    });
  }

  // Build sections grouped by topic, only including selected habits
  const topicMap = new Map<string, TopicNode>();
  for (const topic of topics) {
    topicMap.set(topic.id, topic);
  }

  const sections: { id: string; title: string; habits: HabitData[] }[] = [];
  for (const topic of topics) {
    const topicHabits = habits.filter((h) => h.topicId === topic.id);
    if (topicHabits.length > 0) {
      sections.push({
        id: topic.id,
        title: topic.title,
        habits: topicHabits,
      });
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left sidebar */}
      <aside className="w-72 shrink-0 border-r bg-muted/30">
        <ScrollArea className="h-full">
          <div className="p-4">
            <TopicTree
              topics={topics}
              selectedHabitIds={selectedHabitIds}
              onToggleHabit={handleToggleHabit}
            />
          </div>
        </ScrollArea>
      </aside>

      <Separator orientation="vertical" />

      {/* Center content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Track My Habit</h1>
            <WeekNavigator
              weekStart={weekStart}
              onPrev={() => setWeekStart((w) => shiftWeek(w, -1))}
              onNext={() => setWeekStart((w) => shiftWeek(w, 1))}
              onToday={() => setWeekStart(getWeekStart(new Date()))}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <HabitWeekGrid sections={sections} weekStart={weekStart} />
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
