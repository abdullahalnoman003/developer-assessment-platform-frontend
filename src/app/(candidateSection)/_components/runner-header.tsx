"use client";

import type { CountdownState } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";

interface RunnerHeaderProps {
  title: string;
  questionIndex: number;
  totalQuestions: number;
  countdown: CountdownState;
  saving: boolean;
  lastSaved: Date | null;
  dirty: boolean;
}

const WARNING_CLASS: Record<CountdownState["warningLevel"], string> = {
  normal: "text-muted-foreground",
  warning: "text-warning",
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

function spokenRemaining(countdown: CountdownState): string {
  if (countdown.expired) return "Time expired";
  const match = /^(\d+):(\d+):(\d+)$/.exec(countdown.label);
  if (!match) return countdown.label;
  const [, hours, minutes] = match;
  const total = Number(hours) * 60 + Number(minutes);
  if (total <= 0) return "Less than a minute remaining";
  const hoursLeft = Math.floor(total / 60);
  const minutesLeft = total % 60;
  const parts = [
    hoursLeft > 0 ? `${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}` : "",
    minutesLeft > 0
      ? `${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}`
      : "",
  ].filter(Boolean);
  return `${parts.join(" ")} remaining`;
}

function spokenSaveState(
  saving: boolean,
  dirty: boolean,
  lastSaved: Date | null,
): string {
  if (saving) return "Saving your answers";
  if (dirty) return "Unsaved changes";
  if (lastSaved) return "All changes saved";
  return "No changes to save yet";
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
        <p
          className="truncate font-heading text-sm font-bold tracking-tight"
          title={title}
        >
          {title}
        </p>
        <span className="font-mono text-xs text-muted-foreground">
          Question <span className="tabular-nums">{questionIndex + 1}</span> of{" "}
          <span className="tabular-nums">{totalQuestions}</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
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
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
              <div
                aria-hidden
                className="h-full rounded-full bg-gradient-brand transition-all"
                style={{ width: `${countdown.percentRemaining * 100}%` }}
              />
            </div>
          )}
          <span aria-live="polite" className="sr-only">
            {spokenRemaining(countdown)}
          </span>
        </div>

        <div
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
              dirty ? "bg-warning" : "bg-success",
              saving && "animate-pulse motion-reduce:animate-none",
            )}
          />
          <span aria-hidden>{timeLabel}</span>
          <span aria-live="polite" className="sr-only">
            {spokenSaveState(saving, dirty, lastSaved)}
          </span>
        </div>
      </div>
    </header>
  );
}
