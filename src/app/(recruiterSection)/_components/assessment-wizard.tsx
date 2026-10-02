"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ListChecksIcon,
  Settings2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { wizardCreateAssessmentAction } from "@/app/(recruiterSection)/_actions/recruiter";
import { QuestionPicker } from "@/app/(recruiterSection)/_components/question-picker";
import {
  DifficultyBadge,
  QuestionTypeBadge,
} from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { truncate } from "@/lib/format";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import type { Question } from "@/lib/types";
import { type ActionState, IDLE_ACTION_STATE } from "@/lib/types";
import { createAssessmentSchema } from "@/lib/validations";

const TOTAL_STEPS = 3;

const STEPS = [
  { step: 1, label: "Details", Icon: Settings2Icon },
  { step: 2, label: "Pick questions", Icon: ListChecksIcon },
  { step: 3, label: "Review", Icon: CheckIcon },
] as const;

const STORAGE_KEY = "codearena:assessment-wizard";

interface Draft {
  description: string;
  durationMins: number;
  passScore: number;
  passScoreEnabled: boolean;
  questionIds: string[];
  title: string;
}

const EMPTY_DRAFT: Draft = {
  description: "",
  durationMins: 60,
  passScore: 0,
  passScoreEnabled: false,
  questionIds: [],
  title: "",
};

/**
 * Flow A step 3. The backend has no "create with questions" endpoint, so
 * `wizardCreateAssessmentAction` runs the three sequential calls itself
 * (create draft → attach questions → publish) and returns `redirectTo` for the
 * detail page.
 */
