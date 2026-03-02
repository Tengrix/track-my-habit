"use client";

import { Button } from "@/components/ui/button";
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
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={onPrev} className="h-8 w-8">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={onToday} className="h-8 text-xs">
        Today
      </Button>
      <Button variant="outline" size="icon" onClick={onNext} className="h-8 w-8">
        <ChevronRight className="h-4 w-4" />
      </Button>
      <span className="ml-2 text-sm font-medium">
        {formatDateDisplay(weekStart)} – {formatDateDisplay(weekEnd)}
      </span>
    </div>
  );
}
