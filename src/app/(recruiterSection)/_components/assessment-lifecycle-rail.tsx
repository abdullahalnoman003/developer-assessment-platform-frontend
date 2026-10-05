import { CheckIcon } from "lucide-react";
import { AssessmentStatusBadge } from "@/components/shared/status-badge";
import {
  ASSESSMENT_LIFECYCLE,
  ASSESSMENT_NEXT_STATUS,
  ASSESSMENT_STATUS_HELP,
} from "@/lib/constants";
import type { AssessmentStatus } from "@/lib/types";

export function AssessmentLifecycleRail({
  status,
}: {
  status: AssessmentStatus;
}) {
  const currentIndex = ASSESSMENT_LIFECYCLE.indexOf(status);
  const next = ASSESSMENT_NEXT_STATUS[status] ?? null;

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        {ASSESSMENT_LIFECYCLE.map((step, index) => {
          const isCurrent = step === status;
          const isDone = index < currentIndex;
          return (
            <li
              className={[
                "flex flex-1 flex-col gap-1.5 rounded-xl border p-3",
                isCurrent
                  ? "border-brand/50 bg-brand-soft"
                  : isDone
                    ? "border-border/70 bg-muted/40"
                    : "border-dashed border-border",
              ].join(" ")}
              key={step}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] tracking-wider text-muted-foreground">
                  {`0${index + 1}`}
                </span>
                {isDone ? (
                  <CheckIcon aria-hidden className="size-3.5 text-success" />
                ) : null}
              </div>
              <AssessmentStatusBadge value={step} />
              {isCurrent ? (
                <span className="text-[11px] text-muted-foreground">
                  current
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="text-sm/relaxed text-muted-foreground">
        {ASSESSMENT_STATUS_HELP[status]}
      </p>

      <p className="border-t border-border/70 pt-3 text-xs/relaxed text-muted-foreground">
        {next
          ? `Next allowed step: ${ASSESSMENT_STATUS_HELP[next].split(".")[0]}.`
          : "ARCHIVED is terminal — there is no step after it."}
      </p>
    </div>
  );
}
