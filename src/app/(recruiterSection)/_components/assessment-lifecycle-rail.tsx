import { CheckIcon } from "lucide-react";
import { AssessmentStatusBadge } from "@/components/shared/status-badge";
import {
  ASSESSMENT_LIFECYCLE,
  ASSESSMENT_NEXT_STATUS,
  ASSESSMENT_STATUS_HELP,
} from "@/lib/constants";
import type { AssessmentStatus } from "@/lib/types";

/**
 * A read-only rendering of the backend's linear lifecycle. The chain is not
 * decorative: `PATCH /assessments/:id` refuses any status that is not the
 * immediate successor, so showing four freely clickable states would promise
 * the user something the API will not do. The one legal next step is offered
 * by the sibling action bar.
 */
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
                "flex flex-1 flex-col gap-1.5 border p-3",
                isCurrent
                  ? "border-primary bg-primary/5"
                  : isDone
                    ? "border-border bg-muted/40"
                    : "border-dashed border-border",
              ].join(" ")}
              key={step}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] tracking-wider text-muted-foreground">
                  {`0${index + 1}`}
                </span>
                {isDone ? (
                  <CheckIcon
                    aria-label="Already completed"
                    className="size-3.5 text-emerald-600 dark:text-emerald-400"
                  />
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

      <p className="border-t border-border pt-3 text-xs/relaxed text-muted-foreground">
        {next
          ? `Next allowed step: ${ASSESSMENT_STATUS_HELP[next].split(".")[0]}.`
          : "ARCHIVED is terminal — there is no step after it."}
      </p>
    </div>
  );
}
