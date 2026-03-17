"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateTopicDialog } from "@/components/CreateTopicDialog";
import { CreateHabitDialog } from "@/components/CreateHabitDialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ChevronRight, ChevronDown, Trash2, Layers } from "lucide-react";
import { deleteTopic } from "@/app/actions/topics";
import { deleteHabit } from "@/app/actions/habits";
import type { TopicNode } from "@/lib/types";

interface TopicTreeProps {
  topics: TopicNode[];
  selectedHabitIds: Set<string>;
  onToggleHabit: (habitId: string) => void;
  onHabitDeleted?: (habitId: string) => void;
}

export function TopicTree({ topics, selectedHabitIds, onToggleHabit, onHabitDeleted }: TopicTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function toggleExpanded(topicId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  }

  async function handleDeleteTopic(topicId: string, habitIds: string[]) {
    setDeletingId(topicId);
    try {
      await deleteTopic(topicId);
      for (const hId of habitIds) {
        onHabitDeleted?.(hId);
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteHabit(habitId: string) {
    setDeletingId(habitId);
    try {
      await deleteHabit(habitId);
      onHabitDeleted?.(habitId);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between px-2 py-1.5 mb-0.5">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3 w-3 text-muted-foreground/70" />
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Topics{topics.length > 0 && <span className="ml-1 opacity-60">({topics.length})</span>}
          </h2>
        </div>
        <CreateTopicDialog />
      </div>

      {topics.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/10">
            <Layers className="h-4 w-4 text-primary/40" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">No topics yet</p>
          <p className="text-[11px] text-muted-foreground/60 text-center">
            Hit the + button above to create your first topic
          </p>
        </div>
      )}

      {topics.map((topic) => {
        const isExpanded = expandedIds.has(topic.id);
        const selectedCount = topic.habits.filter((h) => selectedHabitIds.has(h.id)).length;
        return (
          <div key={topic.id}>
            <div
              className="group/topic flex items-center gap-1 rounded-lg px-2 py-1.5 hover:bg-accent/10 cursor-pointer select-none transition-colors"
              onClick={() => toggleExpanded(topic.id)}
            >
              <span className="flex h-4 w-4 items-center justify-center shrink-0">
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
                )}
              </span>
              <span className="flex-1 truncate text-xs font-medium">
                {topic.title}
              </span>
              {selectedCount > 0 && !isExpanded && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1 text-[9px] font-bold text-primary tabular-nums">
                  {selectedCount}
                </span>
              )}
              <div
                className="flex items-center gap-0.5 md:opacity-0 md:group-hover/topic:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded text-muted-foreground hover:text-destructive transition-colors"
                      disabled={deletingId === topic.id}
                      onClick={() => handleDeleteTopic(topic.id, topic.habits.map((h) => h.id))}
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete topic</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <CreateHabitDialog topicId={topic.id} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Add habit</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {isExpanded && (
              <div className="ml-4 border-l border-border/40 pl-1 mb-0.5">
                {topic.habits.length === 0 ? (
                  <p className="py-1.5 pl-2 text-[11px] text-muted-foreground/50 italic">
                    No habits — add one above
                  </p>
                ) : (
                  topic.habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="group/habit flex items-center gap-1.5 rounded-md px-2 py-0.5 hover:bg-accent/10 transition-colors"
                    >
                      <Checkbox
                        checked={selectedHabitIds.has(habit.id)}
                        onCheckedChange={() => onToggleHabit(habit.id)}
                        className="shrink-0 h-3 w-3 rounded-[3px] border-muted-foreground/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary transition-colors"
                      />
                      <span className="flex-1 truncate text-[11px] text-foreground/70">
                        {habit.title}
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 rounded md:opacity-0 md:group-hover/habit:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
                            disabled={deletingId === habit.id}
                            onClick={() => handleDeleteHabit(habit.id)}
                          >
                            <Trash2 className="h-2 w-2" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete habit</TooltipContent>
                      </Tooltip>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
