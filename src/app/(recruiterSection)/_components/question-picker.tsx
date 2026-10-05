"use client";

import { SearchIcon } from "lucide-react";
import { useState } from "react";
import {
  DifficultyBadge,
  QuestionTypeBadge,
} from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from "@/lib/constants";
import { truncate } from "@/lib/format";
import { EMPTY_STATES } from "@/lib/messages";
import type { Difficulty, Question, QuestionType } from "@/lib/types";

export function QuestionPicker({
  questions,
  selectedIds,
  onToggle,
  idPrefix = "question-picker",
  emptyTitle = EMPTY_STATES.questions.title,
  emptyBody = EMPTY_STATES.questions.body,
}: {
  questions: Question[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  idPrefix?: string;
  emptyTitle?: string;
  emptyBody?: string;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<QuestionType | "">("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");

  const visible = questions.filter((question) => {
    if (type && question.type !== type) return false;
    if (difficulty && question.difficulty !== difficulty) return false;
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    return (
      question.title.toLowerCase().includes(needle) ||
      question.body.toLowerCase().includes(needle) ||
      question.tags.some((tag) => tag.toLowerCase().includes(needle))
    );
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-xs">
          <label
            className="font-mono text-xs tracking-wider text-muted-foreground uppercase"
            htmlFor={`${idPrefix}-search`}
          >
            Search
          </label>
          <div className="relative">
            <SearchIcon
              aria-hidden
              className="absolute inset-y-0 left-2 my-auto size-3.5 text-muted-foreground"
            />
            <Input
              className="pl-7"
              id={`${idPrefix}-search`}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title, body, or tag…"
              type="search"
              value={query}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <label
            className="font-mono text-xs tracking-wider text-muted-foreground uppercase"
            htmlFor={`${idPrefix}-type`}
          >
            Type
          </label>
          <select
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
            id={`${idPrefix}-type`}
            onChange={(event) =>
              setType(event.target.value as QuestionType | "")
            }
            value={type}
          >
            <option value="">All types</option>
            {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map(
              (value) => (
                <option key={value} value={value}>
                  {QUESTION_TYPE_LABELS[value]}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <label
            className="font-mono text-xs tracking-wider text-muted-foreground uppercase"
            htmlFor={`${idPrefix}-difficulty`}
          >
            Difficulty
          </label>
          <select
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
            id={`${idPrefix}-difficulty`}
            onChange={(event) =>
              setDifficulty(event.target.value as Difficulty | "")
            }
            value={difficulty}
          >
            <option value="">All difficulties</option>
            {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((value) => (
              <option key={value} value={value}>
                {DIFFICULTY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-border/70 bg-card p-6 text-center text-sm/relaxed text-muted-foreground shadow-sm">
          {questions.length === 0 ? emptyBody : emptyTitle}
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Showing {visible.length} of {questions.length} loaded questions.
            Click one to add it — the order you pick is the order they are
            served in. The search box and both filters run against this loaded
            set.
          </p>
          <ul className="flex max-h-80 flex-col divide-y divide-border/70 overflow-y-auto rounded-2xl border border-border/70 bg-card shadow-sm">
            {visible.map((question) => {
              const isSelected = selectedIds.includes(question.id);
              const order = selectedIds.indexOf(question.id);
              return (
                <li key={question.id}>
                  <button
                    aria-pressed={isSelected}
                    className="flex w-full flex-col gap-1.5 p-3 text-left transition-colors hover:bg-muted/50"
                    onClick={() => onToggle(question.id)}
                    type="button"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      {isSelected ? (
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] text-primary-foreground">
                          {order + 1}
                        </span>
                      ) : null}
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {question.title}
                      </span>
                      <QuestionTypeBadge value={question.type} />
                      <DifficultyBadge value={question.difficulty} />
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {truncate(question.body, 140)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
