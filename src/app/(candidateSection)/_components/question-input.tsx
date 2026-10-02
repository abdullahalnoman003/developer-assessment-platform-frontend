"use client";

import { useEffect, useRef } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toOptionList } from "@/lib/format";
import type { AssessmentQuestion, JsonValue } from "@/lib/types";
import { cn } from "@/lib/utils";

const CHAR_LIMIT = 2000;

interface QuestionInputProps {
  question: AssessmentQuestion;
  /** Current answer value; `null` = unanswered. */
  response: JsonValue | null;
  /** New value for this question's response. */
  onChange: (response: JsonValue | null) => void;
  /** Focuses the first input when the candidate navigates to this question. */
  autoFocus?: boolean;
}

/**
 * Renders the correct input shape for MCQ, WRITTEN and CODING.
 *
 * The response type is always the option **text** for MCQs — never an index.
 * The backend auto-grades with `JSON.stringify(response) === JSON.stringify(correctAnswer)`
 * (§1.1 X1), so storing `"Paris"` instead of `0` is what makes a selection score.
 */
export function QuestionInput({
  question,
  response,
  onChange,
  autoFocus,
}: QuestionInputProps) {
  const { question: q } = question;

  switch (q.type) {
    case "MCQ":
      return (
        <McuInput
          options={toOptionList(q.options)}
          onChange={onChange}
          response={response}
        />
      );
    case "WRITTEN":
      return (
        <WrittenInput
          autoFocus={autoFocus}
          body={q.body}
          maxLength={CHAR_LIMIT}
          onChange={(value) => onChange(value)}
          response={response}
        />
      );
    case "CODING":
      return (
        <CodingInput
          autoFocus={autoFocus}
          body={q.body}
          onChange={(value) => onChange(value)}
          response={response}
        />
      );
    default:
      return null;
  }
}

function McuInput({
  options,
  response,
  onChange,
}: {
  options: string[];
  response: JsonValue | null;
  onChange: (response: JsonValue | null) => void;
}) {
  const current = typeof response === "string" ? response : "";
  return (
    <RadioGroup value={current} onValueChange={(value) => onChange(value)}>
      {options.map((option, index) => {
        const label = String.fromCharCode(65 + index);
        return (
          <label
            key={`${label}-${option}`}
            htmlFor={option}
            className={cn(
              "flex cursor-pointer items-start gap-3 border border-border p-3 text-sm",
              current === option && "border-primary bg-primary/5",
            )}
          >
            <RadioGroupItem
              id={option}
              aria-label={`Option ${label}`}
              value={option}
            />
            <span
              aria-hidden
              className="font-mono text-xs text-muted-foreground"
            >
              {label}
            </span>
            <span className="flex-1 break-words">{option}</span>
          </label>
        );
      })}
    </RadioGroup>
  );
}

function WrittenInput({
  body,
  maxLength,
  response,
  onChange,
  autoFocus,
}: {
  body: string;
  maxLength: number;
  response: JsonValue | null;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const text = typeof response === "string" ? response : "";

  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: text drives the resize via the value prop
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const remaining = maxLength - text.length;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm/relaxed whitespace-pre-wrap text-muted-foreground">
        {body}
      </p>
      <Textarea
        ref={textareaRef}
        autoFocus={autoFocus}
        className="min-h-[8rem] resize-none font-mono text-sm"
        maxLength={maxLength}
        placeholder="Start typing your answer…"
        rows={6}
        value={text}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">
          {remaining < 100 ? `Characters left: ${remaining}` : ""}
        </span>
        {remaining <= 0 ? (
          <span className="text-xs text-destructive">
            Character limit reached
          </span>
        ) : null}
      </div>
    </div>
  );
}

function CodingInput({
  body,
  response,
  onChange,
  autoFocus,
}: {
  body: string;
  response: JsonValue | null;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const text = typeof response === "string" ? response : "";

  // biome-ignore lint/correctness/useExhaustiveDependencies: text drives the resize via the value prop
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart ?? 0;
      const end = e.currentTarget.selectionEnd ?? 0;
      const value = e.currentTarget.value;
      e.currentTarget.value = `${value.slice(0, start)}\t${value.slice(end)}`;
      const newPos = start + 1;
      e.currentTarget.selectionStart = newPos;
      e.currentTarget.selectionEnd = newPos;
      onChange(e.currentTarget.value);
    }
  };

  const lineCount = text === "" ? 1 : text.split("\n").length;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm/relaxed whitespace-pre-wrap text-muted-foreground">
        {body}
      </p>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          autoFocus={autoFocus}
          className="font-mono text-xs"
          placeholder="Write your code here. Tab inserts a tab character."
          rows={Math.max(10, lineCount)}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <span className="absolute bottom-2 right-2 font-mono text-[10px] text-muted-foreground">
          {lineCount} line{lineCount === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}
