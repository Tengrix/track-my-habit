"use client";

import { useState } from "react";
import { createHabit } from "@/app/actions/habits";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DAY_LABELS, type DayLabel } from "@/lib/week";

interface CreateHabitDialogProps {
  topicId: string;
}

const ALL_DAYS = [...DAY_LABELS];
const SHORT_LABELS: Record<DayLabel, string> = {
  MON: "Mo",
  TUE: "Tu",
  WED: "We",
  THU: "Th",
  FRI: "Fr",
  SAT: "Sa",
  SUN: "Su",
};

export function CreateHabitDialog({ topicId }: CreateHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [activeDays, setActiveDays] = useState<DayLabel[]>([...ALL_DAYS]);
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
      await createHabit({ topicId, title: title.trim(), activeDays });
      setTitle("");
      setActiveDays([...ALL_DAYS]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-muted-foreground/50 hover:text-foreground transition-colors">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-base font-semibold">New Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5">
          <Input
            placeholder="e.g. Read 20 pages, Meditate, Push-ups..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10"
            autoFocus
          />
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-1 block">
              Active days
            </label>
            <p className="mb-3 text-[12px] text-muted-foreground/50 leading-relaxed">
              Unselected days appear as rest days in your grid.
            </p>
            <div className="flex gap-1.5">
              {ALL_DAYS.map((day) => {
                const isActive = activeDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "flex h-9 flex-1 items-center justify-center rounded-lg text-xs font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "bg-muted/60 text-muted-foreground/60 hover:bg-muted hover:text-foreground/70"
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
            className="h-9"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Habit"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
