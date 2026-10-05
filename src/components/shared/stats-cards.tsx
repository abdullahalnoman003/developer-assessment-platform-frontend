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
  default: "border-border/80 bg-card shadow-sm",
  accent: "border-brand/30 bg-brand-soft-gradient shadow-sm",
  warning: "border-warning/35 bg-warning/5 shadow-sm",
  success: "border-success/35 bg-success/5 shadow-sm",
  danger: "border-destructive/35 bg-destructive/5 shadow-sm",
} as const;

const TONE_ICON = {
  default: "border-border bg-muted text-muted-foreground",
  accent: "border-brand/25 bg-brand-soft text-brand",
  warning: "border-warning/30 bg-warning/10 text-warning",
  success: "border-success/30 bg-success/10 text-success",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
} as const;

export function StatsCards({
  items,
  className,
}: {
  items: readonly StatCardItem[];
  className?: string;
}) {
  return (
    <dl className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {items.map((item) => (
        <div
          className={cn(
            "group flex flex-col gap-3 rounded-2xl border p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-md",
            TONE_FRAME[item.tone ?? "default"],
          )}
          key={item.label}
        >
          <div className="flex items-center justify-between gap-2">
            <dt className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {item.label}
            </dt>
            {item.Icon ? (
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-transform duration-300 group-hover:scale-105",
                  TONE_ICON[item.tone ?? "default"],
                )}
              >
                <item.Icon className="size-4" />
              </span>
            ) : null}
          </div>
          <dd className="font-heading text-3xl font-bold tracking-tight tabular-nums">
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
