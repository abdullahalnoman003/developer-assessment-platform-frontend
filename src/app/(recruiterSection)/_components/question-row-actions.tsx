"use client";

import { EyeIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import toast from "react-hot-toast";
import { deleteQuestionAction } from "@/app/(recruiterSection)/_actions/recruiter";
import { QuestionDialog } from "@/app/(recruiterSection)/_components/question-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { correctAnswerLabel, toOptionList, toStringList } from "@/lib/format";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import type { Question } from "@/lib/types";
import { type ActionState, IDLE_ACTION_STATE } from "@/lib/types";

/**
 * Recruiters are the only role that ever sees `correctAnswer`
 * (backend finding #10), so the preview is recruiter-scoped by construction:
 * this component is only ever rendered from `/dashboard/recruiter/questions`.
 */
function QuestionPreview({ question }: { question: Question }) {
  const options = toOptionList(question.options);
  const correct = correctAnswerLabel(question.correctAnswer, options);
  const tags = toStringList(question.tags);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-sm font-semibold">{question.title}</h3>
        <p className="font-mono text-[11px] break-all text-muted-foreground">
          {question.id}
        </p>
      </div>

      <p className="text-sm/relaxed whitespace-pre-wrap">{question.body}</p>

      {options.length > 0 ? (
        <ol className="flex flex-col gap-1.5">
          {options.map((option, index) => {
            const isCorrect = option === correct;
            return (
              <li
                className={
                  isCorrect
                    ? "flex items-start gap-2 border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-sm"
                    : "flex items-start gap-2 border border-border px-2.5 py-1.5 text-sm"
                }
                key={`${question.id}-option-${index}`}
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="min-w-0 flex-1">{option}</span>
                {isCorrect ? (
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                    correct
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : correct ? (
        <div className="border border-border bg-muted/40 px-2.5 py-2">
          <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            Reference answer
          </p>
          <p className="mt-1 text-sm/relaxed whitespace-pre-wrap">{correct}</p>
        </div>
      ) : null}

      {tags.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li
              className="border border-border bg-muted px-1.5 font-mono text-[11px]"
              key={`${question.id}-tag-${tag}`}
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="border-t border-border pt-3 text-xs/relaxed text-muted-foreground">
        Multiple choice is auto-graded by exact string match, so the stored
        answer must stay byte-identical to the option text above.
      </p>
    </div>
  );
}

function DeleteSubmit() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction
      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      disabled={pending}
    >
      {pending ? <Spinner className="size-3.5" /> : null}
      {pending ? "Removing" : "Remove question"}
    </AlertDialogAction>
  );
}

/**
 * Soft delete, confirmed in an `AlertDialog`. The backend implements this as
 * `PATCH /questions/:id` with `{ deletedAt: "now" }`, so a removed question
 * disappears from the bank but any assessment already referencing it keeps
 * working — the copy says so rather than implying a hard delete.
 */
function QuestionDelete({ question }: { question: Question }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    deleteQuestionAction,
    IDLE_ACTION_STATE,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message || VALIDATION_MESSAGES.unknown);
    }
  }, [state, router]);

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            aria-label={`Remove ${question.title}`}
            size="sm"
            variant="ghost"
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove this question?</AlertDialogTitle>
          <AlertDialogDescription>
            &quot;{question.title}&quot; leaves your question bank. Assessments
            that already use it keep their copy and stay runnable — this is a
            soft delete, and it is not reversible from the UI.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <form action={formAction}>
            <input name="questionId" type="hidden" value={question.id} />
            <DeleteSubmit />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function QuestionRowActions({ question }: { question: Question }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Dialog>
        <DialogTrigger
          render={
            <Button
              aria-label={`Preview ${question.title}`}
              size="sm"
              variant="ghost"
            >
              <EyeIcon className="size-3.5" />
            </Button>
          }
        />
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-base">
              Question preview
            </DialogTitle>
            <DialogDescription>
              Exactly what the candidate will be shown, plus the answer key that
              only recruiters can see.
            </DialogDescription>
          </DialogHeader>
          <QuestionPreview question={question} />
        </DialogContent>
      </Dialog>

      <QuestionDialog question={question} />
      <QuestionDelete question={question} />
    </div>
  );
}
