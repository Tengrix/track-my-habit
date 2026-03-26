"use client";

import { useState, useTransition, useMemo, useCallback, memo } from "react";
import { toggleHabitLog } from "@/app/actions/habits";
import { cn } from "@/lib/utils";
import { getWeekDays, getDayLabel, formatDateKey, type DayLabel } from "@/lib/week";
import { BarChart3, Check, Inbox, Pencil } from "lucide-react";
import type { HabitData, TopicSection } from "@/lib/types";
import { EditHabitDialog } from "@/components/EditHabitDialog";
import { ActivityDialog } from "@/components/ActivityDialog";
import { getTopicColors } from "@/lib/colors";

interface HabitWeekGridProps {
  sections: TopicSection[];
  weekStart: Date;
  onToggle: (habitId: string, dateKey: string) => void;
  onHabitUpdated?: () => void;
}

export function HabitWeekGrid({ sections, weekStart, onToggle, onHabitUpdated }: HabitWeekGridProps) {
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const today = useMemo(() => formatDateKey(new Date()), []);

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 sm:py-32 gap-4 animate-fade-in px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/80">
          <Inbox className="h-5 w-5 text-muted-foreground/40" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground/60">No habits selected</p>
          <p className="mt-1 text-[13px] text-muted-foreground/50">
            Select habits from the sidebar to start tracking
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section, idx) => (
        <SectionCard
          key={section.id}
          section={section}
          weekDays={weekDays}
          today={today}
          onToggle={onToggle}
          onHabitUpdated={onHabitUpdated}
          delay={idx * 50}
        />
      ))}
    </div>
  );
}

interface SectionCardProps {
  section: TopicSection;
  weekDays: Date[];
  today: string;
  onToggle: (habitId: string, dateKey: string) => void;
  onHabitUpdated?: () => void;
  delay: number;
}

