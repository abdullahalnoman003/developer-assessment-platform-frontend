"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { z } from "zod";
import { upsertCompanyAction } from "@/app/(recruiterSection)/_actions/recruiter";
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
import { VALIDATION_MESSAGES } from "@/lib/messages";
import { type ActionState, IDLE_ACTION_STATE } from "@/lib/types";
import { upsertCompanySchema } from "@/lib/validations";

/**
 * `upsertCompanySchema` transforms an empty optional URL into `null`, so its
 * input and output types differ. RHF's third generic expresses that split:
 * `useForm` registers the raw string inputs, while `handleSubmit` hands back
 * the validated output where a blank URL is already `null`.
 */
type CompanyFormValues = z.input<typeof upsertCompanySchema>;
type CompanyFormOutput = z.output<typeof upsertCompanySchema>;

/**
 * A recruiter without a company is a first-class state, not an error, so the
 * same form creates and edits. `PUT /companies/me` is an upsert on the backend;
 * the copy changes to match.
 */
export function CompanyForm({
  defaults,
  isNew,
}: {
  defaults: { name: string; website: string; logoUrl: string };
  isNew: boolean;
}) {
  const [state, setState] = useState<ActionState>(IDLE_ACTION_STATE);
  const [pending, startTransition] = useTransition();

  const form = useForm<CompanyFormValues, unknown, CompanyFormOutput>({
    resolver: zodResolver(upsertCompanySchema),
    defaultValues: defaults,
    mode: "onBlur",
  });

  const { handleSubmit, register, setError } = form;

  const onSubmit = handleSubmit((values) => {
    const data = new FormData();
    // All three fields always go out. The backend treats an explicit `null` as
    // "clear this column" (verified against the live API), so omitting a
    // blank one would make a field impossible to remove.
    data.set("name", values.name ?? "");
    data.set("website", values.website ?? "");
    data.set("logoUrl", values.logoUrl ?? "");

    startTransition(async () => {
      const result = await upsertCompanyAction(IDLE_ACTION_STATE, data);
      setState(result);
      if (result.status === "success") {
        toast.success(result.message);
        return;
      }
      toast.error(result.message || VALIDATION_MESSAGES.unknown);
      for (const [name, messages] of Object.entries(result.fieldErrors)) {
        if (name !== "form" && messages[0]) {
          setError(name as keyof CompanyFormValues, { message: messages[0] });
        }
      }
    });
  });

  return (
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
        <Field data-invalid={Boolean(form.formState.errors.name)}>
          <FieldLabel htmlFor="company-name">Company name</FieldLabel>
          <Input
            autoComplete="organization"
            id="company-name"
            maxLength={150}
            placeholder="Acme Engineering"
            type="text"
            {...register("name")}
          />
          <FieldDescription>
            {isNew
              ? "This creates your company and unlocks questions and assessments."
              : "Shown on every invitation you send."}
          </FieldDescription>
          <FieldError
            errors={[{ message: form.formState.errors.name?.message }]}
          />
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.website)}>
          <FieldLabel htmlFor="company-website">Website</FieldLabel>
          <Input
            autoComplete="url"
            id="company-website"
            inputMode="url"
            placeholder="https://acme.com"
            type="url"
            {...register("website")}
          />
          <FieldDescription>
            Optional. Leave blank to clear it.
          </FieldDescription>
          <FieldError
            errors={[{ message: form.formState.errors.website?.message }]}
          />
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.logoUrl)}>
          <FieldLabel htmlFor="company-logo">Logo URL</FieldLabel>
          <Input
            autoComplete="url"
            id="company-logo"
            inputMode="url"
            placeholder="https://cdn.acme.com/logo.png"
            type="url"
            {...register("logoUrl")}
          />
          <FieldDescription>
            CodeArena has no upload endpoint, so this is a URL to an image you
            already host. Leave blank for none.
          </FieldDescription>
          <FieldError
            errors={[{ message: form.formState.errors.logoUrl?.message }]}
          />
        </Field>

        <Button disabled={pending} type="submit">
          {pending ? <Spinner /> : null}
          {pending ? "Saving" : isNew ? "Create company" : "Save changes"}
        </Button>
      </FieldGroup>
    </form>
  );
}
