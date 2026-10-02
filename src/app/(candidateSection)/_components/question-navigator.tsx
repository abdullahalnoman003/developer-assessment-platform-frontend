"use client";

import { DotIcon } from "lucide-react";
import type { AssessmentQuestion, JsonValue } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QuestionNavigatorProps {
  questions: readonly AssessmentQuestion[];
  responses: Record<string, JsonValue>;
  currentQuestionId: string;
  onNavigate: (index: number) => void;
  /** Client-only flagged question ids (not persisted to the API). */
  flagged: Set<string>;
  onToggleFlag: (questionId: string) => void;
}

const TONE_CLASS: Record<
  "success" | "warning" | "neutral" | "current",
  string
> = {
  success:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning:
    "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  neutral: "border-border bg-transparent text-muted-foreground",
  current:
    "border-primary bg-primary text-primary-foreground ring-1 ring-primary/30",
};

/**
 * The question navigator — a vertical strip of dots, one per question, coloured:
 *
 * - **green** when answered (has a non-blank response);
 * - **amber** when flagged for review (client-only, clears on reload);
 * - **gray** when unanswered and unflagged.
 *
 * Clicking a dot jumps to that question. Right-click (or context-menu on mobile)
 * toggles a flag — a candidate-side reminder with no server half, so it is never
 * confused with a saved answer state.
 */
export function QuestionNavigator({
  questions,
  responses,
  currentQuestionId,
  onNavigate,
  flagged,
  onToggleFlag,
}: QuestionNavigatorProps) {
  const answeredSet = new Set<string>();
  for (const [id, response] of Object.entries(responses)) {
    if (response !== null && response !== undefined && response !== "") {
      answeredSet.add(id);
    }
  }

  return (
    <nav
      aria-label="Questions"
      className="flex items-start justify-center overflow-y-auto overflow-x-hidden p-3 scrollbar-thin"
    >
      <ul className="flex flex-col items-center gap-1.5">
        {questions.map((entry, index) => {
          const isAnswered = answeredSet.has(entry.questionId);
          const isFlagged = flagged.has(entry.questionId);
          const isActive = entry.questionId === currentQuestionId;

          let tone: "success" | "warning" | "neutral" | "current";
          if (isActive) tone = "current";
          else if (isFlagged) tone = "warning";
          else if (isAnswered) tone = "success";
          else tone = "neutral";

          return (
            <li key={entry.questionId}>
              <button
                aria-label={`Question ${index + 1}`}
                className={cn(
                  "relative flex size-7 items-center justify-center rounded-none border text-xs font-medium outline-none transition-all",
                  TONE_CLASS[tone],
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(index);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onToggleFlag(entry.questionId);
                }}
                type="button"
              >
                {index + 1}
                {isFlagged ? (
                  <DotIcon
                    aria-hidden
                    className="absolute -bottom-0.5 right-0.5 size-2.5 text-amber-500"
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex flex-col gap-2 text-xs">
        <LegendDot label="Answered" tone="success" />
        <LegendDot label="Flagged" tone="warning" />
        <LegendDot label="Unanswered" tone="neutral" />
      </div>
    </nav>
  );
}

function LegendDot({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "warning" | "neutral";
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn(
          "flex size-4 items-center justify-center rounded-none border font-mono text-[10px]",
          TONE_CLASS[tone],
        )}
      >
        •
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
