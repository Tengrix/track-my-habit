"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { TopicTree } from "@/components/TopicTree";
import { HabitWeekGrid } from "@/components/HabitWeekGrid";
import { WeekNavigator } from "@/components/WeekNavigator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { DemoBanner } from "@/components/DemoBanner";
import { DataProvider, useData } from "@/lib/demo-context";
import {
  getWeekStart,
  getWeekEnd,
  shiftWeek,
  formatDateKey,
} from "@/lib/week";
import { UserButton } from "@clerk/nextjs";
import { ActivityDialog } from "@/components/ActivityDialog";
import { Activity, BarChart3, LogIn, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TopicNode, HabitData } from "@/lib/types";
import Link from "next/link";

const STORAGE_KEY = "track-my-habit-selected-habits";

function saveSelected(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

interface DashboardClientProps {
  topics: TopicNode[];
  isDemo: boolean;
}

export function DashboardClient({ topics, isDemo }: DashboardClientProps) {
  return (
    <DataProvider isDemo={isDemo} initialTopics={topics}>
      <DashboardInner isDemo={isDemo} />
    </DataProvider>
  );
}

function DashboardInner({ isDemo }: { isDemo: boolean }) {
  const { service, topics, refreshTopics } = useData();
  const [selectedHabitIds, setSelectedHabitIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const restoredRef = useRef(false);

  useEffect(() => {
    setWeekStart(getWeekStart(new Date()));
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSelectedHabitIds(new Set(JSON.parse(stored)));
      }
    } catch {}
    restoredRef.current = true;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (restoredRef.current) saveSelected(selectedHabitIds);
  }, [selectedHabitIds]);

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
    if (!weekStart) return;
    const ids = [...selectedHabitIds];
    if (ids.length === 0) {
      setHabits([]);
      return;
    }
    setLoading(true);
    try {
      const start = formatDateKey(weekStart);
      const end = formatDateKey(getWeekEnd(weekStart));
      const data = await service.getHabitsWithLogs(ids, start, end);
      setHabits(data);
    } finally {
      setLoading(false);
    }
  }, [selectedHabitIds, weekStart, service]);

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
    if (isDemo) refreshTopics();
  }, [isDemo, refreshTopics]);

  const sections = useMemo(() => {
    const result: { id: string; title: string; color: string; habits: HabitData[] }[] = [];
    for (const topic of topics) {
      const topicHabits = habits.filter((h) => h.topicId === topic.id);
      if (topicHabits.length > 0) {
        result.push({ id: topic.id, title: topic.title, color: topic.color, habits: topicHabits });
      }
    }
    return result;
  }, [topics, habits]);

  const handlePrev = useCallback(() => setWeekStart((w) => w ? shiftWeek(w, -1) : w), []);
  const handleNext = useCallback(() => setWeekStart((w) => w ? shiftWeek(w, 1) : w), []);
  const handleToday = useCallback(() => setWeekStart(getWeekStart(new Date())), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen overflow-hidden bg-background">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] md:hidden"
            onClick={closeSidebar}
          />
        )}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[272px] shrink-0 border-r border-border/60",
            "bg-[hsl(var(--sidebar))]",
            "transition-transform duration-200 ease-in-out",
            "md:relative md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-14 items-center gap-2.5 border-b border-border/50 px-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-sm shadow-primary/20">
              <Activity className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-[13px] font-semibold tracking-tight">Track My Habit</span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7 md:hidden text-muted-foreground"
              onClick={closeSidebar}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-3.5rem)]">
            <div className="p-2">
              <TopicTree
                topics={topics}
                selectedHabitIds={selectedHabitIds}
                onToggleHabit={handleToggleHabit}
                onHabitDeleted={handleHabitDeleted}
              />
            </div>
          </ScrollArea>
        </aside>

        <main className="flex flex-1 flex-col overflow-hidden">
          {isDemo && <DemoBanner />}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 px-4 sm:px-6 gap-3 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 md:hidden text-muted-foreground"
              onClick={openSidebar}
            >
              <Menu className="h-4 w-4" />
            </Button>
            {weekStart && (
              <WeekNavigator
                weekStart={weekStart}
                onPrev={handlePrev}
                onNext={handleNext}
                onToday={handleToday}
              />
            )}
            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setStatsOpen(true)}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Statistics</TooltipContent>
              </Tooltip>
              {isDemo ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
                      <Link href="/sign-in">
                        <LogIn className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Sign in</TooltipContent>
                </Tooltip>
              ) : (
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-7 w-7",
                    },
                  }}
                />
              )}
            </div>
          </header>
          <ActivityDialog
            open={statsOpen}
            onOpenChange={setStatsOpen}
            habitIds={[...selectedHabitIds]}
          />
          <ScrollArea className="flex-1">
            <div className="bg-grid min-h-full p-4 sm:p-6">
              {!weekStart || loading ? (
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
    <div className="flex flex-col gap-4">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/30 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full animate-shimmer" />
            <div className="h-4 w-28 rounded-md animate-shimmer" />
            <div className="ml-auto h-1.5 w-20 rounded-full animate-shimmer" />
          </div>
          <div className="p-4">
            <div className="space-y-2.5">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="h-3 w-24 rounded-md animate-shimmer" />
                  <div className="flex gap-2 ml-auto">
                    {[1, 2, 3, 4, 5, 6, 7].map((k) => (
                      <div key={k} className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg animate-shimmer" />
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
