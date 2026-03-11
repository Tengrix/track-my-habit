"use client";

import { useState, useTransition } from "react";
import { toggleHabitLog } from "@/app/actions/habits";
import { cn } from "@/lib/utils";
import { getWeekDays, getDayLabel, formatDateKey, type DayLabel } from "@/lib/week";
import { Check, Inbox } from "lucide-react";
import type { HabitData, TopicSection } from "@/lib/types";

interface HabitWeekGridProps {
  sections: TopicSection[];
  weekStart: Date;
  onToggle:(habitId:string, dateKey:string)=>void;
}

export function HabitWeekGrid({ sections, weekStart, onToggle }: HabitWeekGridProps) {
  const weekDays = getWeekDays(weekStart);
  const today = formatDateKey(new Date());

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4 animate-fade-in px-4">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-secondary">
          <Inbox className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">Your week is wide open</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Pick some habits from the sidebar to start tracking
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {sections.map((section, idx) => (
        <div
          key={section.id}
          className="animate-fade-in rounded-xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
          style={{ animationDelay: `${idx * 60}ms` }}
        >
          <div className="border-b border-border/40 px-5 py-3.5">
            <h3 className="text-sm font-semibold tracking-tight">{section.title}</h3>
          </div>
          <div className="p-3 sm:p-4">
            {section.habits.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">
                No habits yet. Add one from the sidebar.
              </p>
            ) : (
              <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="pb-2 sm:pb-3 pr-2 sm:pr-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground min-w-[100px] sm:min-w-[140px]">
                        Habit
                      </th>
                      {weekDays.map((day) => {
                        const dateKey = formatDateKey(day);
                        const isToday = dateKey === today;
                        return (
                          <th key={day.toISOString()} className="pb-2 sm:pb-3 text-center w-9 sm:w-12">
                            <div
                              className={cn(
                                "inline-flex flex-col items-center rounded-lg px-1 sm:px-1.5 py-0.5 transition-colors",
                                isToday && "bg-primary/12 ring-1 ring-primary/20"
                              )}
                            >
                              <span
                                className={cn(
                                  "text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider",
                                  isToday ? "text-primary" : "text-muted-foreground"
                                )}
                              >
                                {getDayLabel(day).slice(0, 2)}
                              </span>
                              <span
                                className={cn(
                                  "text-[10px] sm:text-xs font-medium",
                                  isToday ? "text-primary font-bold" : "text-muted-foreground/70"
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
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function HabitRow({
  habit,
  weekDays,
  today,
  onToggle
}: {
  habit: HabitData;
  weekDays: Date[];
  today: string;
  onToggle:(habitId:string, dateKey:string)=>void;
}) {
  const [isPending, startTransition] = useTransition();
  const [animatingCell, setAnimatingCell] = useState<string | null>(null);

  const logMap = new Map<string, boolean>();
  for (const log of habit.logs) {
    logMap.set(log.date, true);
  }

  function handleToggle(dateKey: string) {
    setAnimatingCell(dateKey);
    startTransition(async () => {
      await toggleHabitLog({ habitId: habit.id, date: dateKey });
      setTimeout(() => setAnimatingCell(null), 300);
    });
    onToggle(habit.id,dateKey)
  }

  return (
    <tr className="group/row">
      <td className="py-1 sm:py-1.5 pr-2 sm:pr-4">
        <span className="text-xs sm:text-[13px] font-medium text-foreground/80 group-hover/row:text-foreground transition-colors line-clamp-1">
          {habit.title}
        </span>
      </td>
      {weekDays.map((day) => {
        const dateKey = formatDateKey(day);
        const dayLabel = getDayLabel(day) as DayLabel;
        const isActive = habit.activeDays.includes(dayLabel);
        const isDone = logMap.has(dateKey);
        const isToday = dateKey === today;
        const isAnimating = animatingCell === dateKey;

        return (
          <td key={dateKey} className="py-1 sm:py-1.5 text-center">
            <button
              disabled={!isActive || isPending}
              onClick={() => handleToggle(dateKey)}
              className={cn(
                "group/cell mx-auto flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-md sm:rounded-lg border transition-all duration-150",
                !isActive && "cursor-not-allowed border-transparent bg-muted/50",
                isActive && !isDone && [
                  "border-border/60 hover:border-primary/40 hover:bg-primary/5 active:bg-primary/10 cursor-pointer",
                  isToday && "border-primary/30 ring-1 ring-primary/10",
                ],
                isActive && isDone && [
                  "border-transparent bg-emerald-500 text-white cursor-pointer shadow-sm shadow-emerald-500/25",
                  "hover:bg-emerald-600 active:bg-emerald-700",
                ],
                isAnimating && "animate-cell-pop",
                isPending && "opacity-60",
                "group-hover/row:bg-accent/30",
                isActive && isDone && "group-hover/row:bg-emerald-500",
              )}
              title={
                !isActive
                  ? "Rest day"
                  : isDone
                  ? "Done — click to undo"
                  : "Click to mark done"
              }
            >
              {isDone && <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />}
              {isActive && !isDone && (
                <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-0 group-hover/cell:opacity-20 text-muted-foreground transition-opacity" strokeWidth={2} />
              )}
            </button>
          </td>
        );
      })}
    </tr>
  );
}
