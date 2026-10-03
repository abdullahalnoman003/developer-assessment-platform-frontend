"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  createQuestionAction,
  updateQuestionAction,
} from "@/app/(recruiterSection)/_actions/recruiter";
import { TagInput } from "@/components/shared/tag-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from "@/lib/constants";
import { toOptionList } from "@/lib/format";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import type {
  Difficulty,
  JsonValue,
  Question,
  QuestionType,
} from "@/lib/types";
import { type ActionState, IDLE_ACTION_STATE } from "@/lib/types";
import {
  type CreateQuestionInput,
  createQuestionSchema,
} from "@/lib/validations";

const TYPE_OPTIONS = Object.entries(QUESTION_TYPE_LABELS) as readonly [
  QuestionType,
  string,
][];
const DIFFICULTY_OPTIONS = Object.entries(DIFFICULTY_LABELS) as readonly [
  Difficulty,
  string,
][];

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 8;

const SELECT_CLASS =
  "h-9 w-full border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50";

interface Seed {
  body: string;
  correctAnswer: string;
  difficulty: Difficulty;
  options: string[];
  tags: string[];
  title: string;
  type: QuestionType;
}

interface OptionRow {
  id: string;
  text: string;
}

let optionSequence = 0;
const newOption = (text = ""): OptionRow => {
  optionSequence += 1;
  return { id: `opt-${optionSequence}`, text };
};
const toRows = (texts: readonly string[]): OptionRow[] =>
  texts.length > 0
    ? texts.map((text) => newOption(text))
    : [newOption(), newOption()];

function seedFromQuestion(question?: Question): Seed {
  const options = toOptionList(question?.options);
  const raw: JsonValue | null = question?.correctAnswer ?? null;
  return {
    body: question?.body ?? "",
    correctAnswer:
      raw === null ? "" : typeof raw === "string" ? raw : JSON.stringify(raw),
    difficulty: question?.difficulty ?? "MEDIUM",
    options: options.length > 0 ? options : ["", ""],
    tags: question?.tags ?? [],
    title: question?.title ?? "",
    type: question?.type ?? "MCQ",
  };
}

