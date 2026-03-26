"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrev}
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Previous week</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onToday}
              className="h-7 rounded-md px-2.5 text-[11px] font-medium border-border/60"
            >
              Today
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
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Next week</TooltipContent>
        </Tooltip>
      </div>
      <span className="text-[12px] sm:text-[13px] font-medium text-muted-foreground tabular-nums truncate">
        {formatDateDisplay(weekStart)} – {formatDateDisplay(weekEnd)}
      </span>
    </div>
  );
}
