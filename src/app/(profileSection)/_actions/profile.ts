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

// a blank optional field is sent as null, which is how the API clears a column
function nullableField(
  formData: FormData,
  name: string,
): string | null | undefined {
  if (!formData.has(name)) return undefined;
  const value = formData.get(name);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value;
}

// undefined means the field was absent, null means it could not be read
function parseJsonStringList(
  value: FormDataEntryValue | null,
): string[] | null | undefined {
  if (value === null) return undefined;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "") return [];
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed.map(String) : null;
  } catch {
    return null;
  }
}

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await authService.requireUser();

  const skills = parseJsonStringList(formData.get("skills"));
  if (skills === null) {
    return invalid(VALIDATION_MESSAGES.generic, {
      skills: ["Skills could not be read. Please try again."],
    });
  }

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name") ?? undefined,
    avatarUrl: formData.get("avatarUrl") ?? undefined,
    phone: nullableField(formData, "phone"),
    bio: nullableField(formData, "bio"),
    skills,
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
