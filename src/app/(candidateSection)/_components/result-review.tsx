import { CheckCircle2Icon, CircleMinusIcon, XCircleIcon } from "lucide-react";
import {
  DifficultyBadge,
  QuestionTypeBadge,
  StatusBadge,
} from "@/components/shared/status-badge";
import { correctAnswerLabel, toOptionList } from "@/lib/format";
import type { Answer, AssessmentQuestion, JsonValue } from "@/lib/types";

/**
 * The stored `response` is a `Prisma.JsonValue`, and for a multiple-choice
 * question it is the **option text**, not an index (§1.1 X1). Everything here
 * resolves display text only — nothing on this path is ever written back, so the
 * byte-identical save rule cannot be broken by reading.
 */
function responseText(value: JsonValue | null | undefined): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

function OutcomeBadge({ answer }: { answer: Answer | undefined }) {
  if (!answer) {
    return <StatusBadge dot={false} label="Not answered" tone="neutral" />;
  }
  if (answer.isCorrect === true) {
    return <StatusBadge label="Correct" tone="success" />;
  }
  if (answer.isCorrect === false) {
    return <StatusBadge label="Incorrect" tone="danger" />;
  }
  return <StatusBadge dot={false} label="Awaiting evaluation" tone="warning" />;
}

function QuestionOutcomeIcon({ answer }: { answer: Answer | undefined }) {
  if (!answer) {
    return (
      <CircleMinusIcon
        aria-hidden
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
      />
    );
  }
  if (answer.isCorrect === true) {
    return (
      <CheckCircle2Icon
        aria-hidden
        className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
      />
    );
  }
  if (answer.isCorrect === false) {
    return (
      <XCircleIcon
        aria-hidden
        className="mt-0.5 size-4 shrink-0 text-destructive"
      />
    );
  }
  return (
    <CircleMinusIcon
      aria-hidden
      className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
    />
  );
}

/**
 * The per-question review shown once an evaluator has released a result.
 *
 * Two rules are load-bearing:
 *
 * 1. **Every question in the assessment appears, answered or not.** An omitted
 *    question reads as "nothing to report", which hides the one thing a
 *    candidate most wants to know after a low score.
 * 2. **The answer key is only rendered when `released` is true.** The API
 *    returns `correctAnswer` on `GET /attempts/:id` for candidates too, so the
 *    locked branch deliberately does not read it at all (backend finding #10).
 */
export function ResultReview({
  questions,
  answers,
  released,
}: {
  questions: readonly AssessmentQuestion[];
  answers: readonly Answer[];
  released: boolean;
}) {
  const byQuestion = new Map(
    answers.map((answer) => [answer.questionId, answer]),
  );

  return (
    <ol className="flex flex-col divide-y divide-border">
      {questions.map((entry, index) => {
        const answer = byQuestion.get(entry.question.id);
        const options = toOptionList(entry.question.options);
        const yourAnswer = responseText(answer?.response);
        const correct =
          released && entry.question.correctAnswer !== null
            ? correctAnswerLabel(entry.question.correctAnswer, options)
            : "";
        const answered = Boolean(answer);

        return (
          <li className="flex gap-3 py-4 first:pt-0" key={entry.questionId}>
            <QuestionOutcomeIcon answer={answer} />

            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    Q{index + 1}
                  </span>
                  <QuestionTypeBadge value={entry.question.type} />
                  <DifficultyBadge value={entry.question.difficulty} />
                  <span className="font-mono text-xs text-muted-foreground">
                    {answer?.pointsAwarded ?? 0} / {entry.points} pts
                  </span>
                  <OutcomeBadge answer={answer} />
                </div>
                <p className="text-sm font-medium">{entry.question.title}</p>
                <p className="text-xs/relaxed whitespace-pre-wrap text-muted-foreground">
                  {entry.question.body}
                </p>
              </div>

              {options.length > 0 ? (
                <ol className="flex flex-col gap-1.5">
                  {options.map((option, optionIndex) => {
                    const chosen = answered && option === yourAnswer;
                    const isKey = released && option === correct;
                    return (
                      <li
                        className={
                          isKey
                            ? "flex items-start gap-2 border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-sm"
                            : chosen
                              ? "border border-primary/50 bg-primary/5 px-2.5 py-1.5 text-sm"
                              : "border border-border px-2.5 py-1.5 text-sm"
                        }
                        key={`${entry.questionId}-option-${optionIndex}`}
                      >
                        <span className="font-mono text-xs text-muted-foreground">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="min-w-0 flex-1">{option}</span>
                        {isKey ? (
                          <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                            correct answer
                          </span>
                        ) : chosen ? (
                          <span className="font-mono text-[11px] text-primary">
                            your answer
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              ) : null}

              <div className="flex flex-col gap-2">
                <div className="border border-border bg-muted/40 px-2.5 py-2">
                  <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                    Your answer
                  </p>
                  <p className="mt-1 text-sm/relaxed whitespace-pre-wrap">
                    {answered && yourAnswer
                      ? yourAnswer
                      : "You left this blank."}
                  </p>
                </div>

                {correct ? (
                  <div className="border border-border bg-muted/40 px-2.5 py-2">
                    <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                      {options.length > 0
                        ? "Correct answer"
                        : "Reference answer"}
                    </p>
                    <p className="mt-1 text-sm/relaxed whitespace-pre-wrap">
                      {correct}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
