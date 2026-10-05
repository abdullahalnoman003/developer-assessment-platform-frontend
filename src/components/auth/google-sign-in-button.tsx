"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { googleLoginAction } from "@/app/(authentication)/_actions/auth";
import { useAuthComplete } from "@/components/auth/use-auth-complete";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ACTION_MESSAGES } from "@/lib/messages";

const MIN_GOOGLE_WIDTH = 200;
const MAX_GOOGLE_WIDTH = 400;

export function GoogleSignInButton({
  role,
}: {
  role?: "CANDIDATE" | "RECRUITER";
}) {
  const complete = useAuthComplete();
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const measure = () => {
      const next = Math.max(
        MIN_GOOGLE_WIDTH,
        Math.min(MAX_GOOGLE_WIDTH, Math.round(element.offsetWidth)),
      );
      setWidth(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
      <Button className="w-full" disabled variant="outline">
        <Spinner />
        Completing Google sign-in
      </Button>
    );
  }

  return (
    <div
      className="flex w-full justify-center"
      data-slot="google-sign-in"
      ref={containerRef}
    >
      {width > 0 ? (
        <GoogleLogin
          onError={() => toast.error(ACTION_MESSAGES.google.failure)}
          onSuccess={(response) => handleCredential(response.credential)}
          shape="rectangular"
          size={width < 300 ? "small" : "medium"}
          text="continue_with"
          theme="outline"
          type="standard"
          width={String(width)}
        />
      ) : null}
    </div>
  );
}
