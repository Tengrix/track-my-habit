"use client";

import { useState } from "react";
import { updateHabit } from "@/app/actions/habits";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DAY_LABELS, type DayLabel } from "@/lib/week";

interface EditHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitId: string;
  initialTitle: string;
  initialActiveDays: string[];
  onSaved?: () => void;
}

const SHORT_LABELS: Record<DayLabel, string> = {
  MON: "Mo",
  TUE: "Tu",
  WED: "We",
  THU: "Th",
  FRI: "Fr",
  SAT: "Sa",
  SUN: "Su",
};

export function EditHabitDialog({
  open,
  onOpenChange,
  habitId,
  initialTitle,
  initialActiveDays,
  onSaved,
}: EditHabitDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [activeDays, setActiveDays] = useState<DayLabel[]>(
    initialActiveDays as DayLabel[]
  );
  const [loading, setLoading] = useState(false);

  function toggleDay(day: DayLabel) {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || activeDays.length === 0) return;
    setLoading(true);
    try {
      await updateHabit({ habitId, title: title.trim(), activeDays });
      onOpenChange(false);
      onSaved?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Edit Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            placeholder="e.g. Read 20 pages, Meditate, Push-ups..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10"
            autoFocus
          />
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active days
            </p>
            <p className="mb-2.5 text-[11px] text-muted-foreground/70">
              Select which days of the week you plan to do this habit. Unselected
              days will appear as rest days in your weekly grid.
            </p>
            <div className="flex gap-1.5">
              {DAY_LABELS.map((day) => {
                const isActive = activeDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {SHORT_LABELS[day]}
                  </button>
                );
              })}
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading || !title.trim() || activeDays.length === 0}
            className="h-9 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
