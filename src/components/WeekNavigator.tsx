"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { formatDateDisplay, getWeekEnd } from "@/lib/week";

interface WeekNavigatorProps {
  weekStart: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function WeekNavigator({ weekStart, onPrev, onNext, onToday }: WeekNavigatorProps) {
  const weekEnd = getWeekEnd(weekStart);

  return (
    <div className="flex items-center gap-1 min-w-0">
      <div className="flex items-center rounded-lg border border-border/50 bg-secondary/50 p-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrev}
              className="h-6 w-6 sm:h-7 sm:w-7 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Previous week</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToday}
              className="h-6 sm:h-7 rounded-md px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors gap-1"
            >
              <Calendar className="h-3 w-3" />
              <span className="hidden xs:inline">Today</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Jump to today</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="h-6 w-6 sm:h-7 sm:w-7 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Next week</TooltipContent>
        </Tooltip>
      </div>
      <div className="ml-1.5 rounded-lg bg-secondary/60 px-2.5 py-1 min-w-0">
        <span className="text-[11px] sm:text-xs font-semibold tracking-tight text-foreground/70 truncate block tabular-nums">
          {formatDateDisplay(weekStart)} – {formatDateDisplay(weekEnd)}
        </span>
      </div>
    </div>
  );
}
