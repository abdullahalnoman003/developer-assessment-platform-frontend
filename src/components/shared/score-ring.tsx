import { cn } from "@/lib/utils";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TONE_CLASS = {
  success: "text-emerald-600 dark:text-emerald-400",
  danger: "text-destructive",
  warning: "text-amber-600 dark:text-amber-400",
  neutral: "text-muted-foreground",
} as const;

/**
 * A server-rendered progress ring for a score. Plain SVG plus an HTML overlay
 * for the label, so it needs neither a chart library nor a client component: a
 * candidate's result page renders fully on the server and the number is already
 * known.
 *
 * `tone` is supplied by the caller rather than derived here — the same score can
 * be a pass or a fail depending on the assessment's pass mark, and a component
 * that guessed would contradict the pass mark shown beside it.
 */
export function ScoreRing({
  value,
  percent,
  caption,
  tone = "neutral",
  label,
  className,
}: {
  /** The big number in the middle, already formatted by the caller. */
  value: string;
  /** Fill fraction, 0–1. Clamped; a missing or NaN value renders an empty ring. */
  percent?: number | null;
  /** The unit line under the number, e.g. "of 3 points". */
  caption?: string;
  tone?: keyof typeof TONE_CLASS;
  /** Accessible name for the graphic. Defaults to a description of the value. */
  label?: string;
  className?: string;
}) {
  const safe = Number.isFinite(percent)
    ? Math.min(1, Math.max(0, percent as number))
    : 0;
  const description = label ?? `Score: ${value}${caption ? ` ${caption}` : ""}`;

  return (
    <div
      className={cn(
        "relative flex size-28 shrink-0 items-center justify-center sm:size-32",
        className,
      )}
    >
      {/* The ring is rotated; the label is a sibling so it stays upright. */}
      <svg
        aria-label={description}
        className="absolute inset-0 size-full -rotate-90"
        role="img"
        viewBox="0 0 100 100"
      >
        <title>{description}</title>
        <circle
          className="fill-none stroke-border"
          cx="50"
          cy="50"
          r={RADIUS}
          strokeWidth="8"
        />
        <circle
          className={cn("fill-none", TONE_CLASS[tone])}
          cx="50"
          cy="50"
          r={RADIUS}
          stroke="currentColor"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - safe)}
          strokeWidth="8"
        />
      </svg>
      <span
        aria-hidden
        className="relative flex flex-col items-center leading-none"
      >
        <span className="font-heading text-xl font-semibold tabular-nums">
          {value}
        </span>
        {caption ? (
          <span className="mt-1 text-center text-[11px] text-muted-foreground">
            {caption}
          </span>
        ) : null}
      </span>
    </div>
  );
}
