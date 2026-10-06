"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  InfoIcon,
  KeyRoundIcon,
  MailCheckIcon,
  TriangleAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { forgotPasswordAction } from "@/app/(authentication)/_actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { type ActionState, IDLE_ACTION_STATE } from "@/lib/types";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/lib/validations";

export function ForgotPasswordForm() {
  const [state, setState] = useState<ActionState>(IDLE_ACTION_STATE);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const { handleSubmit, register, setError } = form;

  const onSubmit = handleSubmit((values) => {
    const data = new FormData();
    data.set("email", values.email);

    startTransition(async () => {
      const result = await forgotPasswordAction(IDLE_ACTION_STATE, data);
      setState(result);
      if (result.status === "success") {
        setSentTo(values.email);
        return;
      }
      for (const [name, messages] of Object.entries(result.fieldErrors)) {
        if (name !== "form" && messages[0]) {
          setError(name as keyof ForgotPasswordInput, { message: messages[0] });
        }
      }
    });
  });

  return (
    <Card className="animate-auth-in overflow-hidden border-border/80 shadow-xl">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-gradient-brand"
      />
      <CardHeader className="gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand ring-1 ring-brand/15">
          <KeyRoundIcon className="size-5" />
        </span>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Reset your password
        </h1>
        <CardDescription className="text-sm/relaxed">
          {sentTo
            ? "We have sent you a reset link. Follow it to choose a new password."
            : "Enter your account email and we will send you a link to choose a new password."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sentTo ? (
          <div className="flex flex-col gap-5">
            <output className="flex items-start gap-2.5 rounded-lg border border-success/35 bg-success/10 px-3.5 py-2.5 text-sm text-success">
              <MailCheckIcon className="mt-0.5 size-4 shrink-0" />
              <span>
                If an account exists for{" "}
                <span className="font-semibold break-all">{sentTo}</span>, a
                reset link is on its way. It expires in 15 minutes.
              </span>
            </output>

            <Button
              onClick={() => {
                setSentTo(null);
                setState(IDLE_ACTION_STATE);
                form.reset();
              }}
              type="button"
              variant="outline"
            >
              Use a different email
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Remembered it?{" "}
              <Link
                className="rounded font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                href="/login"
              >
                Back to sign in
              </Link>
            </p>
          </div>
        ) : (
          <form className="flex flex-col gap-5" noValidate onSubmit={onSubmit}>
            {state.status === "error" ? (
              <p
                className="flex items-start gap-2.5 rounded-lg border border-destructive/35 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
                role="alert"
              >
                <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
                {state.message}
              </p>
            ) : null}

            <FieldGroup>
              <Field data-invalid={Boolean(form.formState.errors.email)}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  autoComplete="email"
                  id="email"
                  inputMode="email"
                  placeholder="you@company.com"
                  type="email"
                  {...register("email")}
                />
                <FieldError
                  errors={[{ message: form.formState.errors.email?.message }]}
                />
              </Field>

              <Button disabled={pending} size="lg" type="submit">
                {pending ? <Spinner /> : null}
                {pending ? "Sending link" : "Send reset link"}
              </Button>
            </FieldGroup>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
              For your privacy we confirm the same message whether or not the
              email is registered.
            </p>

            <p className="text-center text-sm text-muted-foreground">
              Remembered it?{" "}
              <Link
                className="rounded font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                href="/login"
              >
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
