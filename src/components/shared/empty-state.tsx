import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export function EmptyState({
  Icon,
  title,
  body,
  action,
  className,
}: {
  Icon?: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Empty
      className={cn(
        "w-full rounded-2xl border border-dashed border-border bg-card/60 py-12",
        className,
      )}
    >
      {Icon ? (
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon className="size-5" />
          </EmptyMedia>
        </EmptyHeader>
      ) : null}
      <EmptyTitle className="font-heading text-base font-bold">
        {title}
      </EmptyTitle>
      {body ? <EmptyDescription>{body}</EmptyDescription> : null}
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
}
