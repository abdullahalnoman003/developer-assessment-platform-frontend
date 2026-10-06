"use client";

import {
  ArrowRightIcon,
  LayoutDashboardIcon,
  SparklesIcon,
  TerminalIcon,
  UserRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DesktopNav, MobileNav } from "@/components/layout/nav-links";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LinkButton } from "@/components/ui/link-button";
import { APP_NAME, ROLE_HOME, ROLE_LABELS } from "@/lib/constants";
import { initials } from "@/lib/format";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { logout } from "@/service/logout";

function Brand() {
  return (
    <Link
      className="group flex min-w-0 shrink items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      href="/"
    >
      <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-brand text-primary-foreground shadow-glow transition-transform duration-300 group-hover:scale-105">
        <TerminalIcon className="size-4.5" />
        <span
          aria-hidden
          className="absolute inset-0 animate-sheen bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />
      </span>
      <span className="truncate font-heading text-base font-bold tracking-tight text-gradient-brand">
        {APP_NAME}
      </span>
    </Link>
  );
}

export interface NavbarProps {
  user?: SessionUser | null;
}

export function Navbar({ user = null }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // logout() redirects; ignore the thrown redirect and navigate manually
    }
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 glass">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 sm:h-18 sm:gap-3 sm:px-6 lg:px-8">
        <MobileNav user={user} />
        <Brand />

        <DesktopNav />

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ThemeToggle />

          {user ? (
            <>
              <LinkButton
                className="hidden md:inline-flex"
                href={ROLE_HOME[user.role]}
                size="sm"
                variant="outline"
              >
                <LayoutDashboardIcon data-icon="inline-start" />
                Dashboard
              </LinkButton>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      aria-label="Account menu"
                      className="flex size-9 items-center justify-center rounded-md bg-gradient-brand font-heading text-xs font-bold text-primary-foreground shadow-sm transition-[transform,box-shadow] duration-200 hover:shadow-glow focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:scale-95"
                      type="button"
                    />
                  }
                >
                  {initials(user.name)}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-60">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="flex flex-col gap-1 px-2.5 py-2.5 normal-case">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {user.name}
                      </span>
                      <span className="truncate font-mono text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="px-2.5 py-2 font-normal normal-case">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 font-mono text-[0.6875rem] font-semibold tracking-wide text-brand uppercase">
                        <SparklesIcon className="size-3" />
                        {ROLE_LABELS[user.role]}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/profile" />}>
                      <UserRoundIcon data-icon="inline-start" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      render={<Link href={ROLE_HOME[user.role]} />}
                    >
                      <LayoutDashboardIcon data-icon="inline-start" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className={cn("text-destructive focus:text-destructive")}
                      onClick={handleLogout}
                      variant="destructive"
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <LinkButton
                className="hidden md:inline-flex"
                href="/register"
                size="sm"
                variant="ghost"
              >
                Create account
              </LinkButton>
              <LinkButton href="/login" size="sm">
                Sign in
                <ArrowRightIcon
                  className="hidden min-[380px]:block"
                  data-icon="inline-end"
                />
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
