"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import type { ActionState } from "@/lib/types";
import { IDLE_ACTION_STATE } from "@/lib/types";

/**
 * Wires a Server Action to a toast + redirect cycle. Replaces the
 * `useActionState` + `useEffect` boilerplate that every form in this app
 * repeats: show a success/error toast, then follow `redirectTo` or refresh.
 *
 * Returns a `formAction` for a plain `<form action={formAction}>` (so
 * progressive-enhancement still works) plus the current state and pending flag.
 */
export function useActionToast(
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>,
): {
  state: ActionState;
  formAction: (formData: FormData) => void;
  isPending: boolean;
} {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    action,
    IDLE_ACTION_STATE,
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      if (state.externalUrl) {
        window.location.assign(state.externalUrl);
      } else if (state.redirectTo) {
        router.push(state.redirectTo);
      } else {
        router.refresh();
      }
    } else if (state.status === "error") {
      toast.error(state.message || VALIDATION_MESSAGES.unknown);
    }
  }, [state, router]);

  return { state, formAction, isPending };
}
