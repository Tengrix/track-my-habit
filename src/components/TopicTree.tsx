"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateTopicDialog } from "@/components/CreateTopicDialog";
import { CreateHabitDialog } from "@/components/CreateHabitDialog";
import { Separator } from "@/components/ui/separator";
import { FolderTree, ChevronRight, ChevronDown } from "lucide-react";
import type { TopicNode } from "@/lib/types";

interface TopicTreeProps {
  topics: TopicNode[];
  selectedHabitIds: Set<string>;
  onToggleHabit: (habitId: string) => void;
}

export function TopicTree({ topics, selectedHabitIds, onToggleHabit }: TopicTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function toggleExpanded(topicId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-2 pb-2">
        <div className="flex items-center gap-1.5">
          <FolderTree className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Topics
          </h2>
        </div>
        <CreateTopicDialog />
      </div>
      <Separator />
      <div className="mt-2 flex flex-col">
        {topics.length === 0 && (
          <p className="px-2 py-4 text-sm text-muted-foreground text-center">
            No topics yet. Create one to get started.
          </p>
        )}
        {topics.map((topic, index) => {
          const isLast = index === topics.length - 1;
          const isExpanded = expandedIds.has(topic.id);
          return (
            <div key={topic.id} className="relative">
              {/* Topic row */}
              <div className="relative flex items-stretch">
                {/* Trunk line */}
                {!isLast && (
                  <div className="absolute left-[18px] top-0 bottom-0 w-px bg-muted-foreground/30" />
                )}
                {isLast && !isExpanded && (
                  <div className="absolute left-[18px] top-0 h-[50%] w-px bg-muted-foreground/30" />
                )}
                {isLast && isExpanded && (
                  <div className="absolute left-[18px] top-0 bottom-0 w-px bg-muted-foreground/30" />
                )}

                {/* Branch connector */}
                <div className="flex items-center shrink-0" style={{ width: 38 }}>
                  <div className="relative flex items-center h-full w-full">
                    <div className="absolute left-[18px] w-[14px] h-px bg-muted-foreground/30" />
                  </div>
                </div>

                {/* Topic row content */}
                <div
                  className="flex-1 flex items-center gap-1.5 rounded-md px-1 py-1.5 hover:bg-accent min-w-0 cursor-pointer select-none"
                  onClick={() => toggleExpanded(topic.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="flex-1 truncate text-sm font-medium">
                    {topic.title}
                  </span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <CreateHabitDialog topicId={topic.id} />
                  </div>
                </div>
              </div>

              {/* Expanded habits */}
              {isExpanded && topic.habits.length > 0 && (
                <div className="relative">
                  {topic.habits.map((habit, hIndex) => {
                    const isLastHabit = hIndex === topic.habits.length - 1;
                    return (
                      <div key={habit.id} className="relative flex items-stretch">
                        {/* Trunk continuation from topic level */}
                        {!isLast && (
                          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-muted-foreground/30" />
                        )}
                        {isLast && !isLastHabit && (
                          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-muted-foreground/30" />
                        )}
                        {isLast && isLastHabit && (
                          <div className="absolute left-[18px] top-0 h-[50%] w-px bg-muted-foreground/30" />
                        )}

                        {/* Spacer for topic-level indent */}
                        <div className="shrink-0" style={{ width: 38 }} />

                        {/* Habit branch connector */}
                        <div className="flex items-center shrink-0" style={{ width: 24 }}>
                          <div className="relative flex items-center h-full w-full">
                            {/* Vertical line for habit sub-tree */}
                            {!isLastHabit && (
                              <div className="absolute left-[4px] top-0 bottom-0 w-px bg-muted-foreground/30" />
                            )}
                            {isLastHabit && (
                              <div className="absolute left-[4px] top-0 h-[50%] w-px bg-muted-foreground/30" />
                            )}
                            {/* Horizontal branch */}
                            <div className="absolute left-[4px] w-[16px] h-px bg-muted-foreground/30" />
                          </div>
                        </div>

                        {/* Habit row */}
                        <div className="flex-1 flex items-center gap-1.5 rounded-md px-1 py-1 hover:bg-accent min-w-0">
                          <Checkbox
                            checked={selectedHabitIds.has(habit.id)}
                            onCheckedChange={() => onToggleHabit(habit.id)}
                            className="shrink-0"
                          />
                          <span className="truncate text-sm">
                            {habit.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty state when expanded with no habits */}
              {isExpanded && topic.habits.length === 0 && (
                <div className="relative flex items-stretch">
                  {!isLast && (
                    <div className="absolute left-[18px] top-0 bottom-0 w-px bg-muted-foreground/30" />
                  )}
                  <div className="shrink-0" style={{ width: 62 }} />
                  <p className="py-1 text-xs text-muted-foreground italic">
                    No habits yet
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
