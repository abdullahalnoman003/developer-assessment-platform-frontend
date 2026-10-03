import { redirect } from "next/navigation";
import { RegisterForm } from "@/app/(authentication)/_components/register-form";
import { ROLE_HOME } from "@/lib/constants";
import { safeRedirect } from "@/lib/redirect";
import { pageMetadata } from "@/lib/seo";
import { authService } from "@/service/auth";

export const metadata = pageMetadata({
  title: "Create account",
  description: "Create a CodeArena account as a candidate or recruiter.",
  path: "/register",
  noIndex: true,
});

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await authService.currentUser();
  if (user) redirect(ROLE_HOME[user.role]);

  const params = await searchParams;
  const single = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const roleParam = single(params.role)?.toUpperCase();
  const initialRole: "CANDIDATE" | "RECRUITER" =
    roleParam === "RECRUITER" ? "RECRUITER" : "CANDIDATE";
  const redirectTo = safeRedirect(single(params.redirectTo), "") || null;

  return (
    <RegisterForm
      googleEnabled={Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)}
      initialRole={initialRole}
      redirectTo={redirectTo}
    />
  );
}
