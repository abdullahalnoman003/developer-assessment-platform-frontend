"use client";

import { ArrowRightIcon, TriangleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import toast from "react-hot-toast";
import { updateAssessmentStatusAction } from "@/app/(recruiterSection)/_actions/recruiter";
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
import type { ActionState, AssessmentStatus } from "@/lib/types";
import { IDLE_ACTION_STATE } from "@/lib/types";

type Target = Extract<AssessmentStatus, "PUBLISHED" | "CLOSED" | "ARCHIVED">;

const COPY: Record<
  Target,
  { title: string; confirm: string; pending: string; body: ReactNode }
> = {
  PUBLISHED: {
    title: "Publish this assessment?",
    confirm: "Publish",
    pending: "Publishing",
    body: "Invited candidates can start it immediately, and the details and question list lock — the backend only accepts edits on a draft. Check the questions and duration first; you cannot undo this.",
  },
  CLOSED: {
    title: "Close this assessment?",
    confirm: "Close",
    pending: "Closing",
    body: "No new candidates can be invited, and any invitation still pending becomes unaccepted. Attempts already in progress stay gradeable.",
  },
  ARCHIVED: {
    title: "Archive this assessment?",
    confirm: "Archive",
    pending: "Archiving",
    body: "ARCHIVED is the terminal state — nothing can be edited, invited, or re-opened afterwards. Past attempts and released results are kept. Use Delete if you simply want it out of your list.",
  },
};

function AdvanceSubmit({
  confirm,
  pendingLabel,
}: {
  confirm: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} type="submit" variant="destructive">
      {pending ? <Spinner className="size-3.5" /> : null}
      {pending ? pendingLabel : confirm}
    </Button>
  );
}

export function AdvanceAssessmentDialog({
  assessmentId,
  target,
  questionCount,
  triggerLabel,
}: {
  assessmentId: string;
  target: Target;
  questionCount: number;
  triggerLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateAssessmentStatusAction,
    IDLE_ACTION_STATE,
  );
  const router = useRouter();
  const copy = COPY[target];

  // Publishing a questionless assessment is refused by the backend, so the
  // button is disabled with the reason rather than letting it fail on click.
  const blocked = target === "PUBLISHED" && questionCount === 0;

  useEffect(() => {
    if (state.status === "success") {
      setOpen(false);
      toast.success(state.message);
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message || VALIDATION_MESSAGES.unknown);
    }
  }, [state, router]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button disabled={blocked} size="sm" variant="outline">
            {triggerLabel}
            <ArrowRightIcon className="size-3.5" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-base">
            {copy.title}
          </DialogTitle>
          <DialogDescription>{copy.body}</DialogDescription>
        </DialogHeader>

        {blocked ? (
          <InlineNotice
            body={`This assessment has no questions attached, and the API refuses to publish an empty assessment. Attach at least one question first.`}
            title="Nothing to publish"
            tone="warning"
          />
        ) : null}

        {state.status === "error" ? (
          <InlineNotice
            body={state.message}
            title="Could not update"
            tone="danger"
          />
        ) : null}

        <form action={formAction}>
          <input name="assessmentId" type="hidden" value={assessmentId} />
          <input name="status" type="hidden" value={target} />
          <DialogFooter className="mt-4">
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <AdvanceSubmit confirm={copy.confirm} pendingLabel={copy.pending} />
          </DialogFooter>
        </form>

        <p className="flex items-start gap-2 border-t border-border pt-3 text-xs/relaxed text-muted-foreground">
          <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
          The lifecycle is a one-way chain, so the previous state cannot be
          restored from the UI.
        </p>
      </DialogContent>
    </Dialog>
  );
}
