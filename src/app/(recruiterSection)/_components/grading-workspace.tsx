"use client";

import {
  CheckCircle2Icon,
  LockIcon,
  TriangleAlertIcon,
  UnlockIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import toast from "react-hot-toast";
import { evaluateAttemptAction } from "@/app/(recruiterSection)/_actions/recruiter";
import { InlineNotice } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { MANUAL_QUESTION_TYPES } from "@/lib/constants";
import { clamp, isJsonEmpty, toOptionList, truncate } from "@/lib/format";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import type {
  ActionState,
  Answer,
  AssessmentQuestion,
  AttemptStatus,
  JsonValue,
} from "@/lib/types";
import { IDLE_ACTION_STATE } from "@/lib/types";

/**
 * A response is stored as free-form `Json`, so a hand-typed MCQ answer, a
 * written essay, and a structured payload all arrive the same way. Rendering
 * has to cope with all three instead of assuming a string.
 */
function renderResponse(response: JsonValue | null | undefined): string {
  if (isJsonEmpty(response)) return "No answer";
  if (typeof response === "string") return response;
  if (typeof response === "number" || typeof response === "boolean") {
    return String(response);
  }
  return JSON.stringify(response, null, 2);
}

function isManual(type: AssessmentQuestion["question"]["type"]): boolean {
  return MANUAL_QUESTION_TYPES.includes(type);
}

function SubmitEvaluationButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={disabled || pending} type="submit">
      {pending ? <Spinner className="size-3.5" /> : null}
      {pending ? "Saving evaluation" : "Save evaluation"}
    </Button>
  );
}

export interface GradingQuestion {
  entry: AssessmentQuestion;
  answer: Answer | undefined;
  /** Pre-filled from `pointsAwarded` when re-showing an already-graded attempt. */
  awarded: number | null;
}

