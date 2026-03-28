"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50 px-4 py-2 text-[13px] text-amber-800 dark:text-amber-200">
      <span className="flex-1 min-w-0">
        You&apos;re in demo mode — data is stored locally in this browser.{" "}
        <Link href="/sign-in" className="font-semibold underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-100">
          Sign in
        </Link>{" "}
        to save your progress permanently.
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40"
        onClick={() => setDismissed(true)}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
