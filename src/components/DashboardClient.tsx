"use client";

import { useState, useEffect, useCallback } from "react";
import { TopicTree } from "@/components/TopicTree";
import { HabitWeekGrid } from "@/components/HabitWeekGrid";
import { WeekNavigator } from "@/components/WeekNavigator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getHabitsWithLogs } from "@/app/actions/habits";
import {
  getWeekStart,
  getWeekEnd,
  shiftWeek,
  formatDateKey,
} from "@/lib/week";
import { UserButton } from "@clerk/nextjs";
import { Activity } from "lucide-react";
import type { TopicNode, HabitData } from "@/lib/types";

const STORAGE_KEY = "track-my-habit-selected-habits";

function saveSelected(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

interface DashboardClientProps {
  topics: TopicNode[];
}

export function DashboardClient({ topics }: DashboardClientProps) {
  const [selectedHabitIds, setSelectedHabitIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [loading, setLoading] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSelectedHabitIds(new Set(JSON.parse(stored)));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveSelected(selectedHabitIds);
  }, [selectedHabitIds, hydrated]);

  const onToggle = (habitId:string,dateKey:string) => {
    let updatedStatusOfHabit = habits.map(hab=>{
      if(hab.id===habitId){
        let exist = hab.logs.some(h=>h.date===dateKey);
        if(exist){
          return {...hab, logs:hab.logs.filter(h=>h.date!==dateKey)}
        }else{
          return {...hab, logs:[...hab.logs, {id:crypto.randomUUID(), date:dateKey, status:'DONE'}]}
        }
      }
      return hab
    })
    setHabits(updatedStatusOfHabit)
  }

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

  function handleHabitDeleted(habitId: string) {
    setSelectedHabitIds((prev) => {
      if (!prev.has(habitId)) return prev;
      const next = new Set(prev);
      next.delete(habitId);
      return next;
    });
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
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen">
        {/* Left sidebar */}
        <aside className="w-72 shrink-0 border-r border-border/60 bg-gradient-to-b from-secondary/40 to-secondary/20">
          <div className="flex h-14 items-center gap-2 border-b border-border/60 px-5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Track My Habit</span>
          </div>
          <ScrollArea className="h-[calc(100vh-3.5rem)]">
            <div className="p-3">
              <TopicTree
                topics={topics}
                selectedHabitIds={selectedHabitIds}
                onToggleHabit={handleToggleHabit}
                onHabitDeleted={handleHabitDeleted}
              />
            </div>
          </ScrollArea>
        </aside>

        {/* Center content */}
        <main className="flex flex-1 flex-col overflow-hidden bg-background">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-6">
            <WeekNavigator
              weekStart={weekStart}
              onPrev={() => setWeekStart((w) => shiftWeek(w, -1))}
              onNext={() => setWeekStart((w) => shiftWeek(w, 1))}
              onToday={() => setWeekStart(getWeekStart(new Date()))}
            />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </header>
          <ScrollArea className="flex-1">
            <div className="bg-grid min-h-full p-6">
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <HabitWeekGrid sections={sections} weekStart={weekStart} onToggle={(habitId, dateKey)=>onToggle(habitId,dateKey)} />
              )}
            </div>
          </ScrollArea>
        </main>
      </div>
    </TooltipProvider>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-4 h-5 w-32 rounded-md animate-shimmer" />
          <div className="space-y-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-4">
                <div className="h-4 w-24 rounded animate-shimmer" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((k) => (
                    <div key={k} className="h-9 w-9 rounded-lg animate-shimmer" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
