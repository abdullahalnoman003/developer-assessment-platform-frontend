"use client";

import { useEffect, useState } from "react";
import { formatCountdown, toDate } from "@/lib/format";

export type WarningLevel = "normal" | "warning" | "critical";

export interface CountdownState {
  label: string;
  expired: boolean;
  percentRemaining: number;
  warningLevel: WarningLevel;
}

const ASSUMED_WINDOW_MS = 4 * 60 * 60 * 1000;

function compute(parsed: number): CountdownState {
  const remaining = parsed - Date.now();

  if (remaining <= 0) {
    return {
      label: "Time expired",
      expired: true,
      percentRemaining: 0,
      warningLevel: "critical",
    };
  }

  const minutes = Math.floor(remaining / 1000) / 60;
  const warningLevel: WarningLevel =
    minutes < 5 ? "critical" : minutes < 10 ? "warning" : "normal";

  return {
    label: formatCountdown(new Date(parsed)),
    expired: false,
    percentRemaining: Math.max(0, Math.min(1, remaining / ASSUMED_WINDOW_MS)),
    warningLevel,
  };
}

export function useCountdown(
  deadline: string | null | undefined,
): CountdownState {
  const parsed = toDate(deadline)?.getTime() ?? null;

  const [state, setState] = useState<CountdownState>(() =>
    compute(parsed ?? Date.now()),
  );

  useEffect(() => {
    if (parsed === null) return;

    setState(compute(parsed));
    const handle = setInterval(() => setState(compute(parsed)), 1000);
    return () => clearInterval(handle);
  }, [parsed]);

  return state;
}
