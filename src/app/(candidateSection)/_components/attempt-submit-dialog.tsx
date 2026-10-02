"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { submitAttemptAction } from "@/app/(candidateSection)/_actions/candidate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useActionToast } from "@/hooks/use-action-toast";
import type { AssessmentQuestion, JsonValue } from "@/lib/types";

interface AttemptSubmitDialogProps {
  attemptId: string;
  questions: readonly AssessmentQuestion[];
  responses: Record<string, JsonValue>;
  /** The candidate's current response text for the dialog's trigger label. */
  trigger: ReactElement;
}

/**
 * Wraps the `PATCH { status: "SUBMITTED" }` call in a confirmation dialog that
 * lists every unanswered question. The dialog stays open on failure (e.g. a
 * 400 "already submitted" from another tab) and the error toast is surfaced by
 * `useActionToast`. On success the dialog closes and the hook redirects to the
 * result page.
 */
export function AttemptSubmitDialog({
  attemptId,
  questions,
  responses,
  trigger,
}: AttemptSubmitDialogProps) {
  const [open, setOpen] = useState(false);
  const { state, formAction, isPending } = useActionToast(submitAttemptAction);

  useEffect(() => {
    if (state.status === "success") {
      setOpen(false);
    }
  }, [state.status]);

  const unanswered = questions
    .map((entry, index) => ({
      index,
      title: entry.question.title,
      answered:
        Boolean(responses[entry.questionId]) &&
        responses[entry.questionId] !== "",
    }))
    .filter((entry) => !entry.answered);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit your attempt?</AlertDialogTitle>
          <AlertDialogDescription>
            {unanswered.length > 0
              ? `You have ${unanswered.length} unanswered question${unanswered.length === 1 ? "" : "s"}. They will be recorded as not answered and scored accordingly. Are you sure you want to submit?`
              : "All questions have answers. Are you sure you want to submit? Once submitted, you cannot edit your responses."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {unanswered.length > 0 ? (
          <ul className="flex flex-col gap-1 text-sm">
            {unanswered.map((q) => (
              <li
                key={q.index}
                className="flex items-start gap-2 text-muted-foreground"
              >
                <span className="font-mono text-xs">Q{q.index + 1}:</span>
                <span>{q.title}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <form action={formAction}>
            <input type="hidden" name="attemptId" value={attemptId} />
            <AlertDialogAction disabled={isPending} type="submit">
              {isPending ? (
                <>
                  <Spinner className="size-3.5" />
                  Submitting…
                </>
              ) : (
                "Yes, submit my attempt"
              )}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
