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
    <div className="flex items-center gap-1.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrev}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
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
            className="h-8 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5" />
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
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Next week</TooltipContent>
      </Tooltip>
      <div className="ml-1 rounded-lg bg-secondary/80 px-3 py-1.5">
        <span className="text-sm font-medium tracking-tight">
          {formatDateDisplay(weekStart)} – {formatDateDisplay(weekEnd)}
        </span>
      </div>
    </div>
  );
}