export function AssessmentWizard({ questions }: { questions: Question[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ActionState>(IDLE_ACTION_STATE);
  const [pending, startTransition] = useTransition();

  const stepParam = searchParams.get("step");
  const parsedStep = Number(stepParam);
  const step =
    Number.isInteger(parsedStep) && parsedStep >= 1 && parsedStep <= TOTAL_STEPS
      ? parsedStep
      : 1;

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  const form = useForm({
    resolver: zodResolver(createAssessmentSchema),
    defaultValues: { description: "", durationMins: 60, title: "" },
    mode: "onBlur",
  });
  const { handleSubmit, register, setError, trigger, formState } = form;

  /**
   * Only the *step* lives in the URL. The draft itself is persisted to
   * `sessionStorage` so an accidental refresh mid-way does not discard a typed
   * description or a hand-picked question list. It is deliberately not in the
   * URL: a 5000-character description has no business in a query string, and a
   * link to someone else's half-built assessment would be meaningless.
   */
  useEffect(() => {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setDraft({ ...EMPTY_DRAFT, ...(parsed as Partial<Draft>) });
      }
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const goToStep = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 1), TOTAL_STEPS);
      router.replace(clamped === 1 ? "" : `?step=${clamped}`, {
        scroll: false,
      });
    },
    [router],
  );

  const byId = useMemo(
    () => new Map(questions.map((question) => [question.id, question])),
    [questions],
  );

  const selected = draft.questionIds
    .map((id) => byId.get(id))
    .filter((question): question is Question => Boolean(question));

  const patch = (next: Partial<Draft>) =>
    setDraft((current) => ({ ...current, ...next }));

  const toggleQuestion = (id: string) => {
    patch({
      questionIds: draft.questionIds.includes(id)
        ? draft.questionIds.filter((value) => value !== id)
        : [...draft.questionIds, id],
    });
  };

  const totalPoints = selected.length;

  const onSubmit = handleSubmit((values) => {
    if (draft.questionIds.length === 0) {
      toast.error("Pick at least one question before publishing.");
      goToStep(2);
      return;
    }

    const data = new FormData();
    data.set("title", values.title);
    data.set("description", draft.description);
    data.set("durationMins", String(values.durationMins));
    data.set(
      "passScore",
      draft.passScoreEnabled ? String(draft.passScore) : "",
    );
    data.set("questionIds", JSON.stringify(draft.questionIds));
    data.set("publish", "true");

    startTransition(async () => {
      const result = await wizardCreateAssessmentAction(
        IDLE_ACTION_STATE,
        data,
      );
      setState(result);
      if (result.status === "success" && result.redirectTo) {
        window.sessionStorage.removeItem(STORAGE_KEY);
        toast.success(result.message);
        router.push(result.redirectTo);
        router.refresh();
        return;
      }
      toast.error(result.message || VALIDATION_MESSAGES.unknown);
      for (const [name, messages] of Object.entries(result.fieldErrors)) {
        if (name !== "form" && messages[0]) {
          setError(name as "title" | "durationMins", { message: messages[0] });
        }
      }
    });
  });

  const saveAsDraft = handleSubmit((values) => {
    const data = new FormData();
    data.set("title", values.title);
    data.set("description", draft.description);
    data.set("durationMins", String(values.durationMins));
    data.set(
      "passScore",
      draft.passScoreEnabled ? String(draft.passScore) : "",
    );
    data.set("questionIds", JSON.stringify(draft.questionIds));
    data.set("publish", "false");

    startTransition(async () => {
      const result = await wizardCreateAssessmentAction(
        IDLE_ACTION_STATE,
        data,
      );
      setState(result);
      if (result.status === "success" && result.redirectTo) {
        window.sessionStorage.removeItem(STORAGE_KEY);
        toast.success(result.message);
        router.push(result.redirectTo);
        router.refresh();
        return;
      }
      toast.error(result.message || VALIDATION_MESSAGES.unknown);
    });
  });

  /** Step 1 cannot be left until the details parse. */
  const leaveStepOne = async () => {
    const ok = await trigger();
    if (!ok) {
      toast.error("Fix the highlighted fields first.");
      return;
    }
    patch({
      durationMins: Number(form.getValues("durationMins")),
      title: form.getValues("title"),
    });
    goToStep(2);
  };

  const leaveStepTwo = () => {
    if (draft.questionIds.length === 0) {
      toast.error("Pick at least one question to continue.");
      return;
    }
    goToStep(3);
  };

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Wizard progress">
        <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          {STEPS.map(({ step: number, label, Icon }) => {
            const isCurrent = number === step;
            const isDone = number < step;
            return (
              <li className="flex items-center gap-2" key={number}>
                <button
                  aria-current={isCurrent ? "step" : undefined}
                  className={
                    isCurrent
                      ? "flex items-center gap-2 border border-primary bg-primary/10 px-2.5 py-1.5 font-mono text-xs text-primary"
                      : "flex items-center gap-2 border border-border px-2.5 py-1.5 font-mono text-xs text-muted-foreground hover:border-primary/40"
                  }
                  disabled={number > step}
                  onClick={() => goToStep(number)}
                  type="button"
                >
                  <Icon aria-hidden className="size-3.5" />
                  {number}. {label}
                  {isDone ? <span className="sr-only">(completed)</span> : null}
                </button>
                {number < TOTAL_STEPS ? (
                  <span
                    aria-hidden
                    className="hidden h-px flex-1 bg-border sm:block"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>

      {state.status === "error" ? (
        <p
          className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      {step === 1 ? (
        <form
          className="flex flex-col gap-5"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void leaveStepOne();
          }}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(formState.errors.title)}>
              <FieldLabel htmlFor="wizard-title">Title</FieldLabel>
              <Input
                id="wizard-title"
                maxLength={300}
                placeholder="Senior backend engineer — screening"
                type="text"
                {...register("title")}
              />
              <FieldDescription>
                Candidates see this on their invitation and on the attempt
                screen.
              </FieldDescription>
              <FieldError
                errors={[{ message: formState.errors.title?.message }]}
              />
            </Field>

            <Field data-invalid={Boolean(formState.errors.description)}>
              <FieldLabel htmlFor="wizard-description">
                Description (optional)
              </FieldLabel>
              <Textarea
                className="min-h-28"
                id="wizard-description"
                maxLength={5000}
                onChange={(event) => patch({ description: event.target.value })}
                placeholder="What this assessment covers and what to expect."
                value={draft.description}
              />
              <FieldError
                errors={[{ message: formState.errors.description?.message }]}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(formState.errors.durationMins)}>
                <FieldLabel htmlFor="wizard-duration">
                  Time limit (minutes)
                </FieldLabel>
                <Input
                  id="wizard-duration"
                  inputMode="numeric"
                  max={600}
                  min={1}
                  type="number"
                  {...register("durationMins")}
                />
                <FieldDescription>
                  Between 1 and 600. The candidate's timer is anchored to the
                  server deadline, not to their own clock.
                </FieldDescription>
                <FieldError
                  errors={[{ message: formState.errors.durationMins?.message }]}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="wizard-pass-score">
                  Pass mark (points, optional)
                </FieldLabel>
                <div className="flex items-center gap-2">
                  <Input
                    disabled={!draft.passScoreEnabled}
                    id="wizard-pass-score"
                    inputMode="numeric"
                    max={10000}
                    min={0}
                    onChange={(event) =>
                      patch({ passScore: Number(event.target.value) || 0 })
                    }
                    type="number"
                    value={draft.passScore}
                  />
                  <Button
                    aria-pressed={draft.passScoreEnabled}
                    onClick={() =>
                      patch({ passScoreEnabled: !draft.passScoreEnabled })
                    }
                    size="sm"
                    type="button"
                    variant={draft.passScoreEnabled ? "secondary" : "outline"}
                  >
                    {draft.passScoreEnabled ? "On" : "Off"}
                  </Button>
                </div>
                <FieldDescription>
                  Every question is worth 1 point, so the achievable total is{" "}
                  {totalPoints || 0}. Leave it off to score without a pass
                  threshold.
                </FieldDescription>
              </Field>
            </div>
          </FieldGroup>

          <div className="flex flex-wrap items-center gap-2">
            <Button disabled={pending} type="submit">
              <ArrowRightIcon className="size-3.5" />
              Next: pick questions
            </Button>
            <Button
              render={<Link href="/dashboard/recruiter/assessments" />}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-5">
          <QuestionPicker
            onToggle={toggleQuestion}
            questions={questions}
            selectedIds={draft.questionIds}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={leaveStepTwo} type="button">
              <ArrowRightIcon className="size-3.5" />
              Next: review
            </Button>
            <Button onClick={() => goToStep(1)} type="button" variant="outline">
              <ArrowLeftIcon className="size-3.5" />
              Back
            </Button>
            <span className="text-xs text-muted-foreground">
              {draft.questionIds.length} selected
            </span>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <form className="flex flex-col gap-5" noValidate onSubmit={onSubmit}>
          <div className="border border-border bg-card">
            <h2 className="border-b border-border px-4 py-3 font-heading text-sm font-semibold">
              Summary
            </h2>
            <dl className="flex flex-col gap-2 p-4 text-sm">
              {[
                ["Title", draft.title || form.getValues("title")],
                ["Time limit", `${form.getValues("durationMins")} minutes`],
                [
                  "Pass mark",
                  draft.passScoreEnabled
                    ? `${draft.passScore} points`
                    : "Not set",
                ],
                ["Questions", `${draft.questionIds.length}`],
                [
                  "Description",
                  draft.description ? truncate(draft.description, 160) : "None",
                ],
              ].map(([label, value]) => (
                <div className="flex gap-3" key={label}>
                  <dt className="w-28 shrink-0 text-xs text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="min-w-0 flex-1">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="border border-border bg-card">
            <h2 className="border-b border-border px-4 py-3 font-heading text-sm font-semibold">
              Questions in order
            </h2>
            {selected.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No questions selected.
              </p>
            ) : (
              <ol className="flex flex-col divide-y divide-border">
                {selected.map((question, index) => (
                  <li
                    className="flex flex-wrap items-center gap-2 px-4 py-2.5"
                    key={question.id}
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {index + 1}.
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {question.title}
                    </span>
                    <QuestionTypeBadge value={question.type} />
                    <DifficultyBadge value={question.difficulty} />
                  </li>
                ))}
              </ol>
            )}
          </div>

          <p className="text-xs/relaxed text-muted-foreground">
            Publishing runs three backend calls in order: create the draft,
            attach these {draft.questionIds.length} question
            {draft.questionIds.length === 1 ? "" : "s"}, then flip the lifecycle
            to PUBLISHED. If a later call fails the draft is kept, so you can
            finish it from the assessment page rather than start over.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button disabled={pending} type="submit">
              {pending ? <Spinner className="size-3.5" /> : null}
              {pending ? "Publishing" : "Publish assessment"}
            </Button>
            <Button
              disabled={pending}
              onClick={() => void saveAsDraft()}
              type="button"
              variant="outline"
            >
              Save as draft instead
            </Button>
            <Button onClick={() => goToStep(2)} type="button" variant="ghost">
              <ArrowLeftIcon className="size-3.5" />
              Back
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
