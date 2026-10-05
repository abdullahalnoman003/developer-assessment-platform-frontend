import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { authService } from "@/service/auth";

export default async function PublicSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await authService.currentUser();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
