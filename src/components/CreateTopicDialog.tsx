"use client";

import { useState } from "react";
import { createTopic } from "@/app/actions/topics";
import { TOPIC_COLORS } from "@/lib/colors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Plus, Loader2 } from "lucide-react";
import { TOPIC_COLOR_MAP } from "@/lib/colors";
import { cn } from "@/lib/utils";

export function CreateTopicDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<string>("slate");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createTopic({ title: title.trim(), color });
      setTitle("");
      setColor("slate");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-muted-foreground/50 hover:text-foreground transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>New topic</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[420px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-base font-semibold">New Topic</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5">
          <Input
            placeholder="e.g. Morning Routine, Fitness, Learning..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10"
            autoFocus
          />
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-2.5 block">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {TOPIC_COLORS.map((c) => {
                const colors = TOPIC_COLOR_MAP[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-7 w-7 rounded-full transition-all duration-150",
                      colors?.dot,
                      color === c
                        ? "ring-2 ring-offset-2 ring-offset-background ring-foreground/30 scale-110"
                        : "opacity-50 hover:opacity-80 hover:scale-105"
                    )}
                    title={c}
                  />
                );
              })}
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading || !title.trim()}
            className="h-9"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Topic"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
