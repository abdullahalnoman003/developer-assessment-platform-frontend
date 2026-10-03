import { cn } from "@/lib/utils";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TONE_CLASS = {
  success: "text-success",
  danger: "text-destructive",
  warning: "text-warning",
  neutral: "text-muted-foreground",
} as const;

export function ScoreRing({
  value,
  percent,
  caption,
  tone = "neutral",
  label,
  className,
}: {
  value: string;
  percent?: number | null;
  caption?: string;
  tone?: keyof typeof TONE_CLASS;
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
