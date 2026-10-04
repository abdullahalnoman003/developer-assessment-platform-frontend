"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import { safeExternalUrl } from "@/lib/redirect";
import type { ActionState } from "@/lib/types";
import { IDLE_ACTION_STATE } from "@/lib/types";
import { useBackendHealth } from "./use-backend-health";

export function useActionToast(
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>,
): {
  state: ActionState;
  formAction: (formData: FormData) => void;
  isPending: boolean;
} {
  const router = useRouter();
  const { health } = useBackendHealth();
  const [state, formAction, isPending] = useActionState(
    action,
    IDLE_ACTION_STATE,
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      const external = safeExternalUrl(state.externalUrl);
      if (external) {
        window.location.assign(external);
      } else if (state.redirectTo) {
        router.push(state.redirectTo);
      } else if (health.healthy) {
        router.refresh();
      } else {
        toast.error(
          "Backend unavailable — data may be stale. Refresh manually when ready.",
        );
      }
    } else if (state.status === "error") {
      toast.error(state.message || VALIDATION_MESSAGES.unknown);
    }
  }, [state, router, health.healthy]);

  return { state, formAction, isPending };
}
