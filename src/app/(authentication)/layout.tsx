import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { authService } from "@/service/auth";
import { AuthAside } from "./_components/auth-aside";

export default async function AuthenticationLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await authService.currentUser();

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-mesh-brand" />
        <div className="absolute inset-0 bg-grid-faint opacity-50" />
      </div>

      <div className="relative flex min-h-dvh flex-col">
        <Navbar user={user} />
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
          <div className="grid w-full max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-[1.05fr_minmax(0,26rem)] lg:gap-16 xl:gap-24">
            <AuthAside />
            <div className="mx-auto w-full max-w-md lg:mr-0">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
