import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface StatCardItem {
  label: string;
  value: ReactNode;
  hint?: string;
  Icon?: LucideIcon;
  tone?: "default" | "accent" | "warning" | "success" | "danger";
}

const TONE_FRAME = {
  default: "border-border bg-card",
  accent: "border-primary/40 bg-primary/5",
  warning: "border-warning/40 bg-warning/5",
  success: "border-success/40 bg-success/5",
  danger: "border-destructive/40 bg-destructive/5",
} as const;

const TONE_ICON = {
  default: "border-border bg-muted text-muted-foreground",
  accent: "border-primary/40 bg-primary/10 text-primary",
  warning: "border-warning/40 bg-warning/10 text-warning",
  success: "border-success/40 bg-success/10 text-success",
  danger: "border-destructive/40 bg-destructive/10 text-destructive",
} as const;

export function StatsCards({
  items,
  className,
}: {
  items: readonly StatCardItem[];
  className?: string;
}) {
  return (
    <dl className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {items.map((item) => (
        <div
          className={cn(
            "flex flex-col gap-2 border p-4",
            TONE_FRAME[item.tone ?? "default"],
          )}
          key={item.label}
        >
          <div className="flex items-center justify-between gap-2">
            <dt className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
              {item.label}
            </dt>
            {item.Icon ? (
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center border",
                  TONE_ICON[item.tone ?? "default"],
                )}
              >
                <item.Icon className="size-3.5" />
              </span>
            ) : null}
          </div>
          <dd className="font-heading text-2xl font-semibold tabular-nums">
            {item.value}
          </dd>
          {item.hint ? (
            <p className="text-xs/relaxed text-muted-foreground">{item.hint}</p>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
