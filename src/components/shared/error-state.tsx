import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorState({
  message,
  onRetry,
  title = "Something went wrong",
  className,
}: {
  message: string;
  onRetry?: () => void;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-destructive/35 bg-destructive/5 p-5",
        className,
      )}
      role="alert"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangleIcon aria-hidden className="size-4.5" />
          </span>
          <div className="min-w-0">
            <p className="font-heading text-sm font-bold">{title}</p>
            <p className="mt-1 text-sm/relaxed text-muted-foreground">
              {message}
            </p>
          </div>
        </div>
        {onRetry ? (
          <Button
            className="shrink-0"
            onClick={onRetry}
            size="sm"
            variant="outline"
          >
            <RefreshCwIcon data-icon="inline-start" />
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function InlineNotice({
  tone = "info",
  title,
  body,
  className,
}: {
  tone?: "info" | "success" | "warning" | "danger";
  title: string;
  body?: string;
  className?: string;
}) {
  const frame = {
    info: "border-info/35 bg-info/5",
    success: "border-success/35 bg-success/5",
    warning: "border-warning/35 bg-warning/5",
    danger: "border-destructive/35 bg-destructive/5",
  }[tone];

  return (
    <div className={cn("rounded-xl border p-4", frame, className)}>
      <p className="font-heading text-base font-bold tracking-tight">{title}</p>
      {body ? (
        <p className="mt-1 text-sm/relaxed text-muted-foreground">{body}</p>
      ) : null}
    </div>
  );
}

export function NotFoundState({ message }: { message: string }) {
  return (
    <EmptyState
      body="Double-check the identifier, then try the lookup again."
      className="bg-card"
      Icon={AlertTriangleIcon}
      title={message}
    />
  );
}
