"use client";

import { Trash2Icon } from "lucide-react";
import { deleteAssessmentAction } from "@/app/(recruiterSection)/_actions/recruiter";
import { ConfirmFormDialog } from "@/components/shared/confirm-form-dialog";
import { Button } from "@/components/ui/button";

export function AssessmentDeleteButton({
  assessmentId,
  title,
  attemptCount,
}: {
  assessmentId: string;
  title: string;
  attemptCount: number;
}) {
  return (
    <ConfirmFormDialog
      action={deleteAssessmentAction}
      confirmLabel="Delete assessment"
      description={
        <>
          &quot;{title}&quot; disappears from your assessment list.{" "}
          {attemptCount > 0
            ? `Its ${attemptCount} attempt${attemptCount === 1 ? "" : "s"} and any released results are kept, but you will lose the place to grade them from.`
            : "It has no attempts, so nothing else is affected."}{" "}
          This is a soft delete and cannot be undone here.
        </>
      }
      fields={{ assessmentId }}
      pendingLabel="Deleting"
      title="Delete this assessment?"
      trigger={
        <Button size="sm" variant="ghost">
          <Trash2Icon className="size-3.5" />
          Delete
        </Button>
      }
    />
  );
}
