import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/app/(authentication)/_components/forgot-password-form";
import { ROLE_HOME } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";
import { authService } from "@/service/auth";

export const metadata = pageMetadata({
  title: "Forgot password",
  description: "Request a link to reset your CodeArena password.",
  path: "/forgot-password",
  noIndex: true,
});

export default async function ForgotPasswordPage() {
  const user = await authService.currentUser();
  if (user) redirect(ROLE_HOME[user.role]);

  return <ForgotPasswordForm />;
}
