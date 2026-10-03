"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  demoLoginAction,
  loginAction,
} from "@/app/(authentication)/_actions/auth";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useAuthComplete } from "@/components/auth/use-auth-complete";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { DEMO_ACCOUNTS, ROLE_LABELS } from "@/lib/constants";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import { type ActionState, IDLE_ACTION_STATE } from "@/lib/types";
import { type LoginInput, loginSchema } from "@/lib/validations";

function DemoButtons() {
  const complete = useAuthComplete();
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleDemo = (role: string) => {
    setBusy(role);
    startTransition(async () => {
      const data = new FormData();
      data.set("role", role);
      const result = await demoLoginAction(IDLE_ACTION_STATE, data);
      setBusy(null);
      if (result.status === "success" && result.redirectTo) {
        complete(result.redirectTo, result.message);
        return;
      }
      toast.error(result.message || VALIDATION_MESSAGES.unknown);
    });
  };

  return (
    <div className="flex flex-col gap-2.5">
      <p className="font-heading text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        Demo accounts
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {DEMO_ACCOUNTS.map((account) => {
          const isBusy = busy === account.role;
          return (
            <Button
              key={account.role}
              className="h-auto flex-col items-start gap-1 px-3 py-2.5 text-left"
              disabled={pending}
              onClick={() => handleDemo(account.role)}
              type="button"
              variant="outline"
            >
              <span className="flex w-full items-center gap-1.5 font-heading text-xs">
                {isBusy ? <Spinner /> : null}
                {ROLE_LABELS[account.role]}
              </span>
              <span className="text-[11px] leading-snug font-normal text-muted-foreground">
                {account.blurb}
              </span>
            </Button>
          );
        })}
      </div>
      <FieldDescription>
        One click signs you in with a seeded account. Credentials stay on the
        server.
      </FieldDescription>
    </div>
  );
}

export function LoginForm({
  redirectTo,
  notice,
  googleEnabled,
}: {
  redirectTo: string | null;
  notice: string | null;
  googleEnabled: boolean;
}) {
  const complete = useAuthComplete();
  const [state, setState] = useState<ActionState>(IDLE_ACTION_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { handleSubmit, register, setError } = form;

  const onSubmit = handleSubmit((values) => {
    const data = new FormData();
    data.set("email", values.email);
    data.set("password", values.password);
    if (redirectTo) data.set("redirectTo", redirectTo);

    startTransition(async () => {
      const result = await loginAction(IDLE_ACTION_STATE, data);
      setState(result);
      if (result.status === "success" && result.redirectTo) {
        complete(result.redirectTo, result.message);
        return;
      }
      for (const [name, messages] of Object.entries(result.fieldErrors)) {
        if (name !== "form" && messages[0]) {
          setError(name as keyof LoginInput, { message: messages[0] });
        }
      }
    });
  });

  return (
    <Card>
      <CardHeader>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Sign in
        </h1>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" noValidate onSubmit={onSubmit}>
          {notice ? (
            <output className="block border border-accent-cyan/40 bg-accent-cyan/10 px-3 py-2 text-sm">
              {notice}
            </output>
          ) : null}

          {state.status === "error" ? (
            <p
              className="flex items-start gap-2 border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
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

            <Field data-invalid={Boolean(form.formState.errors.password)}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Input
                  autoComplete="current-password"
                  className="pr-10"
                  id="password"
                  placeholder="Enter your password"
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
              <FieldError
                errors={[{ message: form.formState.errors.password?.message }]}
              />
            </Field>

            <Button disabled={pending} size="lg" type="submit">
              {pending ? <Spinner /> : null}
              {pending ? "Signing in" : "Sign in"}
            </Button>
          </FieldGroup>

          {googleEnabled ? (
            <>
              <FieldSeparator>
                <span className="font-mono text-xs">OR</span>
              </FieldSeparator>
              <GoogleSignInButton />
            </>
          ) : null}

          <FieldSeparator />

          <DemoButtons />

          <p className="text-sm text-muted-foreground">
            No account yet?{" "}
            <Link
              className="font-medium text-primary underline-offset-4 hover:underline"
              href={
                redirectTo
                  ? `/register?redirectTo=${encodeURIComponent(redirectTo)}`
                  : "/register"
              }
            >
              Create one
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
