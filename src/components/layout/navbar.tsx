import { ArrowRightIcon, TerminalIcon } from "lucide-react";
import Link from "next/link";
import { DesktopNav, MobileNav } from "@/components/layout/nav-links";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
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
      className="group flex items-center gap-2 font-heading text-sm font-semibold tracking-tight"
      href="/"
    >
      <span className="flex size-7 items-center justify-center border border-primary/40 bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        <TerminalIcon className="size-4" />
      </span>
      <span className="text-gradient-brand">{APP_NAME}</span>
    </Link>
  );
}

export interface NavbarProps {
  user?: SessionUser | null;
}

export function Navbar({ user = null }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
        <MobileNav user={user} />
        <Brand />

        <DesktopNav />

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />

          {user ? (
            <>
              <LinkButton
                className="hidden sm:inline-flex"
                href={ROLE_HOME[user.role]}
                size="sm"
                variant="outline"
              >
                Dashboard
                <ArrowRightIcon data-icon="inline-end" />
              </LinkButton>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      aria-label="Account menu"
                      className="font-heading"
                      size="icon"
                      variant="outline"
                    >
                      {initials(user.name)}
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="min-w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="flex flex-col gap-0.5">
                      <span className="truncate text-foreground">
                        {user.name}
                      </span>
                      <span className="truncate font-mono text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="font-mono text-xs font-normal text-muted-foreground">
                      {ROLE_LABELS[user.role]}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/profile" />}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      render={<Link href={ROLE_HOME[user.role]} />}
                    >
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className={cn("text-destructive focus:text-destructive")}
                      render={<form action={logout} />}
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
                className="hidden sm:inline-flex"
                href="/register"
                size="sm"
                variant="ghost"
              >
                Create account
              </LinkButton>
              <LinkButton href="/login" size="sm">
                Sign in
                <ArrowRightIcon data-icon="inline-end" />
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
