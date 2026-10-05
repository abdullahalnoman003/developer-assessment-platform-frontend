"use client";

import { DotIcon } from "lucide-react";
import type { AssessmentQuestion, JsonValue } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QuestionNavigatorProps {
  questions: readonly AssessmentQuestion[];
  responses: Record<string, JsonValue>;
  currentQuestionId: string;
  onNavigate: (index: number) => void;
  flagged: Set<string>;
  onToggleFlag: (questionId: string) => void;
}

const TONE_CLASS: Record<
  "success" | "warning" | "neutral" | "current",
  string
> = {
  success: "border-success/40 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/10 text-warning",
  neutral: "border-border bg-transparent text-muted-foreground",
  current:
    "border-primary bg-primary text-primary-foreground ring-1 ring-primary/30",
};

function describe(
  index: number,
  isActive: boolean,
  isAnswered: boolean,
  isFlagged: boolean,
): string {
  const state = isFlagged
    ? "flagged"
    : isAnswered
      ? "answered"
      : "not answered";
  return `Question ${index + 1}, ${state}${isActive ? ", current question" : ""}`;
}

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
                aria-current={isActive ? "true" : undefined}
                aria-label={describe(index, isActive, isAnswered, isFlagged)}
                className={cn(
                  "relative flex size-8 items-center justify-center rounded-lg border text-sm font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring",
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
                onKeyDown={(e) => {
                  if (e.key === "f" || e.key === "F") {
                    e.preventDefault();
                    onToggleFlag(entry.questionId);
                  }
                }}
                title={`Question ${index + 1}${isFlagged ? " (flagged — press f to unflag)" : " (press f to flag)"}`}
                type="button"
              >
                {index + 1}
                {isFlagged ? (
                  <DotIcon
                    aria-hidden
                    className="absolute -bottom-0.5 right-0.5 size-2.5 text-warning"
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-col gap-2 text-sm">
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
          "flex size-4 items-center justify-center rounded-sm border font-mono text-[10px]",
          TONE_CLASS[tone],
        )}
      >
        •
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
