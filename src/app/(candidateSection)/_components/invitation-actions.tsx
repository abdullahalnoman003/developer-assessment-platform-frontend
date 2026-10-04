"use client";

import { RotateCcwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import toast from "react-hot-toast";
import {
  respondInvitationAction,
  startAttemptAction,
} from "@/app/(candidateSection)/_actions/candidate";
import { ConfirmFormDialog } from "@/components/shared/confirm-form-dialog";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Spinner } from "@/components/ui/spinner";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import type { ActionState } from "@/lib/types";
import { IDLE_ACTION_STATE } from "@/lib/types";

function Submit({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? <Spinner className="size-3.5" /> : null}
      {pending ? pendingLabel : label}
    </>
  );
}

function InvitationFormButton({
  action,
  fields,
  label,
  pendingLabel,
  variant,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  fields: Record<string, string>;
  label: string;
  pendingLabel: string;
  variant: "default" | "outline";
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    action,
    IDLE_ACTION_STATE,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      if (state.redirectTo) {
        router.push(state.redirectTo);
      } else {
        router.refresh();
      }
    } else if (state.status === "error") {
      toast.error(state.message || VALIDATION_MESSAGES.unknown);
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} name={name} type="hidden" value={value} />
      ))}
      <Button size="sm" type="submit" variant={variant}>
        <Submit label={label} pendingLabel={pendingLabel} />
      </Button>
    </form>
  );
}

export function InvitationActions({
  invitationId,
  status,
  attemptId,
  attemptStatus,
  expired,
}: {
  invitationId: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  attemptId: string | null;
  attemptStatus:
    | "NOT_STARTED"
    | "IN_PROGRESS"
    | "SUBMITTED"
    | "EVALUATED"
    | "EXPIRED"
    | null;
  expired: boolean;
}) {
  if (status === "PENDING") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <InvitationFormButton
          action={respondInvitationAction}
          fields={{ invitationId, status: "ACCEPTED" }}
          label="Accept"
          pendingLabel="Accepting"
          variant="default"
        />
        <ConfirmFormDialog
          action={respondInvitationAction}
          confirmLabel="Decline invitation"
          description="The assessment stops showing as something you can start. You can still open it, but the recruiter sees it as declined."
          destructive
          fields={{ invitationId, status: "DECLINED" }}
          pendingLabel="Declining"
          title="Decline this invitation?"
          trigger={
            <Button size="sm" variant="outline">
              Decline
            </Button>
          }
        />
      </div>
    );
  }

  if (status !== "ACCEPTED") {
    return null;
  }

  if (attemptId && attemptStatus) {
    if (attemptStatus === "IN_PROGRESS") {
      return (
        <LinkButton
          href={`/dashboard/candidate/attempts/${attemptId}`}
          size="sm"
        >
          <RotateCcwIcon className="size-3.5" />
          Resume
        </LinkButton>
      );
    }

    return (
      <LinkButton
        href={`/dashboard/candidate/attempts/${attemptId}/result`}
        size="sm"
        variant={attemptStatus === "EVALUATED" ? "default" : "outline"}
      >
        View result
      </LinkButton>
    );
  }

  if (expired) {
    return (
      <Button disabled size="sm" variant="outline">
        Invitation expired
      </Button>
    );
  }

  return (
    <InvitationFormButton
      action={startAttemptAction}
      fields={{ invitationId }}
      label="Start assessment"
      pendingLabel="Starting"
      variant="default"
    />
  );
}
