"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  FileTextIcon,
  ListIcon,
  SaveIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { AttemptSubmitDialog } from "@/app/(candidateSection)/_components/attempt-submit-dialog";
import { QuestionInput } from "@/app/(candidateSection)/_components/question-input";
import { QuestionNavigator } from "@/app/(candidateSection)/_components/question-navigator";
import { RunnerHeader } from "@/app/(candidateSection)/_components/runner-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useCountdown } from "@/hooks/use-countdown";
import { toOptionList } from "@/lib/format";
import type { AssessmentQuestion, AttemptDetail, JsonValue } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AttemptRunnerProps {
  attempt: AttemptDetail;
}

const INDEX_PARAM = "i";
const FLAG_PARAM = "flag";

const INITIAL_RESPONSES = (
  attempt: AttemptDetail,
): Record<string, JsonValue> => {
  const out: Record<string, JsonValue> = {};
  for (const entry of attempt.invitation.assessment.questions) {
    const existing = attempt.answers.find(
      (a) => a.questionId === entry.questionId,
    );
    out[entry.questionId] = existing ? existing.response : null;
  }
  return out;
};

export function AttemptRunner({ attempt }: AttemptRunnerProps) {
  const questions: AssessmentQuestion[] = [
    ...attempt.invitation.assessment.questions,
  ].sort((a, b) => a.order - b.order);

  const searchParams = useSearchParams();
  const [index, setIndex] = useState(() => {
    const raw = Number(searchParams.get(INDEX_PARAM));
    return Number.isInteger(raw) && raw >= 1 ? raw - 1 : 0;
  });
  const [responses, setResponses] = useState<Record<string, JsonValue>>(() =>
    INITIAL_RESPONSES(attempt),
  );
  const [flagged, setFlagged] = useState<Set<string>>(() => {
    const raw = searchParams.get(FLAG_PARAM);
    return new Set(raw ? raw.split(",").filter(Boolean) : []);
  });
  const currentQuestion = questions[index];
  const currentQuestionId = currentQuestion?.questionId ?? "";

  // history.replaceState, not router.replace: the index must be shareable
  // without refetching the attempt through the API on every navigation
  const writeRunnerUrl = useCallback(
    (nextIndex: number, nextFlagged: Set<string>) => {
      const params = new URLSearchParams(window.location.search);
      if (nextIndex > 0) {
        params.set(INDEX_PARAM, String(nextIndex + 1));
      } else {
        params.delete(INDEX_PARAM);
      }
      if (nextFlagged.size > 0) {
        params.set(FLAG_PARAM, [...nextFlagged].join(","));
      } else {
        params.delete(FLAG_PARAM);
      }
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        qs ? `${window.location.pathname}?${qs}` : window.location.pathname,
      );
    },
    [],
  );

  const countdown = useCountdown(attempt.deadline);
  const { dirty, saving, lastSaved, saveNow } = useAutoSave({
    attemptId: attempt.id,
    answers: responses,
  });

  const handleResponseChange = (response: JsonValue | null) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestionId]: response,
    }));
  };

  const handleNavigate = (newIndex: number) => {
    const maxIndex = Math.max(questions.length - 1, 0);
    const clamped = Math.min(Math.max(newIndex, 0), maxIndex);
    void saveNow();
    setIndex(clamped);
    writeRunnerUrl(clamped, flagged);
  };

  const handlePrevious = () => {
    if (index > 0) handleNavigate(index - 1);
  };

  const handleNext = () => {
    if (index < questions.length - 1) handleNavigate(index + 1);
  };

  const toggleFlag = (questionId: string) => {
    const next = new Set(flagged);
    if (next.has(questionId)) next.delete(questionId);
    else next.add(questionId);
    setFlagged(next);
    writeRunnerUrl(index, next);
  };

  const isExpired = countdown.expired;

  const currentResponse = responses[currentQuestionId] ?? null;

  const answeredCount = Object.values(responses).filter(
    (value) => value !== null && value !== undefined && value !== "",
  ).length;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <RunnerHeader
        countdown={countdown}
        dirty={dirty}
        lastSaved={lastSaved}
        questionIndex={index}
        saving={saving}
        title={attempt.invitation.assessment.title}
        totalQuestions={questions.length}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-14 shrink-0 overflow-y-auto border-r border-border sm:flex sm:flex-col">
          <QuestionNavigator
            currentQuestionId={currentQuestionId}
            flagged={flagged}
            onNavigate={handleNavigate}
            onToggleFlag={toggleFlag}
            questions={questions}
            responses={responses}
          />
        </aside>

        <section className="flex-1 overflow-y-auto p-6">
          {currentQuestion ? (
            <QuestionPane
              autoFocus={true}
              key={currentQuestionId}
              onChange={handleResponseChange}
              question={currentQuestion}
              response={currentResponse}
            />
          ) : (
            <EmptyState
              body="This attempt has no questions attached, so there is nothing to answer."
              title="Nothing to answer"
            />
          )}

          <Collapsible className="mb-4 border border-border sm:hidden">
            <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-medium transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
              <span>
                Question {Math.min(index + 1, questions.length)} of{" "}
                {questions.length}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                {answeredCount} answered ·{" "}
                {Math.max(questions.length - answeredCount, 0)} left
                <ChevronDownIcon className="size-3.5" />
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-wrap gap-1.5 border-t border-border p-3">
                {questions.map((entry, i) => (
                  <button
                    aria-current={
                      entry.questionId === currentQuestionId || undefined
                    }
                    aria-label={`Question ${i + 1}, ${
                      flagged.has(entry.questionId)
                        ? "flagged"
                        : responses[entry.questionId]
                          ? "answered"
                          : "not answered"
                    }`}
                    className={cn(
                      "size-8 rounded-none border text-xs font-medium focus-visible:ring-2 focus-visible:ring-ring",
                      entry.questionId === currentQuestionId
                        ? "border-primary bg-primary text-primary-foreground"
                        : flagged.has(entry.questionId)
                          ? "border-warning/50 bg-warning/10"
                          : responses[entry.questionId]
                            ? "border-success/40 bg-success/10"
                            : "border-border text-muted-foreground",
                    )}
                    key={entry.questionId}
                    onClick={() => handleNavigate(i)}
                    type="button"
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="border-t border-border p-3">
                <Button
                  className="w-full"
                  disabled={!currentQuestionId}
                  onClick={() => toggleFlag(currentQuestionId)}
                  size="sm"
                  variant="outline"
                >
                  <ListIcon className="size-3.5" />
                  {flagged.has(currentQuestionId)
                    ? "Remove flag from this question"
                    : "Flag this question"}
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <Button
              onClick={handlePrevious}
              size="sm"
              variant="outline"
              disabled={index === 0}
            >
              <ArrowLeftIcon className="size-3.5" />
              Previous
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {flagged.size > 0 ? (
                <>
                  <ListIcon className="size-3.5 text-warning" />
                  <span>
                    {flagged.size} question{flagged.size === 1 ? "" : "s"}{" "}
                    flagged
                  </span>
                </>
              ) : null}
              {countdown.warningLevel === "critical" && !isExpired ? (
                <span className="text-destructive">
                  Less than 5 minutes remaining
                </span>
              ) : null}
            </div>
            <Button
              onClick={handleNext}
              size="sm"
              variant="outline"
              disabled={index === questions.length - 1}
            >
              Next
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </div>
        </section>
      </div>

      <footer className="flex items-center justify-between border-t border-border bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          {dirty && !saving && !isExpired ? (
            <Button onClick={() => void saveNow()} size="sm" variant="outline">
              <SaveIcon className="size-3.5" />
              Save now
            </Button>
          ) : null}
          {isExpired ? (
            <span className="text-xs text-destructive">
              The timer has run out. Your answers are saved, but you can no
              longer submit.
            </span>
          ) : null}
        </div>

        <AttemptSubmitDialog
          attemptId={attempt.id}
          questions={questions}
          responses={responses}
          trigger={
            <Button disabled={isExpired || saving} size="sm" variant="default">
              {saving ? (
                <Spinner className="size-3.5" />
              ) : (
                <FileTextIcon className="size-3.5" />
              )}
              Submit attempt
            </Button>
          }
        />
      </footer>
    </div>
  );
}

function QuestionPane({
  question,
  response,
  onChange,
  autoFocus,
}: {
  question: AssessmentQuestion;
  response: JsonValue | null;
  onChange: (response: JsonValue | null) => void;
  autoFocus: boolean;
}) {
  const options = toOptionList(question.question.options);
  const maxScore = question.points;

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-wrap items-start gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          ·{maxScore} pt{maxScore === 1 ? "" : "s"}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {question.question.type === "MCQ"
            ? `${options.length} options`
            : question.question.type === "WRITTEN"
              ? "Short answer"
              : "Code editor"}
        </span>
      </header>

      <h2 className="font-heading text-lg font-semibold">
        {question.question.title}
      </h2>
      <p className="text-sm/relaxed whitespace-pre-wrap text-muted-foreground">
        {question.question.body}
      </p>

      <QuestionInput
        autoFocus={autoFocus}
        onChange={onChange}
        question={question}
        response={response}
      />
    </section>
  );
}
