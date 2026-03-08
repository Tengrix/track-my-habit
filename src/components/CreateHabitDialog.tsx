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
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground transition-colors">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">New Habit</DialogTitle>
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
            <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active days
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