function GradingRow({
  item,
  index,
  editable,
  onScoreChange,
}: {
  item: GradingQuestion;
  index: number;
  editable: boolean;
  onScoreChange: (answerId: string, points: number) => void;
}) {
  const { entry, answer } = item;
  const { question } = entry;
  const options = toOptionList(question.options);
  const responseText = renderResponse(answer?.response);
  const manual = isManual(question.type);
  const maxPoints = entry.points;

  return (
    <li className="flex flex-col gap-3 border-b border-border py-4 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center border border-primary bg-primary text-[11px] text-primary-foreground">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1 truncate font-medium">
          {question.title}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {maxPoints} {maxPoints === 1 ? "pt" : "pts"}
        </span>
      </div>

      <p className="text-sm/relaxed whitespace-pre-wrap text-muted-foreground">
        {truncate(question.body, 400)}
      </p>

      <div className="flex flex-col gap-2 border border-border bg-muted/30 p-3">
        <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          Candidate answer
        </p>
        {manual ? (
          <p className="text-sm/relaxed whitespace-pre-wrap">{responseText}</p>
        ) : options.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {options.map((option, optionIndex) => {
              const chosen = responseText === option;
              const isKey =
                responseText === option && answer?.isCorrect === true;
              return (
                <li
                  className={[
                    "flex items-start gap-2 border px-2 py-1 text-sm",
                    isKey
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : chosen
                        ? "border-amber-500/40 bg-amber-500/10"
                        : "border-border",
                  ].join(" ")}
                  key={`${question.id}-${optionIndex}`}
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="min-w-0 flex-1">{option}</span>
                  {isKey ? (
                    <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                      correct
                    </span>
                  ) : chosen ? (
                    <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400">
                      wrong
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm/relaxed whitespace-pre-wrap">{responseText}</p>
        )}

        {!manual ? (
          <p className="font-mono text-[11px] text-muted-foreground">
            Auto-graded by exact string match on save —{" "}
            {answer?.isCorrect === true
              ? "awarded its point automatically."
              : answer?.isCorrect === false
                ? "scored 0 automatically."
                : "no verdict stored."}
          </p>
        ) : null}
      </div>

      {manual ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              Reference answer
            </p>
            <p className="text-sm/relaxed whitespace-pre-wrap text-muted-foreground">
              {isJsonEmpty(question.correctAnswer)
                ? "No reference answer was stored for this question — score it against the brief in the question body."
                : renderResponse(question.correctAnswer)}
            </p>
          </div>

          {answer?.id ? (
            <div className="flex shrink-0 flex-col gap-1.5 sm:w-32">
              <Label htmlFor={`points-${entry.questionId}`}>
                Points (0–{maxPoints})
              </Label>
              <Input
                disabled={!editable}
                id={`points-${entry.questionId}`}
                max={maxPoints}
                min={0}
                onChange={(event) => {
                  const raw = Number(event.target.value);
                  onScoreChange(
                    entry.questionId,
                    Number.isFinite(raw) ? clamp(raw, 0, maxPoints) : 0,
                  );
                }}
                type="number"
                value={item.awarded ?? 0}
              />
            </div>
          ) : (
            // No `answers` row means the candidate never reached this question.
            // There is no answerId to attach a score to, so the input would be a
            // lie: any number typed here could not be submitted.
            <p className="shrink-0 font-mono text-[11px] text-muted-foreground sm:w-32 sm:text-right">
              Skipped · 0 pts
            </p>
          )}
        </div>
      ) : null}
    </li>
  );
}

export function GradingWorkspace({
  attemptId,
  status,
  candidateId,
  maxScore,
  resultReleased,
  items,
}: {
  attemptId: string;
  status: AttemptStatus;
  candidateId: string;
  maxScore: number | null;
  resultReleased: boolean;
  items: readonly GradingQuestion[];
}) {
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      items
        .filter((item) => isManual(item.entry.question.type))
        .map((item) => [item.entry.questionId, item.awarded ?? 0]),
    ),
  );
  const [release, setRelease] = useState(resultReleased);
  const [state, formAction] = useActionState<ActionState, FormData>(
    evaluateAttemptAction,
    IDLE_ACTION_STATE,
  );
  const router = useRouter();

  const manualItems = useMemo(
    () => items.filter((item) => isManual(item.entry.question.type)),
    [items],
  );

  /**
   * A question the candidate skipped has no row in `answers`, so it has no
   * `answerId` to score. The API's schema requires a non-empty `answerId`, so
   * including one of these would fail the *whole* evaluation with a message
   * about a question the evaluator never touched. Unanswered manual questions
   * are therefore graded as zero and kept out of the payload entirely.
   */
  const gradeable = useMemo(
    () => manualItems.filter((item) => Boolean(item.answer?.id)),
    [manualItems],
  );
  const unanswered = useMemo(
    () => manualItems.filter((item) => !item.answer?.id),
    [manualItems],
  );

  const editable = status === "SUBMITTED";

  /**
   * The API's `scores` array has a minimum length of 1, so an attempt with
   * nothing to grade by hand cannot be submitted at all — the form is disabled
   * and says exactly why instead of letting the request fail.
   */
  const canSubmit = editable && gradeable.length > 0;

  const awardedTotal = gradeable.reduce(
    (sum, item) => sum + (scores[item.entry.questionId] ?? 0),
    0,
  );
  const autoPoints = items
    .filter((item) => !isManual(item.entry.question.type))
    .reduce((sum, item) => sum + (item.answer?.pointsAwarded ?? 0), 0);
  const projected = autoPoints + awardedTotal;

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message || VALIDATION_MESSAGES.unknown);
    }
  }, [state, router]);

  const payload = gradeable.map((item) => ({
    answerId: item.answer?.id ?? "",
    points: scores[item.entry.questionId] ?? 0,
  }));

  return (
    <div className="flex flex-col gap-4">
      {!editable ? (
        <InlineNotice
          body={
            status === "EVALUATED"
              ? `Evaluation is final. The API refuses any second evaluate call on an ${status} attempt, so the scores below are read-only.`
              : `This attempt is ${status.toLowerCase()}, and the API only accepts an evaluation on a SUBMITTED attempt.`
          }
          title="Read-only"
          tone="info"
        />
      ) : manualItems.length === 0 ? (
        <InlineNotice
          body="Every question on this attempt is multiple choice, and those are scored automatically when the answers are saved. The evaluate endpoint requires at least one score, so there is nothing to send — the automatic score below is already the candidate's result."
          title="No manual grading needed"
          tone="info"
        />
      ) : gradeable.length === 0 ? (
        <InlineNotice
          body={`All ${manualItems.length} written or coding ${manualItems.length === 1 ? "question was" : "questions were"} left unanswered, so there is no answer to score and nothing the evaluate endpoint will accept. The candidate receives zero for ${manualItems.length === 1 ? "it" : "them"}.`}
          title="Nothing was answered"
          tone="warning"
        />
      ) : unanswered.length > 0 ? (
        <InlineNotice
          body={`${unanswered.length} of ${manualItems.length} written or coding ${unanswered.length === 1 ? "question was" : "questions were"} never answered and ${unanswered.length === 1 ? "is" : "are"} scored zero. ${unanswered.length === 1 ? "It is" : "They are"} left out of the request because the API has no answer id to attach ${unanswered.length === 1 ? "it" : "them"} to.`}
          title="Some questions were skipped"
          tone="info"
        />
      ) : null}

      <form action={formAction} className="flex flex-col gap-4">
        <input name="attemptId" type="hidden" value={attemptId} />
        <input name="scores" type="hidden" value={JSON.stringify(payload)} />
        {release ? (
          <input name="releaseResult" type="hidden" value="on" />
        ) : null}

        <ol className="flex flex-col">
          {items.map((item, index) => (
            <GradingRow
              index={index}
              item={item}
              key={item.entry.questionId}
              editable={editable}
              onScoreChange={(questionId, points) =>
                setScores((current) => ({ ...current, [questionId]: points }))
              }
            />
          ))}
        </ol>

        <div className="flex flex-col gap-3 border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
              Score summary
            </span>
            <span className="font-heading text-lg font-semibold tabular-nums">
              {projected}
              <span className="text-muted-foreground">
                {" "}
                / {maxScore ?? "?"}
              </span>
            </span>
          </div>
          <p className="text-xs/relaxed text-muted-foreground">
            {autoPoints} point{autoPoints === 1 ? "" : "s"} scored
            automatically, {awardedTotal} awarded here.
          </p>

          {editable ? (
            <div className="flex items-start gap-3 border-t border-border pt-3">
              {/*
                A custom toggle is a `<button role="switch">`, not a native
                input, so a wrapping `<label>` would associate with nothing.
                Pointing aria-labelledby/aria-describedby at the two text nodes
                gives it the same accessible name and description a `<label>`
                would have given an input.
              */}
              <Switch
                aria-describedby="release-help"
                aria-labelledby="release-label"
                checked={release}
                // The result can never be released after the fact: the attempt
                // becomes EVALUATED either way and a second call is refused.
                disabled={gradeable.length === 0}
                onCheckedChange={setRelease}
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium" id="release-label">
                  Release the result to the candidate
                </span>
                <span
                  className="text-xs/relaxed text-muted-foreground"
                  id="release-help"
                >
                  This is the only chance. Saving without it scores the attempt
                  but leaves the score private forever, because a released
                  result cannot be published later through this API.
                </span>
              </span>
            </div>
          ) : (
            <p className="flex items-center gap-2 border-t border-border pt-3 text-xs/relaxed text-muted-foreground">
              {resultReleased ? (
                <>
                  <UnlockIcon className="size-3.5" />
                  Released — the candidate can see this score.
                </>
              ) : (
                <>
                  <LockIcon className="size-3.5" />
                  Still private. There is no endpoint to release it after the
                  fact.
                </>
              )}
            </p>
          )}

          {state.status === "error" ? (
            <InlineNotice
              body={state.message}
              title="Evaluation was not saved"
              tone="danger"
            />
          ) : null}

          {editable ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-xs/relaxed text-muted-foreground">
                <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
                Evaluation is one-shot: once saved, the attempt is final and
                cannot be regraded.
              </p>
              <SubmitEvaluationButton disabled={!canSubmit} />
            </div>
          ) : null}
        </div>
      </form>

      <p className="flex items-start gap-2 text-xs/relaxed text-muted-foreground">
        <CheckCircle2Icon className="mt-0.5 size-3.5 shrink-0" />
        Candidate <span className="font-mono">{candidateId}</span> — the attempt
        endpoint does not return the candidate&apos;s name or email, so this
        identifier is what the API gives us to go on.
      </p>
    </div>
  );
}
