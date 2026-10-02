"use client";

import { ListChecksIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import toast from "react-hot-toast";
import { updateAssessmentQuestionsAction } from "@/app/(recruiterSection)/_actions/recruiter";
import { QuestionPicker } from "@/app/(recruiterSection)/_components/question-picker";
import { InlineNotice } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import type { ActionState, Question } from "@/lib/types";
import { IDLE_ACTION_STATE } from "@/lib/types";

function SaveQuestionsButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={disabled || pending} type="submit">
      {pending ? <Spinner className="size-3.5" /> : null}
      {pending ? "Saving" : "Save question list"}
    </Button>
  );
}

/**
 * Replaces the whole question list. The API has no per-question attach or
 * detach verb — `PUT`-style `questionIds` is the only shape it accepts — so
 * this is an all-or-nothing save, and the copy says so.
 *
 * The picked order becomes `AssessmentQuestion.order` and every question is
 * stored at 1 point: the backend hard-codes `points: 1` on attach and never
 * reads a per-question value from the client.
 */
export function AssessmentQuestionsDialog({
  assessmentId,
  questions,
  selectedIds,
}: {
  assessmentId: string;
  questions: Question[];
  selectedIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>(selectedIds);
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateAssessmentQuestionsAction,
    IDLE_ACTION_STATE,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      setOpen(false);
      toast.success(state.message);
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message || VALIDATION_MESSAGES.unknown);
    }
  }, [state, router]);

  // Re-seed from the server copy each time the dialog opens, so a cancelled
  // edit never leaks a half-picked list into the next attempt.
  useEffect(() => {
    if (open) {
      setPicked(selectedIds);
    }
  }, [open, selectedIds]);

  const toggle = (id: string) => {
    setPicked((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  };

  const titleById = new Map(questions.map((q) => [q.id, q.title]));

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <ListChecksIcon className="size-3.5" />
            Change questions
          </Button>
        }
      />
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-base">
            Change questions
          </DialogTitle>
          <DialogDescription>
            This replaces the entire list, and the order you click is the order
            candidates see. Each question is worth 1 point — the API does not
            accept a per-question value.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <input name="assessmentId" type="hidden" value={assessmentId} />
          <input
            name="questionIds"
            type="hidden"
            value={JSON.stringify(picked)}
          />

          <QuestionPicker
            emptyBody="You have no questions in the bank yet. Create one on the questions page first — an assessment cannot be published while it is empty."
            idPrefix="detail-question-picker"
            onToggle={toggle}
            questions={questions}
            selectedIds={picked}
          />

          <div className="flex flex-col gap-2 border border-border bg-card p-3">
            <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              Selected — {picked.length} question
              {picked.length === 1 ? "" : "s"} · {picked.length} point
              {picked.length === 1 ? "" : "s"} total
            </p>
            {picked.length > 0 ? (
              <ol className="flex flex-col gap-1">
                {picked.map((id, index) => (
                  <li className="flex items-center gap-2 text-sm" key={id}>
                    <span className="font-mono text-xs text-muted-foreground">
                      {index + 1}.
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {titleById.get(id) ?? id}
                    </span>
                    <Button
                      aria-label={`Remove question ${index + 1}`}
                      onClick={() => toggle(id)}
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <XIcon className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-muted-foreground">
                Nothing selected. Saving an empty list is allowed, but the
                assessment then cannot be published.
              </p>
            )}
          </div>

          {state.status === "error" ? (
            <InlineNotice
              body={state.message}
              title="Could not save the question list"
              tone="danger"
            />
          ) : null}

          {picked.length === 0 ? (
            <InlineNotice
              body="An assessment with no questions cannot be published — the API rejects it. Saving now is only useful if you are about to re-pick."
              title="This will leave the assessment empty"
              tone="warning"
            />
          ) : null}

          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <SaveQuestionsButton disabled={picked.length === 0} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
