"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { updateProfileAction } from "@/app/(profileSection)/_actions/profile";
import { TagInput } from "@/components/shared/tag-input";
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
import { useActionToast } from "@/hooks/use-action-toast";
import { updateProfileSchema } from "@/lib/validations";

type FormValues = z.input<typeof updateProfileSchema>;
type FormOutput = z.output<typeof updateProfileSchema>;

const SKILLS_MAX = 50;

export function CandidateProfileForm({
  user,
}: {
  user: {
    phone: string | null;
    bio: string | null;
    skills: string[];
    resumeUrl: string | null;
    githubUrl: string | null;
  };
}) {
  const { state, formAction, isPending } = useActionToast(updateProfileAction);
  const [, startTransition] = useTransition();

  const form = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      phone: user.phone ?? "",
      bio: user.bio ?? "",
      skills: user.skills ?? [],
      resumeUrl: user.resumeUrl ?? "",
      githubUrl: user.githubUrl ?? "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (state.status === "success") {
      form.reset({
        phone: user.phone ?? "",
        bio: user.bio ?? "",
        skills: user.skills ?? [],
        resumeUrl: user.resumeUrl ?? "",
        githubUrl: user.githubUrl ?? "",
      });
    }
  }, [
    state.status,
    form,
    user.phone,
    user.bio,
    user.skills,
    user.resumeUrl,
    user.githubUrl,
  ]);

  const onSubmit = form.handleSubmit((values) => {
    const data = new FormData();
    data.set("phone", values.phone ?? "");
    data.set("bio", values.bio ?? "");
    data.set("skills", JSON.stringify(values.skills ?? []));
    data.set("resumeUrl", values.resumeUrl ?? "");
    data.set("githubUrl", values.githubUrl ?? "");

    startTransition(() => {
      formAction(data);
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
        <Field data-invalid={Boolean(form.formState.errors.phone)}>
          <FieldLabel htmlFor="profile-phone">Phone</FieldLabel>
          <Input
            id="profile-phone"
            maxLength={500}
            placeholder="+1 (555) 123-4567"
            type="tel"
            {...form.register("phone")}
          />
          <FieldDescription>
            Optional. Shown to recruiters when they review your attempt.
          </FieldDescription>
          <FieldError
            errors={[{ message: form.formState.errors.phone?.message }]}
          />
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.bio)}>
          <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
          <Textarea
            id="profile-bio"
            maxLength={500}
            placeholder="A short summary of your background and interests."
            rows={4}
            {...form.register("bio")}
          />
          <FieldDescription>
            Optional. Appears on your candidate profile.
          </FieldDescription>
          <FieldError
            errors={[{ message: form.formState.errors.bio?.message }]}
          />
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.skills)}>
          <FieldLabel htmlFor="profile-skills">Skills</FieldLabel>
          <TagInput
            id="profile-skills"
            max={SKILLS_MAX}
            onChange={(tags) => form.setValue("skills", tags as never)}
            value={form.watch("skills") ?? []}
          />
          <FieldDescription>
            Add skills that describe your expertise. Press Enter or comma to add
            a tag. Maximum {SKILLS_MAX}.
          </FieldDescription>
          <FieldError
            errors={[{ message: form.formState.errors.skills?.message }]}
          />
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.resumeUrl)}>
          <FieldLabel htmlFor="profile-resume">Resume URL</FieldLabel>
          <Input
            id="profile-resume"
            maxLength={500}
            placeholder="https://cdn.example.com/resume.pdf"
            type="url"
            {...form.register("resumeUrl")}
          />
          <FieldDescription>
            CodeArena has no upload endpoint — paste a URL to a PDF you host.
            Leave blank to remove.
          </FieldDescription>
          <FieldError
            errors={[{ message: form.formState.errors.resumeUrl?.message }]}
          />
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.githubUrl)}>
          <FieldLabel htmlFor="profile-github">GitHub URL</FieldLabel>
          <Input
            id="profile-github"
            maxLength={500}
            placeholder="https://github.com/yourname"
            type="url"
            {...form.register("githubUrl")}
          />
          <FieldDescription>
            Optional. Shown on your public candidate profile.
          </FieldDescription>
          <FieldError
            errors={[{ message: form.formState.errors.githubUrl?.message }]}
          />
        </Field>
      </FieldGroup>

      <Button disabled={isPending} type="submit">
        {isPending ? <Spinner /> : null}
        {isPending ? "Saving" : "Save changes"}
      </Button>
    </form>
  );
}
