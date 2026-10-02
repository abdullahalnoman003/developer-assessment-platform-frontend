"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FileTextIcon,
  ListIcon,
  SaveIcon,
} from "lucide-react";
import { useState } from "react";
import { AttemptSubmitDialog } from "@/app/(candidateSection)/_components/attempt-submit-dialog";
import { QuestionInput } from "@/app/(candidateSection)/_components/question-input";
import { QuestionNavigator } from "@/app/(candidateSection)/_components/question-navigator";
import { RunnerHeader } from "@/app/(candidateSection)/_components/runner-header";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useCountdown } from "@/hooks/use-countdown";
import { toOptionList } from "@/lib/format";
import type { AssessmentQuestion, AttemptDetail, JsonValue } from "@/lib/types";

interface AttemptRunnerProps {
  attempt: AttemptDetail;
}

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

  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, JsonValue>>(() =>
    INITIAL_RESPONSES(attempt),
  );
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const currentQuestion = questions[index];
  const currentQuestionId = currentQuestion?.questionId ?? "";

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
    void saveNow();
    setIndex(newIndex);
  };

  const handlePrevious = () => {
    if (index > 0) handleNavigate(index - 1);
  };

  const handleNext = () => {
    if (index < questions.length - 1) handleNavigate(index + 1);
  };

  const toggleFlag = (questionId: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const isExpired = countdown.expired;

  const currentResponse = responses[currentQuestionId] ?? null;

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
          ) : null}

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
                  <ListIcon className="size-3.5 text-amber-500" />
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

/**
 * Renders the question body + the type-specific input. The MCQ branch reads
 * `toOptionList(question.options)` for the radio labels and stores the option
 * **text** as the response (§1.1 X1).
 */
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
