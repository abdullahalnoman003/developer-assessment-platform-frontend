"use client";

import { useEffect, useState } from "react";
import { formatCountdown, toDate } from "@/lib/format";

export type WarningLevel = "normal" | "warning" | "critical";

export interface CountdownState {
  /** `HH:MM:SS` formatted remaining time. "Time expired" when the deadline passed. */
  label: string;
  /** True when the deadline is in the past. */
  expired: boolean;
  /** 0–1 fill fraction for a visual progress ring. */
  percentRemaining: number;
  /** Ramps up as the deadline nears: `critical` under 5 min. */
  warningLevel: WarningLevel;
}

/**
 * Ticking countdown for the attempt runner. The deadline is server-derived and
 * re-anchored on every server response; this client hook merely re-renders the
 * server-rendered instant once per second so the number ticks down smoothly.
 *
 * Warning levels: `critical` below 5 minutes, `warning` below 10 minutes.
 */
export function useCountdown(
  deadline: string | null | undefined,
): CountdownState {
  const target = (toDate(deadline)?.getTime() ?? 0) || Date.now();

  const compute = (): CountdownState => {
    const remaining = target - Date.now();
    if (remaining <= 0) {
      return {
        label: "Time expired",
        expired: true,
        percentRemaining: 0,
        warningLevel: "critical",
      };
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = totalSeconds / 60;
    const warningLevel: WarningLevel =
      minutes < 5 ? "critical" : minutes < 10 ? "warning" : "normal";

    return {
      label: formatCountdown(deadline ?? undefined),
      expired: false,
      percentRemaining: Math.max(0, Math.min(1, totalSeconds / (60 * 60 * 4))),
      warningLevel,
    };
  };

  const [state, setState] = useState<CountdownState>(compute);

  useEffect(() => {
    const handle = setInterval(() => setState(compute()), 1000);
    return () => clearInterval(handle);
  });

  return state;
}
