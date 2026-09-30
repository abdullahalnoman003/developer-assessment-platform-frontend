import { ArrowRightIcon, TerminalIcon } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_NAME, NAV_LINKS, ROLE_HOME, ROLE_LABELS } from "@/lib/constants";
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
        <Brand />

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              render={<Link href={link.href} />}
              size="sm"
              variant="ghost"
            >
              {link.label}
            </Button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />

          {user ? (
            <>
              <Button
                className="hidden sm:inline-flex"
                render={<Link href={ROLE_HOME[user.role]} />}
                size="sm"
                variant="outline"
              >
                Dashboard
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
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
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                className="hidden sm:inline-flex"
                render={<Link href="/register" />}
                size="sm"
                variant="ghost"
              >
                Create account
              </Button>
              <Button render={<Link href="/login" />} size="sm">
                Sign in
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
