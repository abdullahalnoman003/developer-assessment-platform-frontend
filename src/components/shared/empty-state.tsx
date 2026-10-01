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
        "w-full rounded-none border border-dashed border-border bg-card py-10",
        className,
      )}
    >
      {Icon ? (
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon className="size-4" />
          </EmptyMedia>
        </EmptyHeader>
      ) : null}
      <EmptyTitle className="font-heading text-sm">{title}</EmptyTitle>
      {body ? <EmptyDescription>{body}</EmptyDescription> : null}
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
}
