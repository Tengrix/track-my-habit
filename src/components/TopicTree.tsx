"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateTopicDialog } from "@/components/CreateTopicDialog";
import { CreateHabitDialog } from "@/components/CreateHabitDialog";
import { Separator } from "@/components/ui/separator";
import type { TopicNode } from "@/lib/types";

interface TopicTreeProps {
  topics: TopicNode[];
  selectedIds: Set<string>;
  onToggleSubtopic: (subtopicId: string) => void;
  onToggleTopic: (topicId: string, childIds: string[]) => void;
}

export function TopicTree({
  topics,
  selectedIds,
  onToggleSubtopic,
  onToggleTopic,
}: TopicTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(topics.map((t) => t.id))
  );

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function isTopicChecked(topic: TopicNode): boolean | "indeterminate" {
    if (topic.children.length === 0) return false;
    const allSelected = topic.children.every((c) => selectedIds.has(c.id));
    const someSelected = topic.children.some((c) => selectedIds.has(c.id));
    if (allSelected) return true;
    if (someSelected) return "indeterminate";
    return false;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-2 pb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Topics
        </h2>
        <CreateTopicDialog parentId={null} label="Topic" />
      </div>
      <Separator />
      <div className="mt-2 flex flex-col gap-0.5">
        {topics.length === 0 && (
          <p className="px-2 py-4 text-sm text-muted-foreground text-center">
            No topics yet. Create one to get started.
          </p>
        )}
        {topics.map((topic) => {
          const isExpanded = expanded.has(topic.id);
          const checked = isTopicChecked(topic);
          const childIds = topic.children.map((c) => c.id);

          return (
            <div key={topic.id}>
              <div className="flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-accent">
                <button
                  onClick={() => toggleExpand(topic.id)}
                  className="shrink-0 p-0.5 text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggleTopic(topic.id, childIds)}
                  className="shrink-0"
                />
                <span className="flex-1 truncate text-sm font-medium">
                  {topic.title}
                </span>
                <CreateTopicDialog parentId={topic.id} label="Sub" />
              </div>

              {isExpanded && topic.children.length > 0 && (
                <div className="ml-6 flex flex-col gap-0.5">
                  {topic.children.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent"
                    >
                      <Checkbox
                        checked={selectedIds.has(sub.id)}
                        onCheckedChange={() => onToggleSubtopic(sub.id)}
                        className="shrink-0"
                      />
                      <span className="flex-1 truncate text-sm">
                        {sub.title}
                      </span>
                      <CreateHabitDialog topicId={sub.id} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
