"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import toast from "react-hot-toast";

export function useAuthComplete() {
  const router = useRouter();

  return useCallback(
    (target: string, message: string) => {
      toast.success(message);
      router.replace(target);
      // router.refresh() removed: navigation to new page triggers fresh data fetch
    },
    [router],
  );
}
