"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TopicTree } from "@/components/TopicTree";
import { HabitWeekGrid } from "@/components/HabitWeekGrid";
import { WeekNavigator } from "@/components/WeekNavigator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { getHabitsWithLogs } from "@/app/actions/habits";
import {
  getWeekStart,
  getWeekEnd,
  shiftWeek,
  formatDateKey,
} from "@/lib/week";
import { UserButton } from "@clerk/nextjs";
import { Activity, Menu, X } from "lucide-react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const onToggle = useCallback((habitId: string, dateKey: string) => {
    setHabits((prev) =>
      prev.map((hab) => {
        if (hab.id !== habitId) return hab;
        const exist = hab.logs.some((h) => h.date === dateKey);
        if (exist) {
          return { ...hab, logs: hab.logs.filter((h) => h.date !== dateKey) };
        }
        return { ...hab, logs: [...hab.logs, { id: crypto.randomUUID(), date: dateKey, status: "DONE" }] };
      })
    );
  }, []);

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

  const handleToggleHabit = useCallback((habitId: string) => {
    setSelectedHabitIds((prev) => {
      const next = new Set(prev);
      if (next.has(habitId)) next.delete(habitId);
      else next.add(habitId);
      return next;
    });
  }, []);

  const handleHabitDeleted = useCallback((habitId: string) => {
    setSelectedHabitIds((prev) => {
      if (!prev.has(habitId)) return prev;
      const next = new Set(prev);
      next.delete(habitId);
      return next;
    });
  }, []);

  const sections = useMemo(() => {
    const result: { id: string; title: string; habits: HabitData[] }[] = [];
    for (const topic of topics) {
      const topicHabits = habits.filter((h) => h.topicId === topic.id);
      if (topicHabits.length > 0) {
        result.push({ id: topic.id, title: topic.title, habits: topicHabits });
      }
    }
    return result;
  }, [topics, habits]);

  const handlePrev = useCallback(() => setWeekStart((w) => shiftWeek(w, -1)), []);
  const handleNext = useCallback(() => setWeekStart((w) => shiftWeek(w, 1)), []);
  const handleToday = useCallback(() => setWeekStart(getWeekStart(new Date())), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen overflow-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity"
            onClick={closeSidebar}
          />
        )}

        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-72 shrink-0 border-r border-border/50
            bg-[hsl(var(--sidebar))]
            transition-transform duration-200 ease-in-out
            md:relative md:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex h-13 items-center gap-2.5 border-b border-border/50 px-5 mt-1 pb-0.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-sm shadow-primary/25">
              <Activity className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight">Track My Habit</span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7 md:hidden"
              onClick={closeSidebar}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-3.25rem)]">
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

        <main className="flex flex-1 flex-col overflow-hidden bg-background">
          <header className="flex h-13 shrink-0 items-center justify-between border-b border-border/50 px-4 sm:px-6 gap-3 bg-card/50 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 md:hidden"
              onClick={openSidebar}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <WeekNavigator
              weekStart={weekStart}
              onPrev={handlePrev}
              onNext={handleNext}
              onToday={handleToday}
            />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7",
                },
              }}
            />
          </header>
          <ScrollArea className="flex-1">
            <div className="bg-grid min-h-full p-3 sm:p-5">
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <HabitWeekGrid
                  sections={sections}
                  weekStart={weekStart}
                  onToggle={onToggle}
                  onHabitUpdated={fetchHabits}
                />
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
    <div className="flex flex-col gap-3">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border/30 flex items-center gap-3">
            <div className="h-4 w-24 rounded animate-shimmer" />
            <div className="ml-auto h-1.5 w-16 rounded-full animate-shimmer" />
          </div>
          <div className="p-3">
            <div className="space-y-1.5">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="h-3 w-20 rounded animate-shimmer" />
                  <div className="flex gap-1.5 ml-auto">
                    {[1, 2, 3, 4, 5, 6, 7].map((k) => (
                      <div key={k} className="h-6 w-6 sm:h-7 sm:w-7 rounded-md animate-shimmer" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
