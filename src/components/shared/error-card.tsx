import { AlertTriangleIcon, InfoIcon, ShieldAlertIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ErrorCardVariant = "inline" | "blocked" | "empty";

const VARIANTS = {
  inline: {
    icon: AlertTriangleIcon,
    accent: "text-destructive",
    frame: "border-destructive/30 bg-destructive/5",
  },
  blocked: {
    icon: ShieldAlertIcon,
    accent: "text-destructive",
    frame: "border-destructive/30 bg-destructive/5",
  },
  empty: {
    icon: InfoIcon,
    accent: "text-muted-foreground",
    frame: "border-border bg-card",
  },
} as const;

export interface ErrorCardProps {
  variant?: ErrorCardVariant;
  title: string;
  description: string;
  message?: string | null;
  digest?: string | null;
  statusCode?: number | null;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function ErrorCard({
  variant = "inline",
  title,
  description,
  message,
  digest,
  statusCode,
  action,
  className,
  children,
}: ErrorCardProps) {
  const config = VARIANTS[variant];
  const Icon = config.icon;

  return (
    <section
      role="alert"
      className={cn(
        "flex w-full flex-col items-start gap-3 border p-5",
        config.frame,
        className,
      )}
    >
      <div className="flex w-full items-start gap-3">
        <Icon
          aria-hidden
          className={cn("mt-0.5 size-4 shrink-0", config.accent)}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-sm font-medium">{title}</h2>
            {statusCode ? (
              <span className="font-mono text-[0.7rem] text-muted-foreground">
                HTTP {statusCode}
              </span>
            ) : null}
          </div>
          <p className="text-xs/relaxed text-muted-foreground">{description}</p>
        </div>
      </div>

      {message ? (
        <p className="w-full border-l-2 border-current/30 pl-3 text-xs/relaxed text-foreground/80">
          {message}
        </p>
      ) : null}

      {children}

      {digest ? (
        <p className="font-mono text-[0.7rem] text-muted-foreground">
          Reference: {digest}
        </p>
      ) : null}

      {action ? (
        <div className="flex flex-wrap items-center gap-2">{action}</div>
      ) : null}
    </section>
  );
}
