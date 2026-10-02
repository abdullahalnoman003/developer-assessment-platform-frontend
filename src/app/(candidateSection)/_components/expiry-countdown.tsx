"use client";

import { useEffect, useState } from "react";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Formats the remaining life of a deadline. Rounded *down* to whole days/hours/
 * minutes so the number never reads as "0 minutes left" while time remains, and
 * the unit is chosen by magnitude — a day-granularity invitation should not
 * tick every 30 seconds saying "1d 23h 59m".
 */
function describe(expiresAt: string, now: number): string {
  const target = new Date(expiresAt).getTime();
  if (Number.isNaN(target)) return "Expiry unknown";

  const remaining = target - now;
  if (remaining <= 0) {
    return `Expired ${formatRelative(expiresAt, "just now")}`;
  }
  if (remaining < HOUR) {
    return `Expires in ${Math.max(1, Math.floor(remaining / MINUTE))} min`;
  }
  if (remaining < DAY) {
    const hours = Math.floor(remaining / HOUR);
    const minutes = Math.floor((remaining % HOUR) / MINUTE);
    return `Expires in ${hours}h ${minutes}m`;
  }
  const days = Math.floor(remaining / DAY);
  const hours = Math.floor((remaining % DAY) / HOUR);
  return `Expires in ${days}d ${hours}h`;
}

/**
 * A ticking expiry label for an invitation.
 *
 * It is **not** a live region on purpose: the AGENTS.md `aria-live` rule is for
 * the attempt runner's countdown, where a minute is a meaningful chunk of the
 * remaining budget. Here the announcement would be noise. The exact instant is
 * still exposed machine-readably through the wrapping `<time dateTime>`, so a
 * screen reader can read the deadline itself rather than a relative string.
 *
 * The server renders the first value, so the label is present in the SSR HTML
 * and there is no layout shift before hydration.
 */
export function ExpiryCountdown({
  expiresAt,
  className,
}: {
  expiresAt: string;
  className?: string;
}) {
  const [label, setLabel] = useState(() => describe(expiresAt, Date.now()));
  const [expired, setExpired] = useState(
    () => new Date(expiresAt).getTime() <= Date.now(),
  );

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setLabel(describe(expiresAt, now));
      setExpired(new Date(expiresAt).getTime() <= now);
    };

    tick();
    const handle = setInterval(tick, 30_000);
    return () => clearInterval(handle);
  }, [expiresAt]);

  return (
    <time
      className={cn(
        "font-mono text-xs tabular-nums",
        expired ? "text-destructive" : "text-muted-foreground",
        className,
      )}
      dateTime={expiresAt}
    >
      {label}
    </time>
  );
}
