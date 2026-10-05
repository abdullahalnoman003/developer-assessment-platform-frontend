import { redirect } from "next/navigation";
import { LoginForm } from "@/app/(authentication)/_components/login-form";
import { ROLE_HOME } from "@/lib/constants";
import { safeRedirect } from "@/lib/redirect";
import { pageMetadata } from "@/lib/seo";
import { authService } from "@/service/auth";

export const metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to your CodeArena account.",
  path: "/login",
  noIndex: true,
});

function resetNotice(value: string | string[] | undefined): string | null {
  return value === "1"
    ? "Password updated. Sign in with your new password."
    : null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await authService.currentUser();
  if (user) redirect(ROLE_HOME[user.role]);

  const params = await searchParams;
  const single = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const redirectTo = safeRedirect(single(params.redirectTo), "") || null;
  const notice =
    resetNotice(params.reset) ??
    (params.registered === "1" ? "Account created. Sign in below." : null);

  return (
    <LoginForm
      googleEnabled={Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)}
      notice={notice}
      redirectTo={redirectTo}
    />
  );
}
