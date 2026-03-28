"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateTopicDialog } from "@/components/CreateTopicDialog";
import { CreateHabitDialog } from "@/components/CreateHabitDialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ChevronRight, ChevronDown, Trash2, GripVertical } from "lucide-react";
import { deleteTopic, reorderTopics, reorderHabits } from "@/app/actions/topics";
import { deleteHabit } from "@/app/actions/habits";
import { getTopicColors } from "@/lib/colors";
import { cn } from "@/lib/utils";
import type { TopicNode } from "@/lib/types";

interface TopicTreeProps {
  topics: TopicNode[];
  selectedHabitIds: Set<string>;
  onToggleHabit: (habitId: string) => void;
  onHabitDeleted?: (habitId: string) => void;
}

export function TopicTree({ topics: serverTopics, selectedHabitIds, onToggleHabit, onHabitDeleted }: TopicTreeProps) {
  const [optimisticTopics, setOptimisticTopics] = useState(serverTopics);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync with server data when it changes (e.g. after revalidation)
  useEffect(() => {
    setOptimisticTopics(serverTopics);
  }, [serverTopics]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  const handleTopicDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = optimisticTopics.findIndex((t) => t.id === active.id);
      const newIndex = optimisticTopics.findIndex((t) => t.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove(optimisticTopics, oldIndex, newIndex);
      setOptimisticTopics(newOrder);
      reorderTopics(newOrder.map((t) => t.id));
    },
    [optimisticTopics]
  );

  const handleOptimisticHabitReorder = useCallback(
    (topicId: string, reorderedHabits: TopicNode["habits"]) => {
      setOptimisticTopics((prev) =>
        prev.map((t) => (t.id === topicId ? { ...t, habits: reorderedHabits } : t))
      );
    },
    []
  );

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between px-2 py-2 mb-0.5">
        <h2 className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
          Topics
        </h2>
        <CreateTopicDialog />
      </div>

      {optimisticTopics.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/80">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted-foreground/50">
              <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground/70">No topics yet</p>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">
              Create your first topic to get started
            </p>
          </div>
        </div>
      )}

      <DndContext id="topics-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTopicDragEnd}>
        <SortableContext items={optimisticTopics.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {optimisticTopics.map((topic) => (
            <SortableTopicItem
              key={topic.id}
              topic={topic}
              isExpanded={expandedIds.has(topic.id)}
              selectedHabitIds={selectedHabitIds}
              deletingId={deletingId}
              onToggleExpanded={toggleExpanded}
              onToggleHabit={onToggleHabit}
              onDeleteTopic={handleDeleteTopic}
              onDeleteHabit={handleDeleteHabit}
              sensors={sensors}
              onOptimisticHabitReorder={handleOptimisticHabitReorder}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface SortableTopicItemProps {
  topic: TopicNode;
  isExpanded: boolean;
  selectedHabitIds: Set<string>;
  deletingId: string | null;
  onToggleExpanded: (id: string) => void;
  onToggleHabit: (id: string) => void;
  onDeleteTopic: (id: string, habitIds: string[]) => void;
  onDeleteHabit: (id: string) => void;
  sensors: ReturnType<typeof useSensors>;
  onOptimisticHabitReorder: (topicId: string, habits: TopicNode["habits"]) => void;
}

function SortableTopicItem({
  topic,
  isExpanded,
  selectedHabitIds,
  deletingId,
  onToggleExpanded,
  onToggleHabit,
  onDeleteTopic,
  onDeleteHabit,
  sensors,
  onOptimisticHabitReorder,
}: SortableTopicItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const colors = getTopicColors(topic.color);
  const selectedCount = topic.habits.filter((h) => selectedHabitIds.has(h.id)).length;

  const handleHabitDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = topic.habits.findIndex((h) => h.id === active.id);
      const newIndex = topic.habits.findIndex((h) => h.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove(topic.habits, oldIndex, newIndex);
      onOptimisticHabitReorder(topic.id, newOrder);
      reorderHabits(topic.id, newOrder.map((h) => h.id));
    },
    [topic.id, topic.habits, onOptimisticHabitReorder]
  );

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "group/topic flex items-center gap-1.5 rounded-lg px-2 py-[7px] hover:bg-accent/8 cursor-pointer select-none transition-colors duration-100",
          isDragging && "opacity-50 bg-accent/8"
        )}
        onClick={() => onToggleExpanded(topic.id)}
      >
        <button
          className="flex h-4 w-4 items-center justify-center shrink-0 cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover/topic:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3 w-3 text-muted-foreground/40" />
        </button>
        <span className={cn("h-2.5 w-2.5 rounded-full shrink-0 shadow-sm", colors.dot)} />
        <span className="flex h-4 w-4 items-center justify-center shrink-0">
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          )}
        </span>
        <span className="flex-1 truncate text-[13px] font-medium text-foreground/85">
          {topic.title}
        </span>
        {topic.habits.length > 0 && (
          <span className={cn(
            "flex h-[18px] items-center justify-center rounded-md px-1.5 text-[10px] font-medium tabular-nums",
            selectedCount > 0
              ? "bg-primary/10 text-primary"
              : "bg-muted/60 text-muted-foreground/40"
          )}>
            {selectedCount}/{topic.habits.length}
          </span>
        )}
        <div
          className="flex items-center gap-0.5 md:opacity-0 md:group-hover/topic:opacity-100 transition-opacity duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md text-muted-foreground/50 hover:text-destructive transition-colors"
                disabled={deletingId === topic.id}
                onClick={() => onDeleteTopic(topic.id, topic.habits.map((h) => h.id))}
              >
                <Trash2 className="h-3 w-3" />
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
        <div className="ml-[22px] border-l border-border/30 pl-2 mb-1">
          {topic.habits.length === 0 ? (
            <p className="py-2 pl-1 text-[11px] text-muted-foreground/40">
              No habits yet
            </p>
          ) : (
            <DndContext id={`habits-dnd-${topic.id}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleHabitDragEnd}>
              <SortableContext items={topic.habits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
                {topic.habits.map((habit) => (
                  <SortableHabitItem
                    key={habit.id}
                    habit={habit}
                    isSelected={selectedHabitIds.has(habit.id)}
                    isDeleting={deletingId === habit.id}
                    onToggle={onToggleHabit}
                    onDelete={onDeleteHabit}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
}

interface SortableHabitItemProps {
  habit: { id: string; title: string };
  isSelected: boolean;
  isDeleting: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function SortableHabitItem({ habit, isSelected, isDeleting, onToggle, onDelete }: SortableHabitItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/habit flex items-center gap-1.5 rounded-md px-1.5 py-[5px] hover:bg-accent/8 transition-colors duration-100",
        isDragging && "opacity-50 bg-accent/8"
      )}
    >
      <button
        className="flex h-3 w-3 items-center justify-center shrink-0 cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover/habit:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-2.5 w-2.5 text-muted-foreground/30" />
      </button>
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(habit.id)}
        className="shrink-0 h-3.5 w-3.5 rounded border-muted-foreground/25 data-[state=checked]:border-primary data-[state=checked]:bg-primary transition-colors"
      />
      <span className={cn(
        "flex-1 truncate text-[12px] transition-colors",
        isSelected ? "text-foreground/80 font-medium" : "text-muted-foreground/70"
      )}>
        {habit.title}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-md md:opacity-0 md:group-hover/habit:opacity-100 text-muted-foreground/40 hover:text-destructive transition-all shrink-0"
            disabled={isDeleting}
            onClick={() => onDelete(habit.id)}
          >
            <Trash2 className="h-2.5 w-2.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete habit</TooltipContent>
      </Tooltip>
    </div>
  );
}
