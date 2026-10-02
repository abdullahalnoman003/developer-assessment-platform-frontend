"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { updateAssessmentDetailsAction } from "@/app/(recruiterSection)/_actions/recruiter";
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { FIELD_ERROR_COPY, VALIDATION_MESSAGES } from "@/lib/messages";
import type { ActionState, Assessment } from "@/lib/types";
import { IDLE_ACTION_STATE } from "@/lib/types";
import { assessmentDetailsFormSchema } from "@/lib/validations";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} type="submit">
      {pending ? <Spinner className="size-3.5" /> : null}
      {pending ? "Saving" : "Save changes"}
    </Button>
  );
}

/**
 * Editing is offered only while the assessment is a draft — the backend refuses
 * any details `PATCH` on a published, closed, or archived assessment, so the
 * page does not render this component at all in those states.
 */
export function AssessmentEditDialog({
  assessment,
}: {
  assessment: Pick<
    Assessment,
    "id" | "title" | "description" | "durationMins" | "passScore"
  >;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateAssessmentDetailsAction,
    IDLE_ACTION_STATE,
  );
  const router = useRouter();

  // No explicit generic: the resolver's *output* type is the form's value type
  // here, and naming it by hand fights the `z.coerce`/`preprocess` pipelines.
  const form = useForm({
    resolver: zodResolver(assessmentDetailsFormSchema),
    defaultValues: {
      title: assessment.title,
      description: assessment.description ?? "",
      durationMins: assessment.durationMins,
      passScore: assessment.passScore,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (state.status === "success") {
      setOpen(false);
      toast.success(state.message);
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message || VALIDATION_MESSAGES.unknown);
    }
  }, [state, router]);

  // `null` from the API means "no pass mark"; the form speaks in strings, so the
  // refetched value is pushed back in whenever the dialog is reopened.
  useEffect(() => {
    if (open) {
      form.reset({
        title: assessment.title,
        description: assessment.description ?? "",
        durationMins: assessment.durationMins,
        passScore: assessment.passScore,
      });
    }
  }, [open, assessment, form]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <PencilIcon className="size-3.5" />
            Edit details
          </Button>
        }
      />
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-base">
            Edit details
          </DialogTitle>
          <DialogDescription>
            Drafts are the only editable state. Publishing locks these fields
            for good.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <input name="assessmentId" type="hidden" value={assessment.id} />

          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.title)}>
              <FieldLabel htmlFor="edit-assessment-title">Title</FieldLabel>
              <Input
                id="edit-assessment-title"
                {...form.register("title")}
                autoComplete="off"
              />
              <FieldError
                errors={[{ message: form.formState.errors.title?.message }]}
              />
            </Field>

            <Field data-invalid={Boolean(form.formState.errors.description)}>
              <FieldLabel htmlFor="edit-assessment-description">
                Description
              </FieldLabel>
              <Textarea
                id="edit-assessment-description"
                rows={4}
                {...form.register("description")}
              />
              <FieldDescription>
                Clear this to remove the description entirely.
              </FieldDescription>
              <FieldError
                errors={[
                  { message: form.formState.errors.description?.message },
                ]}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(form.formState.errors.durationMins)}>
                <FieldLabel htmlFor="edit-assessment-duration">
                  Duration (minutes)
                </FieldLabel>
                <Input
                  id="edit-assessment-duration"
                  inputMode="numeric"
                  type="number"
                  {...form.register("durationMins")}
                />
                <FieldError
                  errors={[
                    {
                      message:
                        form.formState.errors.durationMins?.message ??
                        FIELD_ERROR_COPY["body.durationMins"],
                    },
                  ]}
                />
              </Field>

              <Field data-invalid={Boolean(form.formState.errors.passScore)}>
                <FieldLabel htmlFor="edit-assessment-pass-score">
                  Pass score
                </FieldLabel>
                <Input
                  id="edit-assessment-pass-score"
                  inputMode="numeric"
                  type="number"
                  {...form.register("passScore")}
                />
                <FieldDescription>
                  Points needed to pass. Leave blank for no pass mark.
                </FieldDescription>
                <FieldError
                  errors={[
                    { message: form.formState.errors.passScore?.message },
                  ]}
                />
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <SaveButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
