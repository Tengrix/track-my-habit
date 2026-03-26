"use client";

import { useMemo } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatDateKey } from "@/lib/week";
import type { DayActivity } from "@/lib/types";

interface ActivityHeatmapProps {
  days: DayActivity[];
}

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getIntensityClass(ratio: number, total: number, isFuture: boolean): string {
  if (isFuture) return "bg-muted/15";
  if (total === 0) return "bg-muted/15";
  if (ratio === 0) return "bg-muted/40 dark:bg-muted/30";
  if (ratio <= 0.25) return "bg-emerald-200 dark:bg-emerald-900/50";
  if (ratio <= 0.5) return "bg-emerald-300 dark:bg-emerald-700/60";
  if (ratio <= 0.75) return "bg-emerald-400 dark:bg-emerald-600/80";
  return "bg-emerald-500 dark:bg-emerald-500";
}

export function ActivityHeatmap({ days }: ActivityHeatmapProps) {
  const today = useMemo(() => formatDateKey(new Date()), []);

  const { weeks, monthLabels } = useMemo(() => {
    if (days.length === 0) return { weeks: [], monthLabels: [] };

    // Group days into weeks (7 days per week, starting Monday)
    const weeksList: DayActivity[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeksList.push(days.slice(i, i + 7));
    }

    // Compute month labels with column positions
    const labels: { label: string; col: number }[] = [];
    let lastMonth = "";
    for (let w = 0; w < weeksList.length; w++) {
      const firstDay = weeksList[w][0];
      if (!firstDay) continue;
      const date = new Date(firstDay.date + "T00:00:00");
      const month = date.toLocaleDateString("en-US", { month: "short" });
      if (month !== lastMonth) {
        labels.push({ label: month, col: w });
        lastMonth = month;
      }
    }

    return { weeks: weeksList, monthLabels: labels };
  }, [days]);

  if (weeks.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      {/* Month labels */}
      <div className="flex">
        <div className="w-7 shrink-0" />
        <div className="flex gap-[3px] relative overflow-hidden" style={{ minWidth: weeks.length * 15 }}>
          {monthLabels.map((m, i) => (
            <span
              key={i}
              className="absolute text-[10px] text-muted-foreground/60 font-medium"
              style={{ left: m.col * 15 }}
            >
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex gap-0 overflow-x-auto pb-1">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] shrink-0 pr-1.5 pt-px">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-[12px] w-5 flex items-center">
              <span className="text-[9px] text-muted-foreground/50 font-medium leading-none">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Week columns */}
        <div className="flex gap-[3px]">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-[3px]">
              {week.map((day) => {
                const isFuture = day.date > today;
                const isToday = day.date === today;
                return (
                  <Tooltip key={day.date}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "h-[12px] w-[12px] rounded-[2px] transition-colors",
                          getIntensityClass(day.ratio, day.total, isFuture),
                          isToday && "ring-1 ring-foreground/30",
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-medium">{formatTooltipDate(day.date)}</p>
                      {isFuture ? (
                        <p className="text-muted-foreground">Future</p>
                      ) : day.total === 0 ? (
                        <p className="text-muted-foreground">No active habits</p>
                      ) : (
                        <p className="text-muted-foreground">
                          {day.done}/{day.total} completed ({Math.round(day.ratio * 100)}%)
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-[10px] text-muted-foreground/50">Less</span>
        <div className="h-[10px] w-[10px] rounded-[2px] bg-muted/40" />
        <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-200 dark:bg-emerald-900/50" />
        <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-300 dark:bg-emerald-700/60" />
        <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-400 dark:bg-emerald-600/80" />
        <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-500 dark:bg-emerald-500" />
        <span className="text-[10px] text-muted-foreground/50">More</span>
      </div>
    </div>
  );
}

function formatTooltipDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
