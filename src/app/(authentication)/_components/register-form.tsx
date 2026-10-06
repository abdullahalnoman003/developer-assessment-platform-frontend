"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BriefcaseIcon,
  TriangleAlertIcon,
  UserIcon,
  UserRoundPlusIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { registerAction } from "@/app/(authentication)/_actions/auth";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useAuthComplete } from "@/components/auth/use-auth-complete";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import { type ActionState, IDLE_ACTION_STATE } from "@/lib/types";
import { type RegisterInput, registerSchema } from "@/lib/validations";

const ROLE_OPTIONS = [
  {
    value: "CANDIDATE",
    label: "Candidate",
    description: "Take assessments, track attempts and view released results.",
    Icon: UserIcon,
  },
  {
    value: "RECRUITER",
    label: "Recruiter",
    description: "Build question banks, publish assessments and evaluate.",
    Icon: BriefcaseIcon,
  },
] as const;

function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

const SCORE_LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];

function StrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const score = passwordScore(password);
  return (
    <div className="flex items-center gap-2">
      <Progress aria-hidden className="h-1.5 w-full" value={score * 25} />
      <span className="font-mono text-xs text-muted-foreground">
        {SCORE_LABELS[score]}
      </span>
    </div>
  );
}

export function RegisterForm({
  initialRole,
  redirectTo,
  googleEnabled,
}: {
  initialRole: "CANDIDATE" | "RECRUITER";
  redirectTo: string | null;
  googleEnabled: boolean;
}) {
  const complete = useAuthComplete();
  const [state, setState] = useState<ActionState>(IDLE_ACTION_STATE);
  const [pending, startTransition] = useTransition();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: initialRole },
  });

  const { handleSubmit, register, setError, setValue, watch } = form;
  const password = watch("password") ?? "";

  const onSubmit = handleSubmit((values) => {
    const data = new FormData();
    data.set("name", values.name);
    data.set("email", values.email);
    data.set("password", values.password);
    data.set("role", values.role);
    if (redirectTo) data.set("redirectTo", redirectTo);

    startTransition(async () => {
      const result = await registerAction(IDLE_ACTION_STATE, data);
      setState(result);
      if (result.status === "success" && result.redirectTo) {
        complete(result.redirectTo, result.message);
        return;
      }
      for (const [name, messages] of Object.entries(result.fieldErrors)) {
        if (name !== "form" && messages[0]) {
          setError(name as keyof RegisterInput, { message: messages[0] });
        }
      }
    });
  });

  const selectedRole = watch("role");

  return (
    <Card className="animate-auth-in overflow-hidden border-border/80 shadow-xl">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-gradient-brand"
      />
      <CardHeader className="gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand ring-1 ring-brand/15">
          <UserRoundPlusIcon className="size-5" />
        </span>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm/relaxed text-muted-foreground">
          Pick a role now. You can add a company later as a recruiter.
        </p>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" noValidate onSubmit={onSubmit}>
          {state.status === "error" ? (
            <p
              className="flex items-start gap-2.5 rounded-lg border border-destructive/35 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
              role="alert"
            >
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
              {state.message || VALIDATION_MESSAGES.unknown}
            </p>
          ) : null}

          <FieldGroup>
            <FieldSet>
              <FieldLegend variant="label">I am joining as</FieldLegend>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {ROLE_OPTIONS.map(({ value, label, description, Icon }) => {
                  const active = selectedRole === value;
                  return (
                    <label
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3.5 transition-[border-color,background-color,box-shadow] hover:bg-muted/50 has-[:checked]:border-brand/50 has-[:checked]:bg-brand-soft has-[:checked]:shadow-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/40"
                      key={value}
                    >
                      <input
                        checked={active}
                        className="sr-only"
                        name="role"
                        onChange={() =>
                          setValue("role", value, { shouldValidate: true })
                        }
                        type="radio"
                        value={value}
                      />
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                        <Icon className="size-4" />
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="font-heading text-sm font-bold tracking-tight">
                          {label}
                        </span>
                        <span className="text-xs leading-snug text-muted-foreground">
                          {description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </FieldSet>

            <Field data-invalid={Boolean(form.formState.errors.name)}>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                autoComplete="name"
                id="name"
                placeholder="Ada Lovelace"
                {...register("name")}
              />
              <FieldError
                errors={[{ message: form.formState.errors.name?.message }]}
              />
            </Field>

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

            <Field data-invalid={Boolean(form.formState.errors.password)}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                autoComplete="new-password"
                id="password"
                placeholder="At least 6 characters"
                type="password"
                {...register("password")}
              />
              <StrengthMeter password={password} />
              <FieldError
                errors={[{ message: form.formState.errors.password?.message }]}
              />
            </Field>

            <Button disabled={pending} size="lg" type="submit">
              {pending ? <Spinner /> : null}
              {pending ? "Creating account" : "Create account"}
            </Button>
          </FieldGroup>

          {googleEnabled ? <GoogleSignInButton role={initialRole} /> : null}

          <p className="text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link
              className="rounded font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              href={
                redirectTo
                  ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
                  : "/login"
              }
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
