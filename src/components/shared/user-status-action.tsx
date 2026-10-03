"use client";

import { ShieldCheckIcon, UserXIcon } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateUserStatusAction } from "@/app/(adminSection)/_actions/admin";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ActionState, UserStatus } from "@/lib/types";
import { IDLE_ACTION_STATE } from "@/lib/types";
import { cn } from "@/lib/utils";

const COPY: Record<
  UserStatus,
  {
    next: UserStatus;
    ask: string;
    confirm: string;
    done: string;
    Icon: typeof UserXIcon;
  }
> = {
  ACTIVE: {
    next: "SUSPENDED",
    ask: "Suspend",
    confirm: "Confirm suspend",
    done: "User suspended.",
    Icon: UserXIcon,
  },
  SUSPENDED: {
    next: "ACTIVE",
    ask: "Restore",
    confirm: "Confirm restore",
    done: "Access restored.",
    Icon: ShieldCheckIcon,
  },
};

function SubmitButton({
  label,
  destructive,
}: {
  label: string;
  destructive: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      disabled={pending}
      size="sm"
      type="submit"
      variant={destructive ? "destructive" : "outline"}
    >
      {pending ? <Spinner className="size-3.5" /> : null}
      {label}
    </Button>
  );
}

export function UserStatusAction({
  userId,
  status,
}: {
  userId: string;
  status: UserStatus;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateUserStatusAction,
    IDLE_ACTION_STATE,
  );
  const [armed, setArmed] = useState(false);
  const copy = COPY[status];
  const doneRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      setArmed(false);
      doneRef.current?.focus();
    }
  }, [state.status]);

  return (
    <form action={formAction} className="flex items-center gap-1.5">
      <input name="userId" type="hidden" value={userId} />
      <input name="status" type="hidden" value={copy.next} />

      {armed ? (
        <>
          <SubmitButton
            destructive={status === "ACTIVE"}
            label={copy.confirm}
          />
          <Button
            onClick={() => setArmed(false)}
            size="sm"
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
        </>
      ) : (
        <Button
          onClick={() => setArmed(true)}
          size="sm"
          type="button"
          variant={status === "ACTIVE" ? "destructive" : "outline"}
        >
          <copy.Icon className="size-3.5" />
          {copy.ask}
        </Button>
      )}

      <span
        aria-live="polite"
        className={cn(
          "text-xs/relaxed",
          state.status === "idle"
            ? "sr-only"
            : state.status === "success"
              ? "text-success"
              : "text-destructive",
        )}
      >
        {state.status === "idle" ? "" : state.message}
      </span>

      <span className="sr-only" ref={doneRef} tabIndex={-1} />
    </form>
  );
}
