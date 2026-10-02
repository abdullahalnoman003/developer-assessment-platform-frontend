"use server";

import { revalidatePath } from "next/cache";
import { ACTION_MESSAGES, VALIDATION_MESSAGES } from "@/lib/messages";
import type { ActionState } from "@/lib/types";
import { updateProfileSchema } from "@/lib/validations";
import { authService } from "@/service/auth";

function invalid(
  message: string,
  fieldErrors: Record<string, string[]>,
): ActionState {
  return {
    status: "error",
    message,
    fieldErrors,
    redirectTo: null,
    externalUrl: null,
  };
}

function ok(message: string): ActionState {
  return {
    status: "success",
    message,
    fieldErrors: {},
    redirectTo: null,
    externalUrl: null,
  };
}

/**
 * A blank optional URL is an instruction to *clear* it — the backend treats
 * an explicit `null` as "clear this column" (verified against `PUT /companies/me`
 * in Phase 3; the same rule applies to `PATCH /users/me`), so a blank must be
 * sent as `null` rather than dropped, or a field can never be removed.
 */
function nullableField(
  formData: FormData,
  name: string,
): string | null | undefined {
  if (!formData.has(name)) return undefined;
  const value = formData.get(name);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value;
}

/**
 * Any authenticated user can update their own profile — the Identity tab
 * (name, avatarUrl) is available to all roles, and the candidate-specific
 * fields (phone, bio, skills, resumeUrl, githubUrl) are only surfaced on the
 * candidate tab. The server action accepts both, but the tabs gate the UI.
 */
export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await authService.requireUser();

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    avatarUrl: formData.get("avatarUrl") ?? undefined,
    phone: nullableField(formData, "phone"),
    bio: nullableField(formData, "bio"),
    skills: JSON.parse((formData.get("skills") as string) ?? "[]") as string[],
    resumeUrl: nullableField(formData, "resumeUrl"),
    githubUrl: nullableField(formData, "githubUrl"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key =
        issue.path.length > 0 ? issue.path.map(String).join(".") : "form";
      fieldErrors[key] = [issue.message];
    }
    return invalid(VALIDATION_MESSAGES.generic, fieldErrors);
  }

  const res = await authService.updateProfile(parsed.data);

  if (!res.success || !res.data) {
    return invalid(res.message || ACTION_MESSAGES.updateProfile.failure, {});
  }

  revalidatePath("/profile", "page");

  return ok(ACTION_MESSAGES.updateProfile.success);
}
