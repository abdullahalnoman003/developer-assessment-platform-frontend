"use client";

import { useCallback, useEffect, useState } from "react";

export function useBackendHealth() {
  const [health, setHealth] = useState<{
    healthy: boolean;
    failures: number;
    resetAt: number;
  }>({ healthy: true, failures: 0, resetAt: 0 });

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      } else {
        setHealth((prev) => ({ ...prev, healthy: false }));
      }
    } catch {
      setHealth((prev) => ({ ...prev, healthy: false }));
    }
  }, []);

  const reset = useCallback(async () => {
    try {
      await fetch("/api/health", { method: "POST" });
      setHealth({ healthy: true, failures: 0, resetAt: 0 });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10_000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return { health, checkHealth, reset };
}
