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
        "border border-destructive/40 bg-destructive/5 p-4",
        className,
      )}
      role="alert"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <AlertTriangleIcon
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-destructive"
          />
          <div className="min-w-0">
            <p className="font-heading text-sm font-semibold">{title}</p>
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
            <RefreshCwIcon className="size-3.5" />
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
    info: "border-sky-500/40 bg-sky-500/5",
    success: "border-emerald-500/40 bg-emerald-500/5",
    warning: "border-amber-500/40 bg-amber-500/5",
    danger: "border-destructive/40 bg-destructive/5",
  }[tone];

  return (
    <div className={cn("border p-3", frame, className)}>
      <p className="font-heading text-xs font-semibold">{title}</p>
      {body ? (
        <p className="mt-1 text-xs/relaxed text-muted-foreground">{body}</p>
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
