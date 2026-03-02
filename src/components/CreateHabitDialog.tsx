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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { DAY_LABELS, type DayLabel } from "@/lib/week";

interface CreateHabitDialogProps {
  topicId: string;
}

const ALL_DAYS = [...DAY_LABELS];

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
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
          <Plus className="h-3 w-3" />
          Habit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            placeholder="Habit name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <div>
            <p className="mb-2 text-sm font-medium">Active days</p>
            <div className="flex gap-3 flex-wrap">
              {ALL_DAYS.map((day) => (
                <label key={day} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <Checkbox
                    checked={activeDays.includes(day)}
                    onCheckedChange={() => toggleDay(day)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={loading || !title.trim() || activeDays.length === 0}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
