"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  EyeIcon,
  EyeOffIcon,
  LockKeyholeIcon,
  TriangleAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { resetPasswordAction } from "@/app/(authentication)/_actions/auth";
import { useAuthComplete } from "@/components/auth/use-auth-complete";
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
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { type ActionState, IDLE_ACTION_STATE } from "@/lib/types";
import {
  type ResetPasswordInput,
  resetPasswordSchema,
} from "@/lib/validations";

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

export function ResetPasswordForm({ token }: { token: string }) {
  const complete = useAuthComplete();
  const [state, setState] = useState<ActionState>(IDLE_ACTION_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const { handleSubmit, register, setError, watch } = form;
  const password = watch("password") ?? "";

  const onSubmit = handleSubmit((values) => {
    const data = new FormData();
    data.set("token", token);
    data.set("password", values.password);
    data.set("confirmPassword", values.confirmPassword);

    startTransition(async () => {
      const result = await resetPasswordAction(IDLE_ACTION_STATE, data);
      setState(result);
      if (result.status === "success" && result.redirectTo) {
        complete(result.redirectTo, result.message);
        return;
      }
      for (const [name, messages] of Object.entries(result.fieldErrors)) {
        if (name !== "form" && messages[0]) {
          setError(name as keyof ResetPasswordInput, {
            message: messages[0],
          });
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
          <LockKeyholeIcon className="size-5" />
        </span>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Choose a new password
        </h1>
        <CardDescription className="text-sm/relaxed">
          Pick something you have not used here before. You will be signed out
          everywhere else.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" noValidate onSubmit={onSubmit}>
          {state.status === "error" ? (
            <div
              className="flex flex-col gap-3 rounded-lg border border-destructive/35 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
              role="alert"
            >
              <p className="flex items-start gap-2.5">
                <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
                {state.message}
              </p>
              <Link
                className="w-fit rounded font-semibold underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                href="/forgot-password"
              >
                Request a new link
              </Link>
            </div>
          ) : null}

          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.password)}>
              <FieldLabel htmlFor="password">New password</FieldLabel>
              <div className="relative">
                <Input
                  autoComplete="new-password"
                  className="pr-10"
                  id="password"
                  placeholder="At least 6 characters"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                />
                <Button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 px-3"
                  onClick={() => setShowPassword((value) => !value)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </Button>
              </div>
              <StrengthMeter password={password} />
              <FieldError
                errors={[{ message: form.formState.errors.password?.message }]}
              />
            </Field>

            <Field
              data-invalid={Boolean(form.formState.errors.confirmPassword)}
            >
              <FieldLabel htmlFor="confirmPassword">
                Confirm new password
              </FieldLabel>
              <Input
                autoComplete="new-password"
                id="confirmPassword"
                placeholder="Repeat your new password"
                type={showPassword ? "text" : "password"}
                {...register("confirmPassword")}
              />
              <FieldError
                errors={[
                  { message: form.formState.errors.confirmPassword?.message },
                ]}
              />
            </Field>

            <Button disabled={pending} size="lg" type="submit">
              {pending ? <Spinner /> : null}
              {pending ? "Updating password" : "Update password"}
            </Button>
          </FieldGroup>

          <p className="text-center text-sm text-muted-foreground">
            Changed your mind?{" "}
            <Link
              className="rounded font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              href="/login"
            >
              Back to sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
