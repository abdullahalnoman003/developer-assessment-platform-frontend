import { TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/app/(authentication)/_components/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ROLE_HOME } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";
import { authService } from "@/service/auth";

export const metadata = pageMetadata({
  title: "Reset password",
  description: "Choose a new password for your CodeArena account.",
  path: "/reset-password",
  noIndex: true,
});

function InvalidLink() {
  return (
    <Card className="animate-auth-in overflow-hidden border-border/80 shadow-xl">
      <div aria-hidden className="h-1 w-full bg-gradient-brand" />
      <CardHeader className="gap-2.5">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          This link cannot be used
        </h1>
        <CardDescription className="text-sm/relaxed">
          The reset link is missing its token. Open the link straight from your
          email, or request a fresh one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          <p
            className="flex items-start gap-2.5 rounded-lg border border-destructive/35 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
            role="alert"
          >
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
            Reset links expire after 15 minutes and work only once.
          </p>

          <LinkButton href="/forgot-password" size="lg">
            Request a new link
          </LinkButton>

          <p className="text-center text-sm text-muted-foreground">
            Remembered it?{" "}
            <Link
              className="rounded font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              href="/login"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await authService.currentUser();
  if (user) redirect(ROLE_HOME[user.role]);

  const params = await searchParams;
  const raw = params.token;
  const token = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";

  if (!token) return <InvalidLink />;

  return <ResetPasswordForm token={token} />;
}
