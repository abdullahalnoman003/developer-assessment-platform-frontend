"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

function GoogleAuth({ children }: { children: ReactNode }) {
  if (!GOOGLE_CLIENT_ID) return children;
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <GoogleAuth>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster
          position="top-center"
          gutter={8}
          toastOptions={{
            className:
              "rounded-none border border-border bg-popover text-popover-foreground shadow-lg",
          }}
        />
      </GoogleAuth>
    </ThemeProvider>
  );
}
