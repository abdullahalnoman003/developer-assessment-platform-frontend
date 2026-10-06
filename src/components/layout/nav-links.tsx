"use client";

import { MenuIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS, ROLE_HOME } from "@/lib/constants";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";

function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="ml-4 hidden items-center gap-1 lg:flex xl:ml-6"
    >
      {NAV_LINKS.map((link) => {
        const active = isActiveHref(pathname, link.href);

        return (
          <LinkButton
            aria-current={active ? ("page" as const) : undefined}
            className={cn(
              "relative rounded-full px-3.5 transition-colors",
              active &&
                "bg-brand-soft font-semibold text-brand hover:bg-brand-soft",
            )}
            key={link.href}
            href={link.href}
            size="sm"
            variant="ghost"
          >
            {link.label}
            {active ? (
              <span
                aria-hidden
                className="absolute -bottom-px left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-gradient-brand"
              />
            ) : null}
          </LinkButton>
        );
      })}
    </nav>
  );
}

const linkClass =
  "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none aria-[current=page]:bg-brand-soft aria-[current=page]:text-brand";

export function MobileNav({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            aria-label="Open navigation menu"
            className="lg:hidden"
            size="icon"
            variant="outline"
          >
            <MenuIcon className="size-4.5" />
          </Button>
        }
      />
      <SheetContent className="w-[min(20rem,85vw)] p-0 sm:max-w-80" side="left">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="font-heading text-base font-bold tracking-tight">
            Explore
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Everything CodeArena has to offer.
          </SheetDescription>
        </SheetHeader>

        <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
          {NAV_LINKS.map((link) => (
            <SheetClose
              key={link.href}
              render={
                <Link
                  aria-current={
                    isActiveHref(pathname, link.href)
                      ? ("page" as const)
                      : undefined
                  }
                  className={linkClass}
                  href={link.href}
                />
              }
            >
              {link.label}
            </SheetClose>
          ))}
          <SheetClose
            render={
              <Link
                aria-current={
                  isActiveHref(pathname, "/terms")
                    ? ("page" as const)
                    : undefined
                }
                className={linkClass}
                href="/terms"
              />
            }
          >
            Terms
          </SheetClose>
        </nav>

        <SheetFooter className="mt-auto gap-2 border-t border-border p-4">
          {user ? (
            <>
              <div className="mb-1 flex items-center gap-3 rounded-xl bg-muted/60 p-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-brand font-heading text-sm font-bold text-primary-foreground">
                  {user.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {user.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </span>
              </div>
              <SheetClose className="w-full" render={<Link href="/profile" />}>
                <UserRoundIcon data-icon="inline-start" />
                Profile
              </SheetClose>
              <SheetClose render={<Link href={ROLE_HOME[user.role]} />}>
                Go to dashboard
              </SheetClose>
            </>
          ) : (
            <>
              <SheetClose
                render={
                  <LinkButton href="/register" size="lg" variant="outline" />
                }
              >
                Create account
              </SheetClose>
              <SheetClose render={<LinkButton href="/login" size="lg" />}>
                Sign in
              </SheetClose>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
