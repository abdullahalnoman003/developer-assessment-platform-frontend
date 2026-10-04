"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ACTION_MESSAGES, VALIDATION_MESSAGES } from "@/lib/messages";
import type { ActionState, UserStatus } from "@/lib/types";
import { adminService } from "@/service/admin";
import { authService } from "@/service/auth";

const payloadSchema = z.object({
  userId: z.string().trim().min(1, "User id is required"),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

function invalid(
  message: string,
  fieldErrors: Record<string, string[]>,
): ActionState {
  return { status: "error", message, fieldErrors, redirectTo: null };
}

export async function updateUserStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await authService.requireUser();
  if (!admin || admin.role !== "ADMIN") {
    return invalid(VALIDATION_MESSAGES.forbidden, {});
  }

  const parsed = payloadSchema.safeParse({
    userId: formData.get("userId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return invalid(
      VALIDATION_MESSAGES.generic,
      Object.fromEntries(
        parsed.error.issues.map((issue) => [
          String(issue.path?.[0] ?? "form"),
          [issue.message],
        ]),
      ),
    );
  }

  const { userId, status } = parsed.data;
  const res = await adminService.updateUser(userId, { status });

  if (!res.success || !res.data) {
    return invalid(res.message || ACTION_MESSAGES.updateUserStatus.failure, {});
  }

  revalidatePath("/dashboard/admin/users", "page");
  revalidatePath("/dashboard/admin", "page");

  const next: UserStatus = res.data.status;
  return {
    status: "success",
    message:
      next === "ACTIVE"
        ? `${res.data.name} can sign in again.`
        : `${res.data.name} is suspended and cannot sign in.`,
    fieldErrors: {},
    redirectTo: null,
  };
}