const SectionCard = memo(function SectionCard({
  section,
  weekDays,
  today,
  onToggle,
  onHabitUpdated,
  delay,
}: SectionCardProps) {
  const [statsOpen, setStatsOpen] = useState(false);
  const colors = getTopicColors(section.color);
  const { done, total } = useMemo(() => {
    let d = 0;
    let t = 0;
    for (const habit of section.habits) {
      const activeSet = new Set(habit.activeDays);
      const logDates = new Set(habit.logs.map((l) => l.date));
      for (const day of weekDays) {
        if (activeSet.has(getDayLabel(day))) {
          t++;
          if (logDates.has(formatDateKey(day))) d++;
        }
      }
    }
    return { done: d, total: t };
  }, [section.habits, weekDays]);

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div
      className={cn("animate-fade-in rounded-xl overflow-hidden", colors.border, "border bg-card")}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn("flex items-center gap-3 px-5 py-3.5 border-b", colors.bg, colors.border)}>
        <span className={cn("h-2.5 w-2.5 rounded-full shrink-0 ring-2 ring-white/80 dark:ring-white/10", colors.dot)} />
        <h3 className={cn("text-[13px] font-semibold tracking-tight flex-1 truncate", colors.text)}>
          {section.title}
        </h3>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex h-1.5 w-24 rounded-full bg-background/60 dark:bg-background/30 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500 animate-progress", colors.accent)}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={cn("text-[11px] font-semibold tabular-nums", colors.text)}>
            {done}<span className="text-muted-foreground/40 font-normal">/{total}</span>
          </span>
          <button
            onClick={() => setStatsOpen(true)}
            className={cn("p-1 rounded-md transition-colors hover:bg-background/40", colors.text, "opacity-60 hover:opacity-100")}
            title="Topic statistics"
          >
            <BarChart3 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {section.habits.length === 0 ? (
        <p className="px-5 py-4 text-xs text-muted-foreground/60">
          No habits yet. Add one from the sidebar.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/15">
                <th className="py-2 pl-5 pr-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 min-w-[90px] sm:min-w-[130px]">
                  {section.habits.length === 1 ? "Habit" : "Habits"}
                </th>
                {weekDays.map((day) => {
                  const dateKey = formatDateKey(day);
                  const isToday = dateKey === today;
                  const isWeekend = getDayLabel(day) === "SAT" || getDayLabel(day) === "SUN";
                  return (
                    <th key={day.toISOString()} className="py-2.5 text-center w-9 sm:w-11">
                      <div
                        className={cn(
                          "inline-flex flex-col items-center rounded-lg px-1.5 py-1 gap-0.5",
                          isToday && "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                        )}
                      >
                        <span
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wide leading-none",
                            isToday
                              ? "text-primary-foreground/80"
                              : isWeekend
                              ? "text-muted-foreground/35"
                              : "text-foreground/50"
                          )}
                        >
                          {getDayLabel(day).slice(0, 2)}
                        </span>
                        <span
                          className={cn(
                            "text-[13px] font-bold leading-none",
                            isToday
                              ? "text-primary-foreground"
                              : isWeekend
                              ? "text-muted-foreground/30"
                              : "text-foreground/70"
                          )}
                        >
                          {day.getDate()}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {section.habits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  weekDays={weekDays}
                  today={today}
                  topicColor={section.color}
                  onToggle={onToggle}
                  onHabitUpdated={onHabitUpdated}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ActivityDialog
        open={statsOpen}
        onOpenChange={setStatsOpen}
        habitIds={section.habits.map((h) => h.id)}
        title={section.title}
      />
    </div>
  );
});

interface HabitRowProps {
  habit: HabitData;
  weekDays: Date[];
  today: string;
  topicColor: string;
  onToggle: (habitId: string, dateKey: string) => void;
  onHabitUpdated?: () => void;
}

const HabitRow = memo(function HabitRow({
  habit,
  weekDays,
  today,
  topicColor,
  onToggle,
  onHabitUpdated,
}: HabitRowProps) {
  const colors = getTopicColors(topicColor);
  const [isPending, startTransition] = useTransition();
  const [animatingCell, setAnimatingCell] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const logMap = useMemo(() => {
    const map = new Set<string>();
    for (const log of habit.logs) {
      map.add(log.date);
    }
    return map;
  }, [habit.logs]);

  const handleToggle = useCallback(
    (dateKey: string) => {
      setAnimatingCell(dateKey);
      onToggle(habit.id, dateKey);
      startTransition(async () => {
        try {
          await toggleHabitLog({ habitId: habit.id, date: dateKey });
        } catch {
          onToggle(habit.id, dateKey);
        }
        setTimeout(() => setAnimatingCell(null), 200);
      });
    },
    [habit.id, onToggle]
  );

  const openEdit = useCallback(() => setEditOpen(true), []);

  return (
    <tr className="group/row hover:bg-muted/30 transition-colors duration-100">
      <td className="py-1.5 pl-5 pr-2">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[13px] font-medium text-foreground/70 group-hover/row:text-foreground/90 transition-colors truncate">
            {habit.title}
          </span>
          <button
            onClick={openEdit}
            className="opacity-0 group-hover/row:opacity-100 transition-opacity p-0.5 rounded hover:bg-accent/10 text-muted-foreground/50 hover:text-foreground shrink-0"
            title="Edit habit"
          >
            <Pencil className="h-2.5 w-2.5" />
          </button>
          <button
            onClick={() => setStatsOpen(true)}
            className="opacity-0 group-hover/row:opacity-100 transition-opacity p-0.5 rounded hover:bg-accent/10 text-muted-foreground/50 hover:text-foreground shrink-0"
            title="Habit statistics"
          >
            <BarChart3 className="h-2.5 w-2.5" />
          </button>
          {editOpen && (
            <EditHabitDialog
              open={editOpen}
              onOpenChange={setEditOpen}
              habitId={habit.id}
              initialTitle={habit.title}
              initialActiveDays={habit.activeDays}
              onSaved={onHabitUpdated}
            />
          )}
          {statsOpen && (
            <ActivityDialog
              open={statsOpen}
              onOpenChange={setStatsOpen}
              habitIds={[habit.id]}
              title={habit.title}
            />
          )}
        </div>
      </td>
      {weekDays.map((day) => {
        const dateKey = formatDateKey(day);
        const dayLabel = getDayLabel(day) as DayLabel;
        const isActive = habit.activeDays.includes(dayLabel);
        const isDone = logMap.has(dateKey);
        const isToday = dateKey === today;
        const isAnimating = animatingCell === dateKey;

        return (
          <td key={dateKey} className="py-1.5 text-center">
            <button
              disabled={!isActive || isPending}
              onClick={() => handleToggle(dateKey)}
              className={cn(
                "mx-auto flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg transition-all duration-150",
                !isActive && "cursor-default bg-muted/20",
                isActive && !isDone && [
                  "border-2 cursor-pointer active:scale-90",
                  colors.border,
                  "hover:shadow-sm",
                  isToday ? cn("bg-primary/5 border-primary/30") : "hover:bg-muted/40",
                ],
                isActive && isDone && [
                  "bg-emerald-500 dark:bg-emerald-500 text-white cursor-pointer",
                  "hover:bg-emerald-600 active:scale-90",
                  "shadow-sm shadow-emerald-500/20",
                ],
                isAnimating && "animate-cell-pop",
                isPending && "opacity-50 pointer-events-none",
              )}
              title={
                !isActive
                  ? "Rest day"
                  : isDone
                  ? "Done — click to undo"
                  : "Click to mark done"
              }
            >
              {!isActive && (
                <span className="h-[3px] w-[3px] rounded-full bg-muted-foreground/10" />
              )}
              {isDone && <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />}
              {isActive && !isDone && (
                <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-0 group-hover/row:opacity-[0.12] text-muted-foreground transition-opacity" strokeWidth={2} />
              )}
            </button>
          </td>
        );
      })}
    </tr>
  );
});
