"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { updateProfileAction } from "@/app/(profileSection)/_actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useActionToast } from "@/hooks/use-action-toast";
import { isValidHttpUrl } from "@/lib/format";
import { updateProfileSchema } from "@/lib/validations";

type FormValues = z.input<typeof updateProfileSchema>;
type FormOutput = z.output<typeof updateProfileSchema>;

export function IdentityForm({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}) {
  const { state, formAction, isPending } = useActionToast(updateProfileAction);

  const form = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      avatarUrl: user.avatarUrl ?? "",
    },
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit((values) => {
    const data = new FormData();
    data.set("name", values.name ?? "");
    data.set("avatarUrl", values.avatarUrl ?? "");

    formAction(data);
  });

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={onSubmit}>
      {state.status === "error" ? (
        <p
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.name)}>
          <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
          <Input
            id="profile-name"
            maxLength={100}
            placeholder="Jane Doe"
            type="text"
            {...form.register("name")}
          />
          <FieldDescription>
            Your public name, shown on the dashboard and invitation lists.
          </FieldDescription>
          <FieldError
            errors={[{ message: form.formState.errors.name?.message }]}
          />
        </Field>

        <Field data-invalid={Boolean(form.formState.errors.avatarUrl)}>
          <FieldLabel htmlFor="profile-avatar">Avatar URL</FieldLabel>
          <Input
            id="profile-avatar"
            maxLength={1000}
            placeholder="https://cdn.example.com/avatar.png"
            type="url"
            {...form.register("avatarUrl")}
          />
          <FieldDescription>
            CodeArena has no upload endpoint — paste a URL to an image you host.
            Leave blank to remove your avatar.
          </FieldDescription>
          <FieldError
            errors={[{ message: form.formState.errors.avatarUrl?.message }]}
          />
        </Field>
      </FieldGroup>

      <AvatarPreview
        src={form.watch("avatarUrl") ?? undefined}
        name={user.name}
      />

      <Button disabled={isPending} type="submit">
        {isPending ? <Spinner /> : null}
        {isPending ? "Saving" : "Save changes"}
      </Button>
    </form>
  );
}

function AvatarPreview({
  src,
  name,
}: {
  src: string | undefined;
  name: string;
}) {
  const [broken, setBroken] = useState(false);

  if (!isValidHttpUrl(src) || broken) {
    return null;
  }

  return (
    <Avatar size="lg">
      <AvatarImage alt="" onError={() => setBroken(true)} src={src} />
      <AvatarFallback>{name?.charAt(0) ?? "U"}</AvatarFallback>
    </Avatar>
  );
}
