import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { authService } from "@/service/auth";

export default async function AuthenticationLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await authService.currentUser();

  return (
    <div className="flex min-h-dvh flex-col bg-grid-faint">
      <Navbar user={user} />
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center sm:py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
