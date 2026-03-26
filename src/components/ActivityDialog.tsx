"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { getActivityStats } from "@/app/actions/stats";
import { Flame, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityRange, ActivityStats } from "@/lib/types";

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitIds: string[];
  title?: string;
}

const RANGES: { value: ActivityRange; label: string }[] = [
  { value: "1m", label: "1M" },
  { value: "3m", label: "3M" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
];

export function ActivityDialog({ open, onOpenChange, habitIds, title }: ActivityDialogProps) {
  const [range, setRange] = useState<ActivityRange>("3m");
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (habitIds.length === 0) {
      setStats(null);
      return;
    }
    setLoading(true);
    try {
      const data = await getActivityStats({ habitIds, range });
      setStats(data);
    } finally {
      setLoading(false);
    }
  }, [habitIds, range]);

  useEffect(() => {
    if (open) fetchStats();
  }, [open, fetchStats]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] lg:max-w-5xl gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">{title ?? "Activity"}</DialogTitle>
            <div className="flex items-center gap-0.5 rounded-lg bg-muted/60 p-0.5">
              {RANGES.map((r) => (
                <Button
                  key={r.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => setRange(r.value)}
                  className={cn(
                    "h-7 px-2.5 text-[11px] font-semibold rounded-md transition-all",
                    range === r.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r.label}
                </Button>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          {habitIds.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <p className="text-sm text-muted-foreground">Select habits from the sidebar to view activity</p>
            </div>
          ) : loading || !stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-[72px] rounded-lg animate-shimmer" />
                ))}
              </div>
              <div className="h-[120px] rounded-lg animate-shimmer" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Stats cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  label="Completed"
                  value={stats.totalDone.toString()}
                  sub={`of ${stats.totalPossible}`}
                  color="text-emerald-500"
                />
                <StatCard
                  icon={<Target className="h-3.5 w-3.5" />}
                  label="Completion"
                  value={`${stats.completionRate}%`}
                  color="text-blue-500"
                />
                <StatCard
                  icon={<Flame className="h-3.5 w-3.5" />}
                  label="Current Streak"
                  value={`${stats.currentStreak}d`}
                  color="text-orange-500"
                />
                <StatCard
                  icon={<TrendingUp className="h-3.5 w-3.5" />}
                  label="Best Streak"
                  value={`${stats.longestStreak}d`}
                  color="text-violet-500"
                />
              </div>

              {/* Heatmap */}
              <div className="overflow-x-auto">
                <ActivityHeatmap days={stats.days} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/20 px-3.5 py-3">
      <div className={cn("flex items-center gap-1.5 mb-1.5", color)}>
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold tabular-nums tracking-tight">{value}</span>
        {sub && <span className="text-[11px] text-muted-foreground/50">{sub}</span>}
      </div>
    </div>
  );
}
