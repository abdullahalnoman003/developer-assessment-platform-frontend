"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BriefcaseIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
  UserRoundIcon,
} from "lucide-react";
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
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { DEMO_ACCOUNTS, ROLE_LABELS } from "@/lib/constants";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import { type ActionState, IDLE_ACTION_STATE, type Role } from "@/lib/types";
import { type LoginInput, loginSchema } from "@/lib/validations";

const ROLE_ICON: Record<Role, typeof UserRoundIcon> = {
  ADMIN: ShieldCheckIcon,
  CANDIDATE: UserRoundIcon,
  RECRUITER: BriefcaseIcon,
};

function QuickAccess({ redirectTo }: { redirectTo: string | null }) {
  const complete = useAuthComplete();
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSample = (role: string) => {
    setBusy(role);
    startTransition(async () => {
      const data = new FormData();
      data.set("role", role);
      if (redirectTo) data.set("redirectTo", redirectTo);
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
    <div className="flex flex-col gap-2.5 rounded-xl border border-border/70 bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Quick access
        </p>
        <span className="text-xs text-muted-foreground">Prefilled</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {DEMO_ACCOUNTS.map((account) => {
          const Icon = ROLE_ICON[account.role];
          const isBusy = busy === account.role;
          return (
            <Button
              aria-label={`Sign in as ${ROLE_LABELS[account.role]}. ${account.blurb}`}
              className="group h-auto flex-col gap-1.5 rounded-lg border-border/70 bg-background px-1.5 py-2.5 text-center transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-sm"
              disabled={pending}
              key={account.role}
              onClick={() => handleSample(account.role)}
              title={account.blurb}
              type="button"
              variant="outline"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand ring-1 ring-brand/15">
                {isBusy ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <Icon className="size-3.5" />
                )}
              </span>
              <span className="font-heading text-xs font-bold tracking-tight">
                {ROLE_LABELS[account.role]}
              </span>
            </Button>
          );
        })}
      </div>
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
    <Card className="animate-auth-in overflow-hidden border-border/80 shadow-xl">
      <div aria-hidden className="h-1 w-full bg-gradient-brand" />
      <CardHeader className="gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand ring-1 ring-brand/15">
          <ShieldCheckIcon className="size-5" />
        </span>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Welcome back
        </h1>
        <CardDescription className="text-sm/relaxed">
          Sign in to manage assessments, invitations and results.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" noValidate onSubmit={onSubmit}>
          {notice ? (
            <output className="block rounded-lg border border-info/35 bg-info/10 px-3.5 py-2.5 text-sm text-info">
              {notice}
            </output>
          ) : null}

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
              <Link
                className="w-fit rounded text-xs font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                href="/forgot-password"
              >
                Forgot your password?
              </Link>
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

          <QuickAccess redirectTo={redirectTo} />

          <p className="text-center text-sm text-muted-foreground">
            No account yet?{" "}
            <Link
              className="rounded font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
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
