"use client";

import { useState } from "react";
import { createTopic } from "@/app/actions/topics";
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

export function CreateTopicDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await createTopic({ title: title.trim() });
      setTitle("");
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
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>New topic</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">New Topic</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            placeholder="e.g. Morning Routine, Fitness, Learning..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10"
            autoFocus
          />
          <Button
            type="submit"
            disabled={loading || !title.trim()}
            className="h-9 transition-all"
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
