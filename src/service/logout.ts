"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAuthCookies } from "@/lib/api";

export async function logout(): Promise<never> {
  await clearAuthCookies();
  revalidatePath("/", "layout");
  redirect("/login");
}
