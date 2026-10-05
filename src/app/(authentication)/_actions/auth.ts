"use server";

import { revalidatePath } from "next/cache";
import { setAuthCookies } from "@/lib/api";
import { DEMO_ACCOUNTS, ROLE_HOME } from "@/lib/constants";
import { ACTION_MESSAGES, VALIDATION_MESSAGES } from "@/lib/messages";
import { safeRedirect } from "@/lib/redirect";
import type { ActionState } from "@/lib/types";
import {
  forgotPasswordSchema,
  googleLoginSchema,
  type LoginInput,
  loginSchema,
  type RegisterInput,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validations";
import { authService } from "@/service/auth";

const ROLE_VALUES = new Set<string>(["CANDIDATE", "RECRUITER", "ADMIN"]);

function failed(message: string): ActionState {
  return { status: "error", message, fieldErrors: {}, redirectTo: null };
}

function fieldErrors(
  issues: readonly { path?: readonly PropertyKey[]; message?: string }[],
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const issue of issues) {
    if (!issue.message) continue;
    const key = String(issue.path?.[0] ?? "form");
    const bucket = result[key] ?? [];
    bucket.push(issue.message);
    result[key] = bucket;
  }
  return result;
}

function invalid(
  message: string,
  errors: Record<string, string[]>,
): ActionState {
  return { status: "error", message, fieldErrors: errors, redirectTo: null };
}

function parseFormData(formData: FormData): Record<string, unknown> {
  return {
    name: formData.get("name") ?? undefined,
    email: formData.get("email") ?? undefined,
    password: formData.get("password") ?? undefined,
    role: formData.get("role") ?? undefined,
  };
}

async function establishSession(
  accessToken: string,
  refreshToken: string,
  requestedRedirect: string | null,
): Promise<ActionState> {
  await setAuthCookies({ accessToken, refreshToken });

  const user = await authService.currentUser(accessToken);
  if (!user) {
    return failed(VALIDATION_MESSAGES.unknown);
  }

  revalidatePath("/", "layout");

  return {
    status: "success",
    message: ACTION_MESSAGES.login.success,
    fieldErrors: {},
    redirectTo: safeRedirect(requestedRedirect, ROLE_HOME[user.role]),
  };
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return invalid(
      VALIDATION_MESSAGES.generic,
      fieldErrors(parsed.error.issues),
    );
  }

  const payload: LoginInput = parsed.data;
  const res = await authService.login(payload);
  if (!res.success || !res.data) {
    return failed(res.message || ACTION_MESSAGES.login.failure);
  }

  const requested = formData.get("redirectTo");
  return establishSession(
    res.data.accessToken,
    res.data.refreshToken,
    typeof requested === "string" ? requested : null,
  );
}

export async function demoLoginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const role = formData.get("role");
  if (typeof role !== "string" || !ROLE_VALUES.has(role)) {
    return failed(VALIDATION_MESSAGES.generic);
  }

  const account = DEMO_ACCOUNTS.find((entry) => entry.role === role);
  if (!account) return failed(VALIDATION_MESSAGES.unknown);

  const res = await authService.login({
    email: account.email,
    password: account.password,
  });
  if (!res.success || !res.data) {
    return failed(res.message || ACTION_MESSAGES.login.failure);
  }

  const requested = formData.get("redirectTo");
  const outcome = await establishSession(
    res.data.accessToken,
    res.data.refreshToken,
    typeof requested === "string" ? requested : null,
  );
  return outcome.status === "success"
    ? { ...outcome, message: ACTION_MESSAGES.login.success }
    : outcome;
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return invalid(
      VALIDATION_MESSAGES.generic,
      fieldErrors(parsed.error.issues),
    );
  }

  const payload: RegisterInput = parsed.data;

  const created = await authService.register(payload);
  if (!created.success) {
    const alreadyExists = created.statusCode === 409;
    return {
      ...failed(created.message || ACTION_MESSAGES.register.failure),
      fieldErrors: alreadyExists ? { email: [created.message] } : {},
    };
  }

  const login = await authService.login({
    email: payload.email,
    password: payload.password,
  });
  if (!login.success || !login.data) {
    return {
      status: "success",
      message: "Account created. Please sign in to continue.",
      fieldErrors: {},
      redirectTo: "/login?registered=1",
    };
  }

  const session = await establishSession(
    login.data.accessToken,
    login.data.refreshToken,
    null,
  );
  if (session.status !== "success") return session;

  return { ...session, message: ACTION_MESSAGES.register.success };
}

export async function googleLoginAction(
  idToken: string,
  role?: "CANDIDATE" | "RECRUITER",
): Promise<ActionState> {
  const parsed = googleLoginSchema.safeParse({ idToken, role });
  if (!parsed.success) {
    return failed(ACTION_MESSAGES.google.failure);
  }

  const res = await authService.google(parsed.data.idToken, parsed.data.role);
  if (!res.success || !res.data) {
    return failed(res.message || ACTION_MESSAGES.google.failure);
  }

  return establishSession(res.data.accessToken, res.data.refreshToken, null);
}

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email") ?? undefined,
  });
  if (!parsed.success) {
    return invalid(
      VALIDATION_MESSAGES.generic,
      fieldErrors(parsed.error.issues),
    );
  }

  const res = await authService.forgotPassword(parsed.data);
  if (!res.success) {
    return failed(res.message || ACTION_MESSAGES.forgotPassword.failure);
  }

  return {
    status: "success",
    message: res.message || ACTION_MESSAGES.forgotPassword.success,
    fieldErrors: {},
    redirectTo: null,
  };
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = formData.get("token");
  if (typeof token !== "string" || token.length === 0) {
    return failed("This reset link is missing its token. Request a new one.");
  }

  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password") ?? undefined,
    confirmPassword: formData.get("confirmPassword") ?? undefined,
  });
  if (!parsed.success) {
    return invalid(
      VALIDATION_MESSAGES.generic,
      fieldErrors(parsed.error.issues),
    );
  }

  const res = await authService.resetPassword({
    token,
    password: parsed.data.password,
  });
  if (!res.success) {
    return failed(res.message || ACTION_MESSAGES.resetPassword.failure);
  }

  return {
    status: "success",
    message: res.message || ACTION_MESSAGES.resetPassword.success,
    fieldErrors: {},
    redirectTo: "/login?reset=1",
  };
}
