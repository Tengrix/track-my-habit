"use client";

import { useTransition } from "react";
import { toggleHabitLog } from "@/app/actions/habits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getWeekDays, getDayLabel, formatDateKey, type DayLabel } from "@/lib/week";
import { Check } from "lucide-react";
import type { HabitData, TopicSection } from "@/lib/types";

interface HabitWeekGridProps {
  sections: TopicSection[];
  weekStart: Date;
}

export function HabitWeekGrid({ sections, weekStart }: HabitWeekGridProps) {
  const weekDays = getWeekDays(weekStart);

  if (sections.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">
          Select topics from the sidebar to view habits.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => (
        <Card key={section.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {section.habits.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No habits yet. Add one from the sidebar.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="pb-2 pr-4 text-left font-medium text-muted-foreground min-w-[120px]">
                        Habit
                      </th>
                      {weekDays.map((day) => (
                        <th
                          key={day.toISOString()}
                          className="pb-2 text-center font-medium text-muted-foreground w-12"
                        >
                          <div>{getDayLabel(day)}</div>
                          <div className="text-xs font-normal">
                            {day.getDate()}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.habits.map((habit) => (
                      <HabitRow
                        key={habit.id}
                        habit={habit}
                        weekDays={weekDays}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function HabitRow({
  habit,
  weekDays,
}: {
  habit: HabitData;
  weekDays: Date[];
}) {
  const [isPending, startTransition] = useTransition();

  const logMap = new Map<string, boolean>();
  for (const log of habit.logs) {
    logMap.set(log.date, true);
  }

  function handleToggle(dateKey: string) {
    startTransition(async () => {
      await toggleHabitLog({ habitId: habit.id, date: dateKey });
    });
  }

  return (
    <tr className="border-t border-border">
      <td className="py-2 pr-4 font-medium">{habit.title}</td>
      {weekDays.map((day) => {
        const dateKey = formatDateKey(day);
        const dayLabel = getDayLabel(day) as DayLabel;
        const isActive = habit.activeDays.includes(dayLabel);
        const isDone = logMap.has(dateKey);

        return (
          <td key={dateKey} className="py-2 text-center">
            <button
              disabled={!isActive || isPending}
              onClick={() => handleToggle(dateKey)}
              className={cn(
                "mx-auto flex h-8 w-8 items-center justify-center rounded-md border transition-colors",
                !isActive && "cursor-not-allowed border-dashed border-muted bg-muted/30",
                isActive && !isDone && "border-border hover:bg-accent hover:border-primary/50 cursor-pointer",
                isActive && isDone && "border-primary bg-primary text-primary-foreground cursor-pointer",
                isPending && "opacity-50"
              )}
              title={
                !isActive
                  ? "Inactive day"
                  : isDone
                  ? "Done — click to undo"
                  : "Click to mark done"
              }
            >
              {isDone && <Check className="h-4 w-4" />}
            </button>
          </td>
        );
      })}
    </tr>
  );
}
