"use client";

import { useState, useTransition, useMemo, useCallback, memo } from "react";
import { toggleHabitLog } from "@/app/actions/habits";
import { cn } from "@/lib/utils";
import { getWeekDays, getDayLabel, formatDateKey, type DayLabel } from "@/lib/week";
import { Check, Inbox, X, Pencil } from "lucide-react";
import type { HabitData, TopicSection } from "@/lib/types";
import { EditHabitDialog } from "@/components/EditHabitDialog";

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
      <div className="flex flex-col items-center justify-center py-20 sm:py-28 gap-5 animate-fade-in px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/10">
          <Inbox className="h-7 w-7 text-primary/50" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground/70">Your week is wide open</p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Select habits from the sidebar to start tracking
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
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
      className="animate-fade-in rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/30">
        <h3 className="text-[13px] font-semibold tracking-tight flex-1 truncate">
          {section.title}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500 animate-progress"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
            {done}/{total}
          </span>
        </div>
      </div>

      {section.habits.length === 0 ? (
        <p className="px-4 py-3 text-xs text-muted-foreground">
          No habits yet. Add one from the sidebar.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="py-1.5 pl-4 pr-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground min-w-[90px] sm:min-w-[120px]">
                  Habit
                </th>
                {weekDays.map((day) => {
                  const dateKey = formatDateKey(day);
                  const isToday = dateKey === today;
                  return (
                    <th key={day.toISOString()} className="py-1.5 text-center w-8 sm:w-10">
                      <div
                        className={cn(
                          "inline-flex flex-col items-center rounded-md px-1 py-0.5",
                          isToday && "bg-primary/10"
                        )}
                      >
                        <span
                          className={cn(
                            "text-[9px] font-semibold uppercase tracking-wider leading-none",
                            isToday ? "text-primary" : "text-muted-foreground/70"
                          )}
                        >
                          {getDayLabel(day).slice(0, 2)}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-medium leading-tight",
                            isToday ? "text-primary font-bold" : "text-muted-foreground/50"
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
                  onToggle={onToggle}
                  onHabitUpdated={onHabitUpdated}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

interface HabitRowProps {
  habit: HabitData;
  weekDays: Date[];
  today: string;
  onToggle: (habitId: string, dateKey: string) => void;
  onHabitUpdated?: () => void;
}

const HabitRow = memo(function HabitRow({
  habit,
  weekDays,
  today,
  onToggle,
  onHabitUpdated,
}: HabitRowProps) {
  const [isPending, startTransition] = useTransition();
  const [animatingCell, setAnimatingCell] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

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
          // Rollback optimistic update on failure
          onToggle(habit.id, dateKey);
        }
        setTimeout(() => setAnimatingCell(null), 250);
      });
    },
    [habit.id, onToggle]
  );

  const openEdit = useCallback(() => setEditOpen(true), []);

  return (
    <tr className="group/row hover:bg-accent/30 transition-colors">
      <td className="py-1 pl-4 pr-2">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-xs font-medium text-foreground/75 group-hover/row:text-foreground transition-colors truncate">
            {habit.title}
          </span>
          <button
            onClick={openEdit}
            className="opacity-0 group-hover/row:opacity-100 transition-opacity p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground shrink-0"
            title="Edit habit"
          >
            <Pencil className="h-2.5 w-2.5" />
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
          <td key={dateKey} className="py-1 text-center">
            <button
              disabled={!isActive || isPending}
              onClick={() => handleToggle(dateKey)}
              className={cn(
                "mx-auto flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md transition-all duration-150",
                !isActive && "cursor-default bg-muted/40 border border-dashed border-border/30",
                isActive && !isDone && [
                  "border border-border/40 hover:border-primary/40 hover:bg-primary/5 active:scale-95 cursor-pointer",
                  isToday && "border-primary/25 bg-primary/[0.03]",
                ],
                isActive && isDone && [
                  "bg-emerald-500 text-white cursor-pointer shadow-sm shadow-emerald-500/20",
                  "hover:bg-emerald-600 active:scale-95",
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
                <X className="h-2.5 w-2.5 text-muted-foreground/30" strokeWidth={2} />
              )}
              {isDone && <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={3} />}
              {isActive && !isDone && (
                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-0 group-hover/row:opacity-15 text-muted-foreground transition-opacity" strokeWidth={2} />
              )}
            </button>
          </td>
        );
      })}
    </tr>
  );
});