export function QuestionDialog({ question }: { question?: Question }) {
  const isEdit = Boolean(question);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionState>(IDLE_ACTION_STATE);
  const [pending, startTransition] = useTransition();

  // memoised on the question so the reset effect below has a stable seed
  const seed = useMemo(() => seedFromQuestion(question), [question]);

  const [rows, setRows] = useState<OptionRow[]>(() => toRows(seed.options));
  const [correctAnswer, setCorrectAnswer] = useState(seed.correctAnswer);
  const [tags, setTags] = useState<string[]>(seed.tags);

  const form = useForm<CreateQuestionInput>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      body: seed.body,
      difficulty: seed.difficulty,
      options: seed.options,
      title: seed.title,
      type: seed.type,
    },
    mode: "onBlur",
  });

  const { handleSubmit, register, reset, setValue, setError, watch } = form;
  const type = watch("type");
  const isMcq = type === "MCQ";

  useEffect(() => {
    if (!open) return;
    reset({
      body: seed.body,
      difficulty: seed.difficulty,
      options: seed.options,
      title: seed.title,
      type: seed.type,
    });
    setRows(toRows(seed.options));
    setCorrectAnswer(seed.correctAnswer);
    setTags(seed.tags);
    setState(IDLE_ACTION_STATE);
  }, [open, reset, seed]);

  const syncRows = (next: OptionRow[]) => {
    setRows(next);
    setValue(
      "options",
      next.map((row) => row.text),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const syncAnswer = (next: string) => {
    setCorrectAnswer(next);
    setValue("correctAnswer", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const changeType = (next: QuestionType) => {
    setValue("type", next, { shouldDirty: true, shouldValidate: true });
    if (next !== "MCQ") {
      syncRows([]);
    } else if (rows.length === 0) {
      syncRows([newOption(), newOption()]);
    }
  };

  const onSubmit = handleSubmit((values) => {
    const data = new FormData();
    data.set("type", values.type);
    data.set("difficulty", values.difficulty);
    data.set("title", values.title);
    data.set("body", values.body);
    // only rows with text become options, a blank row is an unfinished edit
    data.set(
      "options",
      JSON.stringify(rows.map((row) => row.text.trim()).filter(Boolean)),
    );
    data.set("correctAnswer", correctAnswer);
    data.set("tags", JSON.stringify(tags));
    if (question) data.set("questionId", question.id);

    const action = question ? updateQuestionAction : createQuestionAction;

    startTransition(async () => {
      const result = await action(IDLE_ACTION_STATE, data);
      setState(result);
      if (result.status === "success") {
        toast.success(result.message);
        setOpen(false);
        return;
      }
      toast.error(result.message || VALIDATION_MESSAGES.unknown);
      for (const [name, messages] of Object.entries(result.fieldErrors)) {
        if (name !== "form" && messages[0]) {
          setError(name as keyof CreateQuestionInput, { message: messages[0] });
        }
      }
    });
  });

  const errors = form.formState.errors;
  const optionError =
    typeof errors.options?.message === "string" ? errors.options.message : "";
  const answerError =
    typeof errors.correctAnswer?.message === "string"
      ? errors.correctAnswer.message
      : "";

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button
            size={isEdit ? "sm" : "default"}
            variant={isEdit ? "outline" : "default"}
          >
            <PlusIcon className="size-3.5" />
            {isEdit ? "Edit" : "New question"}
          </Button>
        }
      />

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-base">
            {isEdit ? "Edit question" : "New question"}
          </DialogTitle>
          <DialogDescription>
            Questions belong to your company and can be reused across every
            assessment.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-5" noValidate onSubmit={onSubmit}>
          {state.status === "error" ? (
            <p
              className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {state.message}
            </p>
          ) : null}

          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.type)}>
                <FieldLabel htmlFor="question-type">Type</FieldLabel>
                <select
                  className={SELECT_CLASS}
                  id="question-type"
                  onChange={(event) =>
                    changeType(event.target.value as QuestionType)
                  }
                  value={type}
                >
                  {TYPE_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <FieldError errors={[{ message: errors.type?.message }]} />
              </Field>

              <Field data-invalid={Boolean(errors.difficulty)}>
                <FieldLabel htmlFor="question-difficulty">
                  Difficulty
                </FieldLabel>
                <select
                  className={SELECT_CLASS}
                  id="question-difficulty"
                  {...register("difficulty")}
                >
                  {DIFFICULTY_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <FieldError
                  errors={[{ message: errors.difficulty?.message }]}
                />
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.title)}>
              <FieldLabel htmlFor="question-title">Title</FieldLabel>
              <Input
                id="question-title"
                maxLength={300}
                placeholder="What does ACID stand for in databases?"
                type="text"
                {...register("title")}
              />
              <FieldError errors={[{ message: errors.title?.message }]} />
            </Field>

            <Field data-invalid={Boolean(errors.body)}>
              <FieldLabel htmlFor="question-body">Body</FieldLabel>
              <Textarea
                className="min-h-28"
                id="question-body"
                maxLength={10000}
                placeholder="What the candidate is asked to do or answer."
                {...register("body")}
              />
              <FieldError errors={[{ message: errors.body?.message }]} />
            </Field>

            {isMcq ? (
              <FieldSet data-invalid={Boolean(optionError || answerError)}>
                <FieldLegend>Options</FieldLegend>
                <FieldDescription>
                  Mark the correct answer. CodeArena auto-grades multiple choice
                  by exact string match, so the marked answer must be one of
                  these options, spelled identically.
                </FieldDescription>

                <FieldGroup>
                  <RadioGroup
                    onValueChange={(value) => syncAnswer(value)}
                    value={correctAnswer}
                  >
                    {rows.map((row, index) => (
                      <div className="flex items-center gap-2" key={row.id}>
                        <span
                          aria-hidden
                          className="w-4 shrink-0 text-center font-mono text-xs text-muted-foreground"
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <RadioGroupItem
                          aria-label={`Mark option ${index + 1} as correct`}
                          disabled={row.text === ""}
                          id={`question-option-${row.id}`}
                          value={row.text}
                        />
                        <Input
                          aria-label={`Option ${index + 1}`}
                          className="flex-1"
                          id={`question-option-text-${row.id}`}
                          maxLength={200}
                          onChange={(event) => {
                            const wasCorrect = correctAnswer === row.text;
                            const next = [...rows];
                            next[index] = { ...row, text: event.target.value };
                            syncRows(next);
                            if (wasCorrect) syncAnswer(event.target.value);
                          }}
                          placeholder={`Option ${index + 1}`}
                          type="text"
                          value={row.text}
                        />
                        <Button
                          aria-label={`Remove option ${index + 1}`}
                          disabled={rows.length <= MIN_OPTIONS}
                          onClick={() => {
                            syncRows(
                              rows.filter((entry) => entry.id !== row.id),
                            );
                            if (correctAnswer === row.text) syncAnswer("");
                          }}
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    ))}
                  </RadioGroup>

                  <Button
                    className="self-start"
                    disabled={rows.length >= MAX_OPTIONS}
                    onClick={() => syncRows([...rows, newOption()])}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <PlusIcon className="size-3.5" />
                    Add option
                  </Button>
                </FieldGroup>

                <FieldError errors={[{ message: optionError }]} />
                <FieldError errors={[{ message: answerError }]} />
              </FieldSet>
            ) : (
              <Field>
                <FieldLabel htmlFor="question-reference">
                  Reference answer (optional)
                </FieldLabel>
                <Textarea
                  className="min-h-20"
                  id="question-reference"
                  maxLength={2000}
                  onChange={(event) => syncAnswer(event.target.value)}
                  placeholder="Guidance for the evaluator. Never shown to the candidate."
                  value={correctAnswer}
                />
                <FieldDescription>
                  {type === "CODING"
                    ? "A coding task is graded by hand, so this is guidance rather than an auto-graded key."
                    : "A written answer is graded by hand, so this is guidance rather than an auto-graded key."}
                </FieldDescription>
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="question-tags">Tags</FieldLabel>
              <TagInput id="question-tags" onChange={setTags} value={tags} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              disabled={pending}
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={pending} type="submit">
              {pending ? <Spinner /> : null}
              {pending ? "Saving" : isEdit ? "Save changes" : "Add question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
