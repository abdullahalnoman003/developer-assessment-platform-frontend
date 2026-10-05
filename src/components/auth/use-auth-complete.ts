"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";

export function useAuthComplete() {
  return useCallback((target: string, message: string) => {
    toast.success(message);
    // A full document navigation is used on purpose: the httpOnly session
    // cookie changed during the server action, so every server-rendered
    // layout (navbar, sidebar) must be re-fetched. A client-side transition
    // can reuse a stale Router Cache entry and keep showing the signed-out
    // navbar after login.
    window.location.assign(target);
  }, []);
}
