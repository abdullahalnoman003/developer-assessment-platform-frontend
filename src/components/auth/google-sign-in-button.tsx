"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { googleLoginAction } from "@/app/(authentication)/_actions/auth";
import { useAuthComplete } from "@/components/auth/use-auth-complete";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ACTION_MESSAGES } from "@/lib/messages";

export function GoogleSignInButton({
  role,
}: {
  role?: "CANDIDATE" | "RECRUITER";
}) {
  const complete = useAuthComplete();
  const [pending, startTransition] = useTransition();

  const handleCredential = (credential?: string) => {
    if (!credential) {
      toast.error(ACTION_MESSAGES.google.failure);
      return;
    }
    startTransition(async () => {
      const result = await googleLoginAction(credential, role);
      if (result.status === "success" && result.redirectTo) {
        complete(result.redirectTo, ACTION_MESSAGES.google.success);
        return;
      }
      toast.error(result.message);
    });
  };

  if (pending) {
    return (
      <Button className="w-full" disabled size="lg" variant="outline">
        <Spinner />
        Completing Google sign-in
      </Button>
    );
  }

  return (
    <div className="flex w-full justify-center" data-slot="google-sign-in">
      <GoogleLogin
        containerProps={{ className: "w-full [&>div]:w-full" }}
        onError={() => toast.error(ACTION_MESSAGES.google.failure)}
        onSuccess={(response) => handleCredential(response.credential)}
        shape="rectangular"
        size="large"
        text="continue_with"
        theme="outline"
        type="standard"
        width="400"
      />
    </div>
  );
}
