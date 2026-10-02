"use client";

import type { CountdownState } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";

interface RunnerHeaderProps {
  title: string;
  questionIndex: number;
  totalQuestions: number;
  countdown: CountdownState;
  /** Whether an autosave is in flight. */
  saving: boolean;
  /** ISO timestamp of the last successful save. */
  lastSaved: Date | null;
  /** Whether there are unsaved changes. */
  dirty: boolean;
}

const WARNING_CLASS: Record<CountdownState["warningLevel"], string> = {
  normal: "text-muted-foreground",
  warning: "text-amber-500",
  critical: "text-destructive",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function RunnerHeader({
  title,
  questionIndex,
  totalQuestions,
  countdown,
  saving,
  lastSaved,
  dirty,
}: RunnerHeaderProps) {
  const timeLabel = saving
    ? "Saving…"
    : lastSaved
      ? `Saved ${timeAgo(lastSaved)}`
      : "All changes saved";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-4 overflow-hidden">
        <h1 className="font-heading text-sm font-semibold tracking-tight truncate">
          {title}
        </h1>
        <span className="font-mono text-xs text-muted-foreground">
          Question <span className="tabular-nums">{questionIndex + 1}</span> of{" "}
          <span className="tabular-nums">{totalQuestions}</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <output
          aria-live="polite"
          aria-label={countdown.expired ? "Time expired" : "Time remaining"}
          className="flex items-center gap-2"
        >
          <span
            className={cn(
              "font-mono text-sm tabular-nums",
              countdown.expired
                ? "text-destructive"
                : WARNING_CLASS[countdown.warningLevel],
            )}
          >
            {countdown.label}
          </span>
          {countdown.expired ? null : (
            <div className="h-1.5 w-16 overflow-hidden rounded-none bg-muted">
              <div
                aria-hidden
                className="h-full bg-primary transition-all"
                style={{ width: `${countdown.percentRemaining * 100}%` }}
              />
            </div>
          )}
        </output>

        <output
          aria-label={timeLabel}
          className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground"
          title={
            lastSaved
              ? `Last saved at ${lastSaved.toLocaleTimeString()}`
              : undefined
          }
        >
          <span
            aria-hidden
            className={cn(
              "size-2 rounded-full",
              dirty ? "bg-amber-500" : "bg-emerald-500",
              saving && "animate-pulse",
            )}
          />
          {timeLabel}
        </output>
      </div>
    </header>
  );
}
